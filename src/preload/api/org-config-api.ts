import type { OrgConfig } from '../../shared/org-config'

export type OrgConfigApi = {
  readConfig: (worktreeRoot: string) => Promise<OrgConfig | null>
  writeConfig: (worktreeRoot: string, config: OrgConfig) => Promise<void>
}
