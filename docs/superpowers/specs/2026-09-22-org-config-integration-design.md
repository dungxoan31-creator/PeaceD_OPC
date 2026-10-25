# Org Config Integration Design

**Date:** 2026-09-22  
**Status:** approved

## Problem

`org-store.ts` runs entirely in the renderer with `localStorage` as its only persistence backend. All IPC callbacks (`onRequestData`, `onRequestTalents`, `onReorgDecide`) are stubs. The org module has no connection to the actual agent runtime.

Concretely:
- Org config is not scoped per-worktree — one global blob shared across all workspaces.
- Mutations never reach the agent; they die in the React component tree.
- `OrgInfoPayload` mixes config fields (roles, employees, runtime_policy) with runtime state fields (runtime_seats, work_items, frontier) with no separation.

## Goal

Make org config the canonical input to agent runtime: user edits the org in the UI → saved to `.orca/org.yaml` inside the worktree → agent reads it on start. One-way push; agent restart is the apply mechanism.

## Scope

This design covers:
1. A new `OrgConfig` type (config-only subset of `OrgInfoPayload`)
2. Two IPC handlers: `org:readConfig` and `org:writeConfig`
3. Rework of `org-store.ts` to load async from IPC, scoped per worktree
4. A dirty-state UX in `OrgHeader` with an "Apply" button that signals agent restart

**Out of scope:** Runtime state display (seats, work_items, frontier) in the org UI — that is a separate concern owned by the agent runtime module.

---

## Section 1 — File Layout & Data Contract

### Source of truth

`.orca/org.yaml` inside the active worktree root. Each worktree has its own independent org config.

### What goes in the file

Only config fields — fields the user controls and the agent reads on start:

```yaml
# .orca/org.yaml
organization_id: "proj-xyz"
organization_name: "My Project Org"
company_profile: "custom"
final_decider_role_id: "ceo"
top_level_role_ids: ["ceo"]
org_version: 3
runtime_policy:
  communication: { default_mode: "async", blocking_default: false }
  parallel: { auto_dispatch: true, max_workers: 4 }
roles:
  - role_id: "ceo"
    name: "CEO"
    responsibility: "..."
    reports_to: ""
    status: "active"
    can_spawn: []
    tools: []
employees:
  - employee_id: "emp-1"
    name: "Alice"
    role_id: "ceo"
    category: "executive"
    domains: []
    seniority: "senior"
    status: "active"
    tags: []
    skill_refs: []
    experience_score: 10
    learned_skill_refs: []
```

### What does NOT go in the file

| Field group | Reason |
|---|---|
| `runtime_seats`, `work_items`, `frontier` | Agent-owned runtime state, not user config |
| `channels`, `connectors` | Runtime infrastructure, not part of org structure |
| `runtime_topology_preview`, `work_item_runtime_preview` | Computed, not persisted |

### New shared type

```ts
// src/shared/org-config.ts  (new file)
import type { OrgRole, OrgEmployee } from '../renderer/src/components/org/types'
import type { RuntimePolicy } from '../renderer/src/components/org/types-runtime'

export type OrgConfig = {
  organization_id?: string
  organization_name?: string
  company_profile: string
  final_decider_role_id?: string | null
  top_level_role_ids?: string[]
  org_version: number
  runtime_policy?: RuntimePolicy
  roles: OrgRole[]
  employees: OrgEmployee[]
}
```

`OrgInfoPayload` is kept unchanged — `OrgConfig` is a strict subset. Two conversion helpers live in `org-store.ts`:
- `orgConfigToPayload(config: OrgConfig): OrgInfoPayload` — merges config into a minimal payload (empty arrays for runtime fields)
- `payloadToOrgConfig(payload: OrgInfoPayload): OrgConfig` — strips runtime fields

---

## Section 2 — IPC Contract

### Handlers (main process)

New file: `src/main/ipc/org-config-handlers.ts`

```ts
ipcMain.handle('org:readConfig',  (_event, worktreeRoot: string): Promise<OrgConfig | null>)
ipcMain.handle('org:writeConfig', (_event, worktreeRoot: string, config: OrgConfig): Promise<void>)
```

**`org:readConfig`:**
1. Resolve `{worktreeRoot}/.orca/org.yaml`
2. If file does not exist → return `null`
3. Read + parse YAML
4. Run `normalizeOrgConfig()` (strips unknown fields, fills required defaults)
5. Return `OrgConfig`

**`org:writeConfig`:**
1. Validate `config` is a non-null object with required fields
2. Create `{worktreeRoot}/.orca/` if absent
3. Serialize to YAML
4. Write to `{worktreeRoot}/.orca/org.yaml.tmp`, then `fs.rename` to `org.yaml` (atomic)

