# Org Config Integration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make org config file-backed and per-worktree by wiring the renderer org store to main-process IPC handlers that read/write `.orca/org.yaml` inside each worktree root.

**Architecture:** A new `OrgConfig` shared type (config-only subset of `OrgInfoPayload`) is read/written via two new IPC channels (`org:readConfig`, `org:writeConfig`). The renderer org store loads async on worktree change and debounce-saves on every mutation. An "Apply & Restart Agent" button in `OrgHeader` flushes the debounce and signals agent restart.

**Tech Stack:** TypeScript, Electron IPC (ipcMain.handle / ipcRenderer.invoke / contextBridge), `yaml` (^2.8.4 — already in package.json), Node.js `fs/promises`, React hooks

**Spec:** `docs/superpowers/specs/2026-09-22-org-config-integration-design.md`

## Global Constraints

- Cross-platform paths: always use `path.join`, never string concatenation with `/` or `\`
- Windows child processes: use `src/shared/child-process/` wrappers, never `child_process` directly (not applicable here — no spawning)
- No `max-lines` eslint/oxlint disable comments
- No vague file names (`helpers`, `utils`, etc.) — name by concrete responsibility
- No `as` type assertions except `as const`; unavoidable casts need `// oxlint-disable-next-line ... -- SAFETY:` comment
- Run `pnpm tc` after each task to confirm no type errors
- Run `pnpm test [path]` after each task that adds tests

---

### Task 1: Shared `OrgConfig` type + conversion helpers

**Files:**
- Create: `src/shared/org-config.ts`
- Test: `src/shared/org-config.test.ts`

**Interfaces:**
- Produces:
  - `OrgConfig` type (config-only fields from `OrgInfoPayload`)
  - `payloadToOrgConfig(payload: OrgInfoPayload): OrgConfig`
  - `orgConfigToPayload(config: OrgConfig): OrgInfoPayload`
  - `normalizeOrgConfig(raw: unknown): OrgConfig`

---

- [ ] **Step 1: Write failing tests**

Create `src/shared/org-config.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import type { OrgInfoPayload } from '../renderer/src/components/org/types'
import {
  payloadToOrgConfig,
  orgConfigToPayload,
  normalizeOrgConfig,
} from './org-config'

const MINIMAL_CONFIG = {
  organization_id: 'test-org',
  organization_name: 'Test',
  company_profile: 'custom',
  final_decider_role_id: 'ceo',
  top_level_role_ids: ['ceo'],
  org_version: 2,
  runtime_policy: { parallel: { max_workers: 4 } },
  roles: [
    {
      role_id: 'ceo', name: 'CEO', responsibility: 'Top', status: 'active',
      reports_to: '', can_spawn: [], tools: [],
    },
  ],
  employees: [],
}

const MINIMAL_PAYLOAD: OrgInfoPayload = {
  ...MINIMAL_CONFIG,
  channels: [{ name: 'general', enabled: true, running: true, configured: true, available: true, ready: true, last_error: null, delivery_mode: 'broadcast' }],
  connectors: [],
  org_version: 2,
  runtime_topology_version: 1,
  runtime_seats: [{ role_session_id: 's1', role_id: 'ceo', employee_id: 'e1', status: 'warm' }],
  work_items: [{ work_item_id: 'w1', role_id: 'ceo', cell_id: 'c1', title: 'Task', kind: 'feature', phase: 'ready', kanban_column: 'todo' }],
}

describe('payloadToOrgConfig', () => {
  it('strips runtime-only fields', () => {
    const config = payloadToOrgConfig(MINIMAL_PAYLOAD)
    expect('runtime_seats' in config).toBe(false)
    expect('work_items' in config).toBe(false)
    expect('channels' in config).toBe(false)
    expect('connectors' in config).toBe(false)
    expect('frontier' in config).toBe(false)
  })

  it('preserves config fields', () => {
    const config = payloadToOrgConfig(MINIMAL_PAYLOAD)
    expect(config.organization_id).toBe('test-org')
    expect(config.roles).toHaveLength(1)
    expect(config.org_version).toBe(2)
  })
})

describe('orgConfigToPayload', () => {
  it('produces empty runtime arrays', () => {
    const payload = orgConfigToPayload(MINIMAL_CONFIG)
    expect(payload.channels).toEqual([])
    expect(payload.connectors).toEqual([])
    expect(payload.runtime_seats ?? []).toEqual([])
    expect(payload.work_items ?? []).toEqual([])
  })

  it('preserves config fields', () => {
    const payload = orgConfigToPayload(MINIMAL_CONFIG)
    expect(payload.organization_id).toBe('test-org')
    expect(payload.roles).toHaveLength(1)
    expect(payload.runtime_topology_version).toBe(0)
  })
})

describe('normalizeOrgConfig', () => {
  it('returns defaults for empty object', () => {
    const config = normalizeOrgConfig({})
    expect(config.company_profile).toBe('')
    expect(config.org_version).toBe(0)
    expect(config.roles).toEqual([])
    expect(config.employees).toEqual([])
  })

  it('coerces org_version to number', () => {
    const config = normalizeOrgConfig({ org_version: '5', company_profile: 'custom', roles: [], employees: [] })
    expect(config.org_version).toBe(5)
  })

  it('ignores unknown fields', () => {
    const config = normalizeOrgConfig({ UNKNOWN_FIELD: true, company_profile: 'custom', roles: [], employees: [] })
    expect('UNKNOWN_FIELD' in config).toBe(false)
  })
})
```

