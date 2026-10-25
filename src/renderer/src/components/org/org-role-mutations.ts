import type {
  OrgInfoPayload,
  OrgRole,
  OrgEmployee,
  ArchitecturePresetDetail,
  TalentTemplate,
} from './types'

export function applyPresetToOrg(
  presetId: string,
  strategy: string,
  detail: ArchitecturePresetDetail,
  prev: OrgInfoPayload
): OrgInfoPayload {
  let newRoles: OrgRole[] = []
  let newEmployees: OrgEmployee[] = []

  if (strategy === 'merge') {
    const existingIds = new Set(prev.roles.map((r) => r.role_id))
    const mergedPresetRoles: OrgRole[] = detail.roles.map((r) => {
      const finalId = existingIds.has(r.id) ? `${presetId}_${r.id}` : r.id
      return {
        role_id: finalId,
        name: r.name,
        responsibility: r.responsibility,
        status: 'active',
        reports_to: r.reports_to === 'owner' ? 'ceo' : r.reports_to,
        icon: 'code',
        can_spawn: r.can_spawn ?? [],
        tools: [],
        is_builtin: false,
      }
    })
    newRoles = [...prev.roles, ...mergedPresetRoles]
    newEmployees = [...prev.employees]
  } else {
    newRoles = detail.roles.map((r) => ({
      role_id: r.id,
      name: r.name,
      responsibility: r.responsibility,
      status: 'active',
      reports_to: r.reports_to,
      icon: r.id === 'ceo' || r.reports_to === 'owner' ? 'leader' : 'code',
      can_spawn: r.can_spawn ?? [],
      tools: [],
      is_builtin: false,
    }))

    newEmployees = newRoles.map((r) => ({
      employee_id: `emp-${r.role_id}-01`,
      name: `Agent ${r.name}`,
      role_id: r.role_id,
      role_ids: [r.role_id],
      category: 'general',
      domains: ['Operations'],
      seniority: 'Lead',
      status: 'active',
      tags: ['AI Agent', r.name],
      skill_refs: [],
      experience_score: 90,
      learned_skill_refs: [],
    }))
  }

  return {
    ...prev,
    organization_id: presetId,
    organization_name: detail.name,
    company_profile: 'custom',
    org_version: prev.org_version + 1,
    roles: newRoles,
    employees: newEmployees,
    final_decider_role_id: newRoles[0]?.role_id ?? null,
  }
}

export function addRoleToOrg(
  roleId: string,
  name: string,
  responsibility: string,
  reportsTo: string,
  icon: string | null | undefined,
  prev: OrgInfoPayload
): OrgInfoPayload {
  const cleanRoleId = roleId.trim().toLowerCase().replace(/\s+/g, '_')
  if (prev.roles.some((r) => r.role_id === cleanRoleId)) {
    return prev
  }

  const newRole: OrgRole = {
    role_id: cleanRoleId,
    name: name.trim(),
    responsibility: responsibility.trim(),
    reports_to: reportsTo,
    status: 'active',
    icon: icon ?? 'code',
    can_spawn: [],
    tools: [],
    is_builtin: false,
  }

  const updatedRoles = prev.roles.map((r) => {
    if (r.role_id === reportsTo && !r.can_spawn.includes(cleanRoleId)) {
      return { ...r, can_spawn: [...r.can_spawn, cleanRoleId] }
    }
    return r
  })
  updatedRoles.push(newRole)

  const newEmployee: OrgEmployee = {
    employee_id: `emp-${cleanRoleId}-${Date.now().toString(36)}`,
    name: `Agent ${name.trim()}`,
    role_id: cleanRoleId,
    role_ids: [cleanRoleId],
    category: 'operations',
    domains: ['General'],
    seniority: 'Specialist',
    status: 'active',
    tags: ['AI Agent', name.trim()],
    skill_refs: [],
    experience_score: 85,
    learned_skill_refs: [],
  }

  return {
    ...prev,
    org_version: prev.org_version + 1,
    roles: updatedRoles,
    employees: [...prev.employees, newEmployee],
  }
}