**Error handling:** Both handlers throw on unrecoverable errors (bad path, permission denied). The renderer treats thrown IPC errors as `loadState: 'error'` and shows an inline error message.

### Preload API

Added to existing preload API surface:

```ts
// src/web/preload-api/...
org: {
  readConfig:  (worktreeRoot: string) => Promise<OrgConfig | null>
  writeConfig: (worktreeRoot: string, config: OrgConfig) => Promise<void>
}
```

---

## Section 3 — Renderer Rework

### `org-store.ts`

`useOrgLocalState` gains a `worktreeRoot: string | null` parameter. Internal behavior:

```
worktreeRoot changes
  → setLoadState('loading')
  → call window.api.org.readConfig(worktreeRoot)
  → on success: setData(orgConfigToPayload(config ?? INITIAL_ORG_PAYLOAD)), setLoadState('ready')
  → on error: setLoadState('error')

any mutation (onAddRole, onUpdateRole, etc.)
  → setData(next)  [unchanged]
  → setIsDirty(true)
  → debouncedSave(next)  [500ms debounce]

debouncedSave(next)
  → window.api.org.writeConfig(worktreeRoot, payloadToOrgConfig(next))
  → on success: setLastSaved(next), setIsDirty(false)
  → on error: toast.error("Failed to save org config")
```

`loadFromStorage` and `saveToStorage` are **removed** from this hook. The `STORAGE_KEY_ORG` constant and `org-snapshot-storage.ts` are unaffected — they are still used by `useOrgSavedSnapshots` (the save-as / named snapshot feature).

New return values added to the hook:
```ts
loadState: 'loading' | 'ready' | 'error'
isDirty: boolean
```

### `OrgPage.tsx`

Reads `worktreeRoot` from the active worktree store (already available in the app):

```tsx
const worktreeRoot = useAppStore(s => s.activeWorktreeRoot)  // exact selector TBD
const store = useOrgLocalState(worktreeRoot)
```

Passes `loadState` and `isDirty` down to `OrgTab` → `OrgHeader`.

### Component tree impact

No component below `OrgPage` needs to change. The hook's output shape is the same; only two new fields are added. All callbacks (`onAddRole`, `onUpdateRole`, etc.) work identically — they still call `setData` internally.

---

## Section 4 — Agent Restart Flow & UX

### Dirty state banner

`OrgHeader` shows a subtle banner when `isDirty`:

```
[ Org config has unsaved changes ] [Apply & Restart Agent ▶]
```

The Apply button:
1. Flushes the debounce immediately (cancel debounce, call `writeConfig` now)
2. Calls the existing agent restart IPC for the active worktree (channel to be confirmed against `native-chat` handlers during implementation)
3. Shows toast: "Org config saved. Restarting agent…"
4. Clears `isDirty`

### When there is no running agent

Apply button is still enabled — it writes the file. The next agent start picks it up. Button label changes to "Save Config" (no "Restart" text).

### Fallback: no worktreeRoot

When `worktreeRoot` is null (e.g., user has no active worktree), the org page shows its current UI normally but mutations are not persisted (auto-save is skipped, Apply is disabled with tooltip "Open a worktree to save org config").

---

## Files Changed

| File | Action | Notes |
|---|---|---|
| `src/shared/org-config.ts` | **new** | `OrgConfig` type + `normalizeOrgConfig()` |
| `src/main/ipc/org-config-handlers.ts` | **new** | `org:readConfig`, `org:writeConfig` handlers |
| `src/main/ipc/register-ipc-handlers.ts` | **edit** | register `org-config-handlers` |
| `src/web/preload-api/...` | **edit** | expose `org.readConfig`, `org.writeConfig` |
| `src/renderer/src/components/org/org-store.ts` | **edit** | async load, debounced save, `loadState`, `isDirty` |
| `src/renderer/src/components/org/OrgPage.tsx` | **edit** | pass `worktreeRoot` to hook |
| `src/renderer/src/components/org/OrgTab.tsx` | **edit** | pass `loadState`, `isDirty` to `OrgHeader` |
| `src/renderer/src/components/org/OrgHeader.tsx` | **edit** | dirty banner + Apply button |

---

## Testing

- **Unit**: `org-config-handlers.ts` — read returns null for missing file, write creates `.orca/` dir, atomic write (rename)
- **Unit**: `org-store.ts` — `orgConfigToPayload` and `payloadToOrgConfig` are inverses on config fields; runtime fields stripped on write
- **Integration**: renderer sends mutation → debounce fires → IPC called with correct `worktreeRoot`
- **Not required**: E2E agent restart (agent restart path is covered by existing native-chat tests)

---

## Open Questions

None — all resolved during design session.