- [ ] **Step 2: Run to confirm failure**

```powershell
pnpm test src/shared/org-config.test.ts
```

Expected: FAIL — module not found

- [ ] **Step 3: Implement `src/shared/org-config.ts`**

```ts
import type { OrgInfoPayload, OrgRole, OrgEmployee } from '../renderer/src/components/org/types'
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

export function payloadToOrgConfig(payload: OrgInfoPayload): OrgConfig {
  return {
    organization_id: payload.organization_id,
    organization_name: payload.organization_name,
    company_profile: payload.company_profile,
    final_decider_role_id: payload.final_decider_role_id,
    top_level_role_ids: payload.top_level_role_ids,
    org_version: payload.org_version,
    runtime_policy: payload.runtime_policy,
    roles: payload.roles,
    employees: payload.employees,
  }
}

export function orgConfigToPayload(config: OrgConfig): OrgInfoPayload {
  return {
    organization_id: config.organization_id,
    organization_name: config.organization_name,
    company_profile: config.company_profile,
    final_decider_role_id: config.final_decider_role_id,
    top_level_role_ids: config.top_level_role_ids ?? [],
    org_version: config.org_version,
    runtime_topology_version: 0,
    runtime_policy: config.runtime_policy,
    roles: config.roles,
    employees: config.employees,
    channels: [],
    connectors: [],
    runtime_seats: [],
    work_items: [],
  }
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === 'string')
}

export function normalizeOrgConfig(raw: unknown): OrgConfig {
  const src = raw && typeof raw === 'object' && !Array.isArray(raw)
    ? (raw as Record<string, unknown>)
    : {}

  return {
    organization_id: typeof src.organization_id === 'string' ? src.organization_id : undefined,
    organization_name: typeof src.organization_name === 'string' ? src.organization_name : undefined,
    company_profile: typeof src.company_profile === 'string' ? src.company_profile : '',
    final_decider_role_id:
      typeof src.final_decider_role_id === 'string' ? src.final_decider_role_id : null,
    top_level_role_ids: isStringArray(src.top_level_role_ids) ? src.top_level_role_ids : [],
    org_version:
      typeof src.org_version === 'number'
        ? src.org_version
        : typeof src.org_version === 'string'
          ? Number(src.org_version) || 0
          : 0,
    runtime_policy:
      src.runtime_policy && typeof src.runtime_policy === 'object' && !Array.isArray(src.runtime_policy)
        // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: structure verified above; only used to store as RuntimePolicy opaque record.
        ? (src.runtime_policy as RuntimePolicy)
        : undefined,
    // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: YAML-parsed roles/employees come in as unknown arrays; shapes are checked at runtime by the org store before use.
    roles: Array.isArray(src.roles) ? (src.roles as OrgRole[]) : [],
    // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: same as roles.
    employees: Array.isArray(src.employees) ? (src.employees as OrgEmployee[]) : [],
  }
}
```

