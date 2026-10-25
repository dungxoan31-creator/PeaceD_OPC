import type { OrgInfoPayload, OrgRole } from './types'

/** Simple YAML serializer for Org export */
export function serializeOrgToYaml(org: OrgInfoPayload): string {
  const lines: string[] = []
  lines.push('schema_version: 2')
  lines.push('kind: opc_org_architecture')
  lines.push(`organization_id: ${org.organization_id || 'custom'}`)
  lines.push(`organization_name: "${org.organization_name || 'Custom Organization'}"`)
  lines.push(`company_profile: ${org.company_profile || 'custom'}`)
  lines.push(`final_decider_role_id: ${org.final_decider_role_id || 'ceo'}`)
  lines.push(`org_version: ${org.org_version}`)
  lines.push('roles:')
  for (const r of org.roles) {
    lines.push(`  - id: ${r.role_id}`)
    lines.push(`    name: "${r.name.replace(/"/g, '\\"')}"`)
    lines.push(`    responsibility: "${r.responsibility.replace(/"/g, '\\"')}"`)
    lines.push(`    reports_to: ${r.reports_to}`)
    if (r.icon) {
      lines.push(`    icon: ${r.icon}`)
    }
    if (r.preferred_external_agent) {
      lines.push(`    preferred_external_agent: ${r.preferred_external_agent}`)
    }
    if (r.can_spawn && r.can_spawn.length > 0) {
      lines.push('    can_spawn:')
      for (const sp of r.can_spawn) {
        lines.push(`      - ${sp}`)
      }
    }
  }
  return lines.join('\n')
}

/** Lightweight YAML line parser for Org import */
export function parseYamlToRoles(yamlStr: string): Partial<OrgRole>[] {
  const roles: Partial<OrgRole>[] = []
  const lines = yamlStr.split(/\r?\n/)
  let current: Partial<OrgRole> | null = null

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }

    const idMatch = trimmed.match(/^-\s*id:\s*(.+)$/)
    if (idMatch) {
      if (current && current.role_id) {
        roles.push(current)
      }
      current = { role_id: idMatch[1].replace(/['"]/g, '').trim(), can_spawn: [], tools: [] }
      continue
    }

    if (!current) {
      continue
    }

    const fieldMatch = trimmed.match(/^([a-zA-Z0-9_]+):\s*(.*)$/)
    if (fieldMatch) {
      const [, key, val] = fieldMatch
      const cleanVal = val.replace(/^["']|["']$/g, '').trim()
      if (key === 'name') {
        current.name = cleanVal
      } else if (key === 'responsibility') {
        current.responsibility = cleanVal
      } else if (key === 'reports_to') {
        current.reports_to = cleanVal
      } else if (key === 'icon') {
        current.icon = cleanVal
      } else if (key === 'preferred_external_agent') {
        current.preferred_external_agent = cleanVal
      }
    }
  }
  if (current && current.role_id) {
    roles.push(current)
  }
  return roles
}
