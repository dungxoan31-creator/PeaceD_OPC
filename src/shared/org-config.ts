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
    // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: raw object checked above to be non-null object record.
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