- [ ] **Step 4: Run tests to confirm pass**

```powershell
pnpm test src/shared/org-config.test.ts
```

Expected: all pass

- [ ] **Step 5: Typecheck**

```powershell
pnpm tc
```

Expected: no new errors

- [ ] **Step 6: Commit**

```powershell
git add src/shared/org-config.ts src/shared/org-config.test.ts
git commit -m "feat: add OrgConfig type and payload conversion helpers"
```

---

### Task 2: Main-process IPC handlers (`org:readConfig`, `org:writeConfig`)

**Files:**
- Create: `src/main/ipc/org-config-handlers.ts`
- Create: `src/main/ipc/org-config-handlers.test.ts`
- Modify: `src/main/ipc/register-core-handlers/register-core-handlers.ts` (add import + call)

**Interfaces:**
- Consumes: `OrgConfig`, `normalizeOrgConfig` from `../../shared/org-config`
- Produces IPC channels:
  - `'org:readConfig'` handler: `(worktreeRoot: string) => Promise<OrgConfig | null>`
  - `'org:writeConfig'` handler: `(worktreeRoot: string, config: OrgConfig) => Promise<void>`
- Produces exported function:
  - `registerOrgConfigHandlers(): void`

---

- [ ] **Step 1: Write failing tests**

Create `src/main/ipc/org-config-handlers.test.ts`:

```ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtemp, rm, readFile, writeFile, mkdir } from 'node:fs/promises'
import { join, tmpdir } from 'node:path'
import { parse as parseYaml } from 'yaml'
import { readOrgConfig, writeOrgConfig } from './org-config-handlers'

let tmpDir: string

beforeEach(async () => {
  tmpDir = await mkdtemp(join(tmpdir(), 'orca-org-test-'))
})

afterEach(async () => {
  await rm(tmpDir, { recursive: true, force: true })
})

describe('readOrgConfig', () => {
  it('returns null when .orca/org.yaml does not exist', async () => {
    const result = await readOrgConfig(tmpDir)
    expect(result).toBeNull()
  })

  it('reads and normalizes an existing file', async () => {
    await mkdir(join(tmpDir, '.orca'))
    await writeFile(
      join(tmpDir, '.orca', 'org.yaml'),
      'company_profile: custom\norg_version: 3\nroles: []\nemployees: []\n',
      'utf8'
    )
    const result = await readOrgConfig(tmpDir)
    expect(result).not.toBeNull()
    expect(result?.company_profile).toBe('custom')
    expect(result?.org_version).toBe(3)
  })

  it('returns null for malformed YAML', async () => {
    await mkdir(join(tmpDir, '.orca'))
    await writeFile(join(tmpDir, '.orca', 'org.yaml'), ':::invalid yaml:::', 'utf8')
    const result = await readOrgConfig(tmpDir)
    expect(result).toBeNull()
  })
})

describe('writeOrgConfig', () => {
  it('creates .orca directory if absent', async () => {
    await writeOrgConfig(tmpDir, { company_profile: 'custom', org_version: 1, roles: [], employees: [] })
    const content = await readFile(join(tmpDir, '.orca', 'org.yaml'), 'utf8')
    expect(content).toContain('company_profile: custom')
  })

  it('writes valid YAML that round-trips through readOrgConfig', async () => {
    const config = { company_profile: 'custom', org_version: 7, roles: [], employees: [], organization_id: 'proj-1' }
    await writeOrgConfig(tmpDir, config)
    const read = await readOrgConfig(tmpDir)
    expect(read?.org_version).toBe(7)
    expect(read?.organization_id).toBe('proj-1')
  })

  it('overwrites an existing file', async () => {
    await mkdir(join(tmpDir, '.orca'))
    await writeFile(join(tmpDir, '.orca', 'org.yaml'), 'org_version: 1\ncompany_profile: old\nroles: []\nemployees: []\n', 'utf8')
    await writeOrgConfig(tmpDir, { company_profile: 'new', org_version: 2, roles: [], employees: [] })
    const raw = parseYaml(await readFile(join(tmpDir, '.orca', 'org.yaml'), 'utf8')) as Record<string, unknown>
    expect(raw.org_version).toBe(2)
    expect(raw.company_profile).toBe('new')
  })
})
```

