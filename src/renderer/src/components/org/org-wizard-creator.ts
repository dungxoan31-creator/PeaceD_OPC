import type { OrgInfoPayload, OrgRole, OrgEmployee, OrgCreateMemberInput } from './types'

export function createOrgFromWizard(
  organizationName: string,
  members: OrgCreateMemberInput[],
  base: OrgInfoPayload
): OrgInfoPayload {
  const cleanName = organizationName.trim()
  const orgId = cleanName.toLowerCase().replace(/\s+/g, '-')

  const createdRoles: OrgRole[] = []
  const createdEmployees: OrgEmployee[] = []

  members.forEach((m, idx) => {
    const roleId = m.name.toLowerCase().replace(/[^a-z0-9]/g, '_') || `role_${idx + 1}`
    let reportsTo = 'owner'
    if (m.reports_to_index !== null && m.reports_to_index !== undefined && m.reports_to_index >= 0) {
      const parentMember = members[m.reports_to_index]
      if (parentMember) {
        reportsTo = parentMember.name.toLowerCase().replace(/[^a-z0-9]/g, '_') || `role_${m.reports_to_index + 1}`
      }
    }

    createdRoles.push({
      role_id: roleId,
      name: m.name,
      responsibility: m.responsibility || 'Operational execution',
      reports_to: reportsTo,
      status: 'active',
      icon: idx === 0 ? 'leader' : 'code',
      can_spawn: [],
      tools: [],
      prompt_refs: m.prompt ? [m.prompt] : [],
    })

    createdEmployees.push({
      employee_id: `emp-${roleId}-${Date.now().toString(36)}`,
      name: m.name,
      role_id: roleId,
      role_ids: [roleId],
      category: 'operations',
      domains: ['General'],
      seniority: idx === 0 ? 'Executive' : 'Specialist',
      status: 'active',
      tags: ['AI Agent', m.name],
      skill_refs: [],
      experience_score: 90,
      learned_skill_refs: [],
    })
  })

  return {
    ...base,
    organization_id: orgId,
    organization_name: cleanName,
    company_profile: 'custom',
    org_version: 1,
    roles: createdRoles,
    employees: createdEmployees,
    final_decider_role_id: createdRoles[0]?.role_id || null,
    top_level_role_ids: createdRoles.filter((r) => r.reports_to === 'owner').map((r) => r.role_id),
  }
}
