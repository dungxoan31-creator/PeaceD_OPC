import type {
  ChannelStatusInfo,
  ConnectorInfo,
  InstalledPackageInfo,
  ProjectDossierInfo,
  ProjectRunInfo,
  RuntimeFrontierSummary,
  RuntimePolicy,
  RuntimeSeatInfo,
  RuntimeTeamInfo,
  RuntimeWorkItemInfo,
  SeatDigestInfo,
  SessionLinkInfo
} from './types-runtime'

export * from './types-runtime'
export * from './types-proposals'

export type RoleId = string
export type TemplateId = string
export type EmployeeId = string

export const asRoleId = (s: string): RoleId => s
export const asTemplateId = (s: string): TemplateId => s
export const asEmployeeId = (s: string): EmployeeId => s

export type HireTalentHandler = (template: TemplateId, role: RoleId) => void

export type TaskPreferredAgent =
  | 'native'
  | 'codex'
  | 'claude_code'
  | 'cursor'
  | 'opencode'
  | 'jiuwen'
  | 'jiuwenswarm'

export type InteractionReplyReceipt = {
  ok: boolean
  accepted: boolean
  deduplicated?: boolean
  status?: string
  reason?: string
  error?: string
}

export type SavedOrgSummary = {
  name: string
  organization_id?: string
  organization_name?: string
  filename?: string
  saved_at: number
  roles_count: number
  employees_count: number
}

export type OrgCreateMemberInput = {
  name: string
  responsibility?: string
  prompt?: string
  reports_to_index?: number | null
}

export type OrgSavedCreatePayload = {
  ok: boolean
  name: string
  organization_id?: string
  organization_name?: string
  filename?: string
  roles_count?: number
  employees_count?: number
  error?: string
}

export type ExternalTeamCoveredRole = {
  role_id: string
  name: string
  responsibility: string
  capabilities?: string[]
  skill_refs?: string[]
  tools?: string[]
  prompt_refs?: string[]
  artifact_contract_ref?: string | null
}

export type ExternalTeamCapabilityManifest = {
  schema_version: number
  execution_unit_id: string
  organizational_identity: string
  display_name: string
  provider: string
  provider_mode: string
  scope: string
  covered_role_ids: string[]
  covered_roles: ExternalTeamCoveredRole[]
  capabilities: string[]
  skill_refs: string[]
  tools: string[]
  prompt_refs: string[]
  deliverables: string[]
  artifact_contract_refs: string[]
  out_of_scope: string[]
  review_owner_role_id: string
  org_version: number
  manifest_hash: string
}

export type ExternalExecutionUnit = {
  binding_id: string
  boundary_role_id: string
  external_agent: string
  covered_role_ids: string[]
  canonical_seat_id: string
  scope: string
  collapse_subtree: boolean
  review_owner_role_id: string
  execution_unit_kind: string
  capability_manifest?: ExternalTeamCapabilityManifest
}

export type OrgRole = {
  role_id: string
  name: string
  responsibility: string
  status: string
  reports_to: string
  icon?: string | null
  can_spawn: string[]
  tools: string[]
  is_builtin?: boolean
  execution_strategy?: string
  preferred_external_agent?: string | null
  prompt_refs?: string[]
  runtime_policy?: { execution_strategy?: string }
  role_type?: string
  skill_refs?: string[]
  artifact_contract_ref?: string | null
  capabilities?: string[]
  execution_unit_kind?: string
  external_team_binding_id?: string | null
  external_team_boundary_role_id?: string | null
  external_team_boundary?: boolean
  covered_by_external_team?: boolean
  selected_execution_agent?: string | null
  staffing_locked?: boolean
  staffing_mode?: string | null
  external_team_capability_manifest?: ExternalTeamCapabilityManifest | null
}

export type OrgEmployee = {
  employee_id: string
  name: string
  role_id: string
  role_ids?: string[]
  category: string
  domains: string[]
  seniority: string
  status: string
  tags: string[]
  skill_refs: string[]
  experience_score: number
  learned_skill_refs: string[]
  linked_agent_id?: string
  is_default_employee?: boolean
}

export type OrgInfoPayload = {
  roles: OrgRole[]
  employees: OrgEmployee[]
  company_profile: string
  organization_id?: string
  organization_name?: string
  organization_config_file?: string
  final_decider_role_id?: string | null
  top_level_role_ids?: string[]
  runtime_teams?: RuntimeTeamInfo[]
  runtime_seats?: RuntimeSeatInfo[]
  runtime_topology_preview?: Record<string, unknown>
  work_item_runtime_preview?: Record<string, unknown>
  work_items?: RuntimeWorkItemInfo[]
  frontier?: RuntimeFrontierSummary
  project_run?: ProjectRunInfo
  project_dossier?: ProjectDossierInfo
  seat_digests?: SeatDigestInfo[]
  revision_links?: SessionLinkInfo[]
  project_recovery?: Record<string, unknown>
  channels: ChannelStatusInfo[]
  connectors: ConnectorInfo[]
  org_version: number
  runtime_topology_version: number
  installed_packages?: InstalledPackageInfo[]
  runtime_policy?: RuntimePolicy
  external_team_bindings?: Record<string, unknown>[]
  external_execution_units?: ExternalExecutionUnit[]
  external_agent_profiles?: Record<string, unknown>[]
}