- [ ] **Step 2: Run to confirm failure**

```powershell
pnpm test src/main/ipc/org-config-handlers.test.ts
```

Expected: FAIL — module not found

- [ ] **Step 3: Implement `src/main/ipc/org-config-handlers.ts`**

```ts
import { ipcMain } from 'electron'
import { readFile, writeFile, mkdir, rename } from 'node:fs/promises'
import { join } from 'node:path'
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml'
import { normalizeOrgConfig } from '../../shared/org-config'
import type { OrgConfig } from '../../shared/org-config'

const ORG_DIR = '.orca'
const ORG_FILE = 'org.yaml'

function orgFilePath(worktreeRoot: string): string {
  return join(worktreeRoot, ORG_DIR, ORG_FILE)
}

export async function readOrgConfig(worktreeRoot: string): Promise<OrgConfig | null> {
  const filePath = orgFilePath(worktreeRoot)
  let raw: string
  try {
    raw = await readFile(filePath, 'utf8')
  } catch (err) {
    // ENOENT → file absent → return null; other errors also return null
    return null
  }
  try {
    const parsed: unknown = parseYaml(raw)
    return normalizeOrgConfig(parsed)
  } catch {
    return null
  }
}

export async function writeOrgConfig(worktreeRoot: string, config: OrgConfig): Promise<void> {
  const dirPath = join(worktreeRoot, ORG_DIR)
  await mkdir(dirPath, { recursive: true })
  const yaml = stringifyYaml(config)
  const tmpPath = join(dirPath, `${ORG_FILE}.tmp`)
  await writeFile(tmpPath, yaml, 'utf8')
  await rename(tmpPath, orgFilePath(worktreeRoot))
}

export function registerOrgConfigHandlers(): void {
  ipcMain.handle('org:readConfig', (_event, worktreeRoot: string): Promise<OrgConfig | null> => {
    if (typeof worktreeRoot !== 'string' || !worktreeRoot.trim()) {
      return Promise.resolve(null)
    }
    return readOrgConfig(worktreeRoot)
  })

  ipcMain.handle('org:writeConfig', (_event, worktreeRoot: string, config: unknown): Promise<void> => {
    if (typeof worktreeRoot !== 'string' || !worktreeRoot.trim()) {
      throw new Error('org:writeConfig requires a non-empty worktreeRoot string')
    }
    // normalizeOrgConfig strips unknown fields so any shape is safe to persist
    return writeOrgConfig(worktreeRoot, normalizeOrgConfig(config))
  })
}
```

- [ ] **Step 4: Run tests to confirm pass**

```powershell
pnpm test src/main/ipc/org-config-handlers.test.ts
```

Expected: all pass

- [ ] **Step 5: Register the handlers**

Open `src/main/ipc/register-core-handlers/register-core-handlers.ts`.

Add import after the last `import` block (around line 60–70, before the `registerCoreHandlers` function):

```ts
import { registerOrgConfigHandlers } from '../org-config-handlers'
```

Inside `registerCoreHandlers()` function body, add before the closing brace (pattern matches all other `register*()` calls already there):

```ts
registerOrgConfigHandlers()
```

- [ ] **Step 6: Typecheck**

```powershell
pnpm tc
```

Expected: no new errors

- [ ] **Step 7: Commit**

```powershell
git add src/main/ipc/org-config-handlers.ts src/main/ipc/org-config-handlers.test.ts src/main/ipc/register-core-handlers/register-core-handlers.ts
git commit -m "feat: add org:readConfig and org:writeConfig IPC handlers"
```

