import { ipcRenderer } from 'electron'
import type { OrgConfigApi } from './org-config-api'
import type { OrgConfig } from '../../shared/org-config'

export const orgConfigApi: OrgConfigApi = {
  readConfig: (worktreeRoot: string): Promise<OrgConfig | null> =>
    ipcRenderer.invoke('org:readConfig', worktreeRoot),

  writeConfig: (worktreeRoot: string, config: OrgConfig): Promise<void> =>
    ipcRenderer.invoke('org:writeConfig', worktreeRoot, config)
}
