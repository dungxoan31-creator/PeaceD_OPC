# Startup Performance Optimization Design

**Date:** 2026-09-30  
**Status:** draft (pending user review)

## Problem

Starting PeaceD OPC currently exhibits noticeable delays across multiple layers:
1. **Launcher & Dev Runner Delay (`run-electron-vite-dev.mjs`, `start-peaced-opc.bat`)**:
   - `prepareDevWebClient()` performs a synchronous, recursive directory scan of `src/renderer` and `src/shared` (`readdirSync`/`statSync`) on Windows NTFS before Electron spawns, costing 500ms to 2s. If an outdated web client bundle exists, it invokes a full Vite build costing an additional 10–20s.
   - In dev mode on Windows, `main-process-runtime-launch.ts` waits for `shellPathReady` (spawning PowerShell to resolve PATH, taking 500–1500ms) before creating the BrowserWindow, whereas packaged builds already parallelize this.
2. **Main Process Boot Sequential Gating (`src/main/startup/`)**:
   - `initializeMainProcessReady()` awaits `initializeReadyFoundation()` and `initializeReadyRuntimeServices()` serially before creating the main window.
   - Auxiliary services like Plugin System initialization (`initializeMainProcessPlugins` with synchronous disk reads), Browser session proxies (`applyBrowserSessionProxies`), StarNag telemetry, and stale worktree sweeps block window creation.
3. **Renderer Hydration Sequential Gating (`use-app-startup-hydration.ts`)**:
   - The boot chain sequentially loads all local repositories, settles the catalog, fetches all folder workspaces, project groups, and session worktrees before painting the active workspace.
   - `reconnectPersistedTerminals` eagerly reconnects and allocates PTYs for all previously open tabs across all worktrees, overwhelming the event loop and IPC bridge during initial render.

## Goal

Achieve near-instant application window reveal and fast time-to-interactive for both dev launcher (`start-peaced-opc.bat`) and packaged builds (`.exe`):
- Window reveals within hundreds of milliseconds with a responsive skeleton/shell.
- Active workspace and its currently visible terminal tab restore immediately so the user can begin typing right away.
- Secondary repositories, project groups, and background terminal tabs hydrate progressively in the background without blocking user interaction.

## Scope

1. **Launcher & Dev Runner Optimizations**:
   - Update `start-peaced-opc.bat` and `start-peaced-opc.vbs` to set `ORCA_SKIP_DEV_WEB_PREPARE=1`.
   - Update `config/scripts/run-electron-vite-dev.mjs` to short-circuit directory traversals when web prepare is disabled and optimize port discovery.
   - Enable `startWindowsDesktopBeforeShellPathReady` in `main-process-runtime-launch.ts` for Windows development mode as well as packaged builds.
2. **Main Process Boot Deferral**:
   - Defer non-critical startup tasks in `main-process-ready.ts` and `main-process-ready-runtime.ts` using `runAfterFirstWindowShown`:
     - Plugin system discovery and bootstrap (`initializeMainProcessPlugins`).
     - Browser session proxy initialization (`applyBrowserSessionProxies`).
     - Background orphan sweeps (`sweepOrphanedSessions`), StarNag service, and managed hook reconciliation.
   - Open and load the main window as soon as the profile store and runtime RPC transport are wired.
3. **Renderer Hydration & Lazy Terminal Restoration**:
   - In `use-app-startup-hydration.ts`, split the hydration pipeline into:
     - **Critical Path**: Read settings, UI state, active workspace session, hydrate the active worktree, and restore **only the active/visible terminal tab**.
     - **Background Path**: Stream all-host repo catalog scans, project groups, folder workspaces, and defer non-active terminal tabs until activated/focused.
4. **Diagnostics**:
   - Retain full milestone metrics behind `ORCA_STARTUP_DIAGNOSTICS=1` while keeping normal console stdout/stderr clean.

**Out of scope:**
- Rewriting xterm WebGL renderer or replacing the underlying terminal daemon architecture.
- Altering remote SSH daemon wire protocol contracts.

---

## Section 1 — Launcher & Dev Runner Optimizations

### 1.1 Fast Launcher Environment

In `start-peaced-opc.bat` and `start-peaced-opc.vbs`:
- Explicitly inject `set "ORCA_SKIP_DEV_WEB_PREPARE=1"` before executing `node config\scripts\run-electron-vite-dev.mjs`.

### 1.2 `run-electron-vite-dev.mjs` Traversal Bypass

- In `prepareDevWebClient()`:
  - Check `process.env.ORCA_SKIP_DEV_WEB_PREPARE === '1'` immediately before any call to `isDevWebClientFresh()` or `latestMtimeMs()`.