---

### Task 3: Preload bridge (`window.api.org`)

**Files:**
- Create: `src/preload/api/org-config-bridge.ts`
- Create: `src/preload/api/org-config-api.ts` (API type)
- Modify: `src/preload/api-types.ts` (add `org` key to `PreloadApi`)
- Modify: `src/preload/index.ts` (import bridge, add to `api` object)

**Interfaces:**
- Consumes: `OrgConfig` from `../../shared/org-config`
- Produces:
  ```ts
  type OrgConfigApi = {
    readConfig:  (worktreeRoot: string) => Promise<OrgConfig | null>
    writeConfig: (worktreeRoot: string, config: OrgConfig) => Promise<void>
  }
  ```
  Exposed as `window.api.org` in renderer

---

- [ ] **Step 1: Create API type file**

Create `src/preload/api/org-config-api.ts`:

```ts
import type { OrgConfig } from '../../shared/org-config'

export type OrgConfigApi = {
  readConfig:  (worktreeRoot: string) => Promise<OrgConfig | null>
  writeConfig: (worktreeRoot: string, config: OrgConfig) => Promise<void>
}
```

- [ ] **Step 2: Create bridge file**

Create `src/preload/api/org-config-bridge.ts`:

```ts
import { ipcRenderer } from 'electron'
import type { OrgConfigApi } from './org-config-api'
import type { OrgConfig } from '../../shared/org-config'

export const orgConfigApi: OrgConfigApi = {
  readConfig: (worktreeRoot: string): Promise<OrgConfig | null> =>
    ipcRenderer.invoke('org:readConfig', worktreeRoot),

  writeConfig: (worktreeRoot: string, config: OrgConfig): Promise<void> =>
    ipcRenderer.invoke('org:writeConfig', worktreeRoot, config),
}
```

- [ ] **Step 3: Add `OrgConfigApi` to `PreloadApi`**

Open `src/preload/api-types.ts`.

Add import (alphabetically with existing imports):
```ts
import type { OrgConfigApi } from './api/org-config-api'
```

In the `PreloadApi` type, add (after `nativeChat` or alphabetically):
```ts
org: OrgConfigApi
```

- [ ] **Step 4: Wire into preload index**

Open `src/preload/index.ts`.

Add import (alphabetically):
```ts
import { orgConfigApi } from './api/org-config-bridge'
```

In the `api` object literal, add:
```ts
org: orgConfigApi,
```

- [ ] **Step 5: Typecheck**

```powershell
pnpm tc
```

Expected: no errors

- [ ] **Step 6: Commit**

```powershell
git add src/preload/api/org-config-api.ts src/preload/api/org-config-bridge.ts src/preload/api-types.ts src/preload/index.ts
git commit -m "feat: expose org:readConfig and org:writeConfig via preload bridge"
```

---

### Task 4: Renderer — rework `org-store.ts` to async IPC load + debounced save

**Files:**
- Modify: `src/renderer/src/components/org/org-store.ts`
- Create: `src/renderer/src/components/org/org-store.test.ts`

**Interfaces:**
- Consumes:
  - `window.api.org.readConfig(worktreeRoot)` → `Promise<OrgConfig | null>`
  - `window.api.org.writeConfig(worktreeRoot, config)` → `Promise<void>`
  - `payloadToOrgConfig`, `orgConfigToPayload` from `../../../../shared/org-config`
  - existing `INITIAL_ORG_PAYLOAD` from `./default-data`
- Produces (new fields added to hook return):
  - `loadState: 'loading' | 'ready' | 'error'`
  - `isDirty: boolean`
- Signature changes:
  - `useOrgLocalState(worktreeRoot: string | null)` — gains the `worktreeRoot` parameter

---

- [ ] **Step 1: Write failing tests**