export function bulkAddRolesToOrg(
  roles: { role_id: string; name: string; responsibility: string; reports_to: string }[],
  prev: OrgInfoPayload
): OrgInfoPayload {
  const existingIds = new Set(prev.roles.map((r) => r.role_id))
  const addedRoles: OrgRole[] = []
  const addedEmployees: OrgEmployee[] = []

  for (const item of roles) {
    const cleanId = item.role_id.trim().toLowerCase().replace(/\s+/g, '_')
    if (existingIds.has(cleanId)) {
      continue
    }
    existingIds.add(cleanId)

    addedRoles.push({
      role_id: cleanId,
      name: item.name.trim(),
      responsibility: item.responsibility.trim(),
      reports_to: item.reports_to,
      status: 'active',
      icon: 'code',
      can_spawn: [],
      tools: [],
      is_builtin: false,
    })

    addedEmployees.push({
      employee_id: `emp-${cleanId}-${Date.now().toString(36)}`,
      name: `Agent ${item.name.trim()}`,
      role_id: cleanId,
      role_ids: [cleanId],
      category: 'operations',
      domains: ['General'],
      seniority: 'Specialist',
      status: 'active',
      tags: ['AI Agent', item.name.trim()],
      skill_refs: [],
      experience_score: 85,
      learned_skill_refs: [],
    })
  }

  return {
    ...prev,
    org_version: prev.org_version + 1,
    roles: [...prev.roles, ...addedRoles],
    employees: [...prev.employees, ...addedEmployees],
  }
}

export function updateRoleInOrg(
  roleId: string,
  updates: Partial<OrgRole>,
  prev: OrgInfoPayload
): OrgInfoPayload {
  const updatedRoles = prev.roles.map((r) => {
    if (r.role_id !== roleId) {
      return r
    }
    return {
      ...r,
      name: updates.name !== undefined ? updates.name : r.name,
      responsibility: updates.responsibility !== undefined ? updates.responsibility : r.responsibility,
      reports_to: updates.reports_to !== undefined ? updates.reports_to : r.reports_to,
      can_spawn: updates.can_spawn !== undefined ? updates.can_spawn : r.can_spawn,
      icon: updates.icon !== undefined ? updates.icon : r.icon,
      execution_strategy: updates.execution_strategy !== undefined ? updates.execution_strategy : r.execution_strategy,
      preferred_external_agent: updates.preferred_external_agent !== undefined ? updates.preferred_external_agent : r.preferred_external_agent,
      prompt_refs: updates.prompt_refs !== undefined ? updates.prompt_refs : r.prompt_refs,
    }
  })

  return {
    ...prev,
    org_version: prev.org_version + 1,
    roles: updatedRoles,
  }
}

export function deleteRoleFromOrg(roleId: string, prev: OrgInfoPayload): OrgInfoPayload {
  const deletedRole = prev.roles.find((r) => r.role_id === roleId)
  const fallbackParent = deletedRole?.reports_to || 'owner'

  const updatedRoles = prev.roles
    .filter((r) => r.role_id !== roleId)
    .map((r) => (r.reports_to === roleId ? { ...r, reports_to: fallbackParent } : r))

  const updatedEmployees = prev.employees.filter((e) => e.role_id !== roleId)

  return {
    ...prev,
    org_version: prev.org_version + 1,
    roles: updatedRoles,
    employees: updatedEmployees,
  }
}

export function hireTalentToRole(
  template: TalentTemplate,
  targetRoleId: string,
  prev: OrgInfoPayload
): OrgInfoPayload {
  const newEmpId = `emp-${targetRoleId}-${Date.now().toString(36)}`
  const newEmployee: OrgEmployee = {
    employee_id: newEmpId,
    name: template.name,
    role_id: targetRoleId,
    role_ids: [targetRoleId],
    category: template.category,
    domains: template.domains,
    seniority: 'Principal Specialist',
    status: 'active',
    tags: template.tags,
    skill_refs: template.tags.map((tg) => tg.toLowerCase().replace(/\s+/g, '_')),
    experience_score: 95,
    learned_skill_refs: [],
    is_default_employee: false,
  }

  const updatedEmployees = prev.employees.filter((e) => e.role_id !== targetRoleId)
  updatedEmployees.push(newEmployee)

  return {
    ...prev,
    org_version: prev.org_version + 1,
    employees: updatedEmployees,
  }
}