- In `pickDebugPort()`:
  - Test the deterministic base port first; if free, bind immediately without probing 64 incremental ports sequentially.

### 1.3 Windows Dev Mode Window Opening

In `src/main/startup/main-process-runtime-launch.ts`:
- Change:
  ```ts
  if (process.platform === 'win32' && !serveOptions) {
    const desktopStartup = startWindowsDesktopBeforeShellPathReady({
      bindServices: bindTerminalRuntimeStartupServices,
      openWindow: () => options.openMainWindow({ revealOnDidFinishLoad: true }),
      shellPathReady,
      startServices: startTerminalRuntimeStartupServices
    })
    desktopWindow = desktopStartup.window
  }
  ```
- This removes the `app.isPackaged` restriction, allowing the dev environment on Windows to open the main window concurrently while shell PATH hydration runs in the background.

---

## Section 2 — Main Process Aggressive Deferral

### 2.1 Critical Path Narrowing

`initializeMainProcessReady` currently executes:
```ts
await initializeReadyFoundation()
await initializeReadyRuntimeServices()
const i18nAndMenuReady = initializeMainProcessI18nAndMenu()
await Promise.all([i18nAndMenuReady, initializeMainProcessRuntimeLaunch(options)])
```

The critical path for window presentation requires only:
1. Foundation: Profile store loaded, dev identity assigned, and IPC request guards installed.
2. Runtime Services: `runtime` instance instantiated and bound to runtime RPC.
3. Window Launch: Create `BrowserWindow`, register lifecycle listeners, and invoke `loadMainWindow()`.

### 2.2 Tasks Deferred to `runAfterFirstWindowShown`

The following services will be scheduled via `runAfterFirstWindowShown`:
1. `initializeMainProcessPlugins(runtime)`: Plugin kill list reading, bundled plugin bootstrap, and plugin marketplace coordinator.
2. `applyBrowserSessionProxies`: Applies network proxy settings across all auxiliary browser session partitions.
3. `StarNagService.start()`: Survey/star prompt tracking.
4. `agentBrowserBridge.sweepOrphanedSessions()`: Process garbage collection of dangling browser daemon sessions.
5. Hook reconciliation: `installManagedAgentHooks` and `ensureRealHomeCodexHookState`.

This eliminates hundreds of milliseconds of event loop blocking and disk I/O before the initial window appears.

---

## Section 3 — Renderer Hydration & Lazy Terminal Restoration

### 3.1 Two-Phase Startup Hydration

Currently, `useAppStartupHydration.ts` executes a single monolithic `try ... catch` block where every catalog and session fetch blocks terminal restoration.

We split this into:

#### Phase 1: Active Workspace & Active Tab Restoration
1. `fetchSettings()` and `window.api.ui.get()` (restores zoom, layout, and theme).
2. Fetch current workspace session (`fetchWorkspaceSessionWithRuntimeHostOwners`).
3. Locate the `activeWorkspaceKey` and its active tab.
4. Restore PTY state **only for the active tab** of the active worktree.
5. Set `hydrationSucceeded = true` and `terminalStartupRestorationReady = true` for the active workspace so the user has immediate typing focus and responsiveness.

#### Phase 2: Deferred Catalog & Background Tabs
1. Stream `fetchReposForAllHosts({ remoteHosts: 'skip' })`, project groups, and folder workspaces.
2. Register an on-demand hydration handler on tab activation:
   - When a background tab is clicked, if its terminal has not yet attached, mount and reconnect its PTY on demand.
   - Background worktrees that were active in other windows or workspaces hydrate lazily upon selection.

---

## Section 4 — Diagnostics & Verification

### 4.1 Retaining Diagnostics Integrity
- Existing milestone logging (`logStartupMilestone`) remains active when `ORCA_STARTUP_DIAGNOSTICS=1` is provided.
- New milestones added:
  - `active-tab-restored`: Time when the user's active terminal tab is interactive.
  - `deferred-services-started`: Time when `runAfterFirstWindowShown` kicks off background services.

### 4.2 Verification Plan
1. **Typecheck**: `pnpm tc` must pass without errors.
2. **Unit & Integration Tests**:
   - `pnpm test src/main/startup/`
   - `pnpm test src/renderer/src/app-shell/`
   - Verify all startup-related contract tests pass.
3. **Performance Measurement**:
   - Measure startup elapsed time using `ORCA_STARTUP_DIAGNOSTICS=1 node config/scripts/run-electron-vite-dev.mjs` comparing baseline vs optimized times for `window-shown` and `active-tab-restored`.