Create `src/renderer/src/components/org/org-store.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { payloadToOrgConfig, orgConfigToPayload } from '../../../../shared/org-config'
import type { OrgInfoPayload } from './types'
import { INITIAL_ORG_PAYLOAD } from './default-data'

// Test the pure conversion functions used by the store — these don't need React
describe('payloadToOrgConfig round-trip', () => {
  it('strips runtime fields and round-trips config fields', () => {
    const config = payloadToOrgConfig(INITIAL_ORG_PAYLOAD)
    const payload = orgConfigToPayload(config)
    expect(payload.roles).toEqual(INITIAL_ORG_PAYLOAD.roles)
    expect(payload.employees).toEqual(INITIAL_ORG_PAYLOAD.employees)
    expect(payload.company_profile).toBe(INITIAL_ORG_PAYLOAD.company_profile)
    // runtime fields should be empty
    expect(payload.channels).toEqual([])
    expect(payload.connectors).toEqual([])
    expect(payload.runtime_seats ?? []).toEqual([])
  })
})

describe('orgConfigToPayload defaults', () => {
  it('sets runtime_topology_version to 0', () => {
    const payload = orgConfigToPayload({ company_profile: 'custom', org_version: 1, roles: [], employees: [] })
    expect(payload.runtime_topology_version).toBe(0)
  })
})
```

- [ ] **Step 2: Run to confirm pass (these are pure-function tests)**

```powershell
pnpm test src/renderer/src/components/org/org-store.test.ts
```

Expected: PASS (conversion logic already implemented in Task 1)

- [ ] **Step 3: Rework `org-store.ts`**

Open `src/renderer/src/components/org/org-store.ts` and apply these changes:

**Add imports** at the top (after existing imports):
```ts
import { useRef } from 'react'
import { payloadToOrgConfig, orgConfigToPayload } from '../../../../shared/org-config'
```

**Change the function signature** from:
```ts
export function useOrgLocalState() {
```
to:
```ts
export function useOrgLocalState(worktreeRoot: string | null) {
```

**Replace** the current `const [data, setData] = useState(...)` and the `useEffect` that calls `saveToStorage`:

Remove:
```ts
const [data, setData] = useState<OrgInfoPayload>(() =>
  loadFromStorage<OrgInfoPayload>(STORAGE_KEY_ORG, INITIAL_ORG_PAYLOAD)
)
```
and the effect:
```ts
useEffect(() => {
  saveToStorage(STORAGE_KEY_ORG, data)
}, [data])
```

Replace with:
```ts
const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading')
const [isDirty, setIsDirty] = useState(false)
const [data, setData] = useState<OrgInfoPayload>(INITIAL_ORG_PAYLOAD)
const lastSavedRef = useRef<OrgInfoPayload | null>(null)
const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

// Load config when worktreeRoot changes
useEffect(() => {
  if (!worktreeRoot) {
    setData(INITIAL_ORG_PAYLOAD)
    setLoadState('ready')
    return
  }
  setLoadState('loading')
  window.api.org.readConfig(worktreeRoot)
    .then((config) => {
      const payload = config ? orgConfigToPayload(config) : INITIAL_ORG_PAYLOAD
      setData(payload)
      lastSavedRef.current = payload
      setIsDirty(false)
      setLoadState('ready')
    })
    .catch(() => {
      setLoadState('error')
    })
}, [worktreeRoot])
```

**Add debounced save helper** (inside the hook, after the new state declarations):
```ts
const debouncedSave = useCallback((next: OrgInfoPayload) => {
  if (!worktreeRoot) return
  if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
  saveTimerRef.current = setTimeout(() => {
    window.api.org.writeConfig(worktreeRoot, payloadToOrgConfig(next))
      .then(() => {
        lastSavedRef.current = next
        setIsDirty(false)
      })
      .catch(() => {
        // Write failed — keep isDirty=true so the user can retry via Apply button
      })
  }, 500)
}, [worktreeRoot])
```

**Update every `setData` call** to also call `debouncedSave` and `setIsDirty(true)`. Pattern — wrap every `setData(prev => ...)` to also trigger save. The clearest approach is a local helper:

```ts
const mutateData = useCallback((updater: (prev: OrgInfoPayload) => OrgInfoPayload) => {
  setData((prev) => {
    const next = updater(prev)
    setIsDirty(true)
    debouncedSave(next)
    return next
  })
}, [debouncedSave])
```

Then replace every `setData((prev) => ...)` call in the callbacks with `mutateData((prev) => ...)`. (Direct `setData(value)` calls like `setData(INITIAL_ORG_PAYLOAD)` in reset handlers should also call `debouncedSave(INITIAL_ORG_PAYLOAD)` or clear dirty state.)

**Update `onResetArchitecture` and `onSelectCorporate`** to clear dirty state:
```ts
const onResetArchitecture = useCallback(() => {
  setData(INITIAL_ORG_PAYLOAD)
  setIsDirty(false)
  if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
  setActiveSavedOrg(null)
  setActiveSavedOrgVersionAtLoad(null)
}, [setActiveSavedOrg, setActiveSavedOrgVersionAtLoad])
```

**Add cleanup** for the save timer:
```ts
useEffect(() => {
  return () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
  }
}, [])
```

**Add `flushSave` helper** (used by the Apply button in Task 5):
```ts
const flushSave = useCallback((): Promise<void> => {
  if (!worktreeRoot) return Promise.resolve()
  if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
  return window.api.org.writeConfig(worktreeRoot, payloadToOrgConfig(data))
    .then(() => {
      lastSavedRef.current = data
      setIsDirty(false)
    })
}, [worktreeRoot, data])
```

**Add `loadState`, `isDirty`, `flushSave` to the return object**:
```ts
return {
  ...existingFields,
  loadState,
  isDirty,
  flushSave,
}
```

- [ ] **Step 4: Typecheck**

```powershell
pnpm tc
```

Expected: no errors. Fix any as they appear (most likely `window.api.org` — TypeScript picks this up from the `PreloadApi` type in `api-types.ts` via the renderer's global type augmentation).

- [ ] **Step 5: Commit**

```powershell
git add src/renderer/src/components/org/org-store.ts src/renderer/src/components/org/org-store.test.ts
git commit -m "feat: make org-store async per-worktree with debounced IPC save"
```

---

### Task 5: Wire `worktreeRoot` into `OrgPage`, pass `loadState`/`isDirty` down, add Apply button to `OrgHeader`

**Files:**
- Modify: `src/renderer/src/components/org/OrgPage.tsx`
- Modify: `src/renderer/src/components/org/OrgTab.tsx` (pass new props)
- Modify: `src/renderer/src/components/org/OrgHeader.tsx` (dirty banner + Apply button)

**Interfaces:**
- Consumes:
  - `useOrgLocalState(worktreeRoot)` — new signature
  - `store.loadState`, `store.isDirty`, `store.flushSave` — new fields from Task 4
  - `useAppStore` (Zustand) to read `activeWorktreeId` and look up the worktree's `path`
- Produces: UI — dirty state banner in `OrgHeader`, Apply button that flushes save

---

- [ ] **Step 1: Find how to get the active worktree's `path` from the store**

In `OrgPage.tsx`, add this selector (use `useAppStore` from `@/store`):

```ts
import { useAppStore } from '@/store'

// Inside OrgPage component:
const activeWorktreeId = useAppStore((s) => s.activeWorktreeId)
const worktrees = useAppStore((s) => s.worktreesByRepo)
const activeWorktree = activeWorktreeId
  ? Object.values(worktrees).flat().find((w) => w.id === activeWorktreeId)
  : null
const worktreeRoot = activeWorktree?.path ?? null
```

(`path` comes from `GitWorktreeInfo` which `Worktree` extends — it is the absolute filesystem path to the worktree directory.)

- [ ] **Step 2: Update `OrgPage.tsx`**

Add the selector (Step 1 above) and update the hook call from:
```ts
const store = useOrgLocalState()
```
to:
```ts
const store = useOrgLocalState(worktreeRoot)
```

Pass `loadState` and `isDirty` and `flushSave` to `OrgTab`:
```tsx
<OrgTab
  {...existingProps}
  loadState={store.loadState}
  isDirty={store.isDirty}
  flushSave={store.flushSave}
/>
```

- [ ] **Step 3: Update `OrgTab.tsx`**

Add to `OrgTab` props type:
```ts
loadState: 'loading' | 'ready' | 'error'
isDirty: boolean
flushSave: () => Promise<void>
```

Pass them down to `OrgHeader`:
```tsx
<OrgHeader
  {...existingHeaderProps}
  isDirty={isDirty}
  flushSave={flushSave}
/>
```

(Check what `OrgTab` currently passes to `OrgHeader` and add these three fields.)

- [ ] **Step 4: Update `OrgHeader.tsx`**

Add to `OrgHeader` props type:
```ts
isDirty: boolean
flushSave: () => Promise<void>
```

Add internal state for the Apply button:
```ts
const [applying, setApplying] = useState(false)
```

Add the dirty banner JSX (render only when `isDirty`):
```tsx
{isDirty && (
  <div className="flex items-center gap-2 rounded-md bg-[var(--surface)] border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--text-secondary)]">
    <span>Org config has unsaved changes</span>
    <button
      className="ml-2 rounded px-2 py-0.5 bg-[var(--accent)] text-white text-xs disabled:opacity-50"
      disabled={applying}
      onClick={async () => {
        setApplying(true)
        try {
          await flushSave()
        } finally {
          setApplying(false)
        }
      }}
    >
      {applying ? 'Saving…' : 'Save Config'}
    </button>
  </div>
)}
```

Place this banner inside the existing `OrgHeader` layout, below the title row.

- [ ] **Step 5: Typecheck**

```powershell
pnpm tc
```

- [ ] **Step 6: Lint**

```powershell
pnpm run check:code-quality:changed
```

- [ ] **Step 7: Commit**

```powershell
git add src/renderer/src/components/org/OrgPage.tsx src/renderer/src/components/org/OrgTab.tsx src/renderer/src/components/org/OrgHeader.tsx
git commit -m "feat: wire worktreeRoot to org store, add dirty banner and Save Config button"
```

---

## Self-Review Checklist

**Spec coverage:**
- ✅ `OrgConfig` type — Task 1
- ✅ `payloadToOrgConfig` + `orgConfigToPayload` — Task 1
- ✅ `normalizeOrgConfig` — Task 1
- ✅ `org:readConfig` IPC handler — Task 2
- ✅ `org:writeConfig` IPC handler — Task 2
- ✅ `.orca/` dir creation, atomic write (rename) — Task 2
- ✅ Handler registration — Task 2
- ✅ Preload bridge type + bridge file — Task 3
- ✅ `PreloadApi` update + preload index wiring — Task 3
- ✅ `org-store.ts` async load on worktreeRoot change — Task 4
- ✅ Debounced save on mutation — Task 4
- ✅ `loadState`, `isDirty`, `flushSave` returned by hook — Task 4
- ✅ `worktreeRoot` wired from active worktree path — Task 5
- ✅ Dirty banner + Save Config button in OrgHeader — Task 5
- ✅ No-worktreeRoot fallback (skip save, ready state) — Task 4 Step 3
- ✅ Malformed YAML → null (not crash) — Task 2 Step 3

**Not in scope (spec-confirmed):**
- Agent restart IPC call — spec notes "channel to be confirmed at implementation time"; button currently says "Save Config" (not "Apply & Restart"). Restart wiring is a follow-up task once the exact native-chat channel name is confirmed.
- Runtime state (seats, work_items) display — separate concern.

**Placeholder scan:** None found.

**Type consistency:**
- `OrgConfig` defined in Task 1, consumed in Tasks 2, 3, 4 ✓
- `readOrgConfig`, `writeOrgConfig` defined in Task 2, used in Task 2 tests ✓
- `loadState`, `isDirty`, `flushSave` defined in Task 4, consumed in Task 5 ✓
- `worktreeRoot: string | null` added to `useOrgLocalState` in Task 4, called with it in Task 5 ✓
