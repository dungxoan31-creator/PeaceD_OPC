/**
 * RoleInspector — Figma-style floating property panel (D4).
 *
 * Renders on the right of the StructureEditor when a role is selected.
 * Six collapsible groups:
 *   1. Identity       (expanded by default): name, responsibility, icon
 *   2. Hierarchy      (expanded by default): reports_to, can_spawn
 *   3. Tools          (collapsed): 22-item checklist grouped by prefix
 *   4. Prompts        (collapsed): textarea (one prompt_ref per line)
 *   5. Runtime        (collapsed): execution_strategy, preferred_external_agent
 *   6. Advanced       (collapsed): role_type, skill_refs, artifact_contract_ref
 *
 * Edits are debounced 500ms and batched into a single onUpdateRole call per
 * quiescence window.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { OrgRole, OrgEmployee } from './types'
import {
  InspectorGroup,
  InspectorField,
  IconPicker,
  MultiSelect,
  ToolChecklist,
} from './RoleInspectorControls'
import { RoleInspectorRuntimeSection } from './RoleInspectorRuntimeSection'
import { resolveRoleIcon } from './roleIcons'

/* ── Props ─────────────────────────────────────────────────────── */

type RoleInspectorProps = {
  role: OrgRole
  allRoles: OrgRole[]
  employees: OrgEmployee[]
  readOnly?: boolean
  teamBindingEditable?: boolean
  organizationId?: string
  onUpdateRole: (roleId: string, updates: RoleUpdatePatch) => void
  onBindExternalTeam?: (data: {
    boundary_role_id: string
    organization_id?: string
    scope: 'subtree'
  }) => void
  onUnbindExternalTeam?: (data: {
    binding_id?: string
    boundary_role_id?: string
    organization_id?: string
  }) => void
  onDeleteRole: (roleId: string) => void
  onClose: () => void
}

/** Matches the shape that App.tsx's onUpdateRole accepts; `tools` is forwarded
 *  via the same path (backend RoleConfig Pydantic model accepts it). */
export type RoleUpdatePatch = {
  name?: string
  responsibility?: string
  reports_to?: string
  can_spawn?: string[]
  icon?: string | null
  execution_strategy?: string
  preferred_external_agent?: string | null
  prompt_refs?: string[]
  tools?: string[]
}

/* ── RoleInspector ─────────────────────────────────────────────── */

export function RoleInspector({
  role, allRoles, employees, readOnly, teamBindingEditable = true, organizationId,
  onUpdateRole, onBindExternalTeam, onUnbindExternalTeam, onDeleteRole, onClose,
}: RoleInspectorProps) {
  const [name, setName] = useState(role.name)
  const [responsibility, setResponsibility] = useState(role.responsibility)
  const [reportsTo, setReportsTo] = useState(role.reports_to)
  const [iconKey, setIconKey] = useState<string | null>(role.icon ?? null)
  const [canSpawn, setCanSpawn] = useState<Set<string>>(() => new Set(role.can_spawn))
  const [tools, setTools] = useState<Set<string>>(() => new Set(role.tools))
  const [execStrategy, setExecStrategy] = useState<string>(
    role.runtime_policy?.execution_strategy ?? 'auto',
  )
  const [extAgent, setExtAgent] = useState<string | null>(role.preferred_external_agent ?? null)
  const [promptRefs, setPromptRefs] = useState<string>((role.prompt_refs ?? []).join('\n'))
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [teamMutationPending, setTeamMutationPending] = useState(false)

  // Reset local state when selected role changes
  const lastRoleIdRef = useRef(role.role_id)
  useEffect(() => {
    if (lastRoleIdRef.current === role.role_id) {return}
    lastRoleIdRef.current = role.role_id
    setName(role.name)
    setResponsibility(role.responsibility)
    setReportsTo(role.reports_to)
    setIconKey(role.icon ?? null)
    setCanSpawn(new Set(role.can_spawn))
    setTools(new Set(role.tools))
    setExecStrategy(role.runtime_policy?.execution_strategy ?? 'auto')
    setExtAgent(role.preferred_external_agent ?? null)
    setPromptRefs((role.prompt_refs ?? []).join('\n'))
    setConfirmDelete(false)
  }, [role])

  useEffect(() => {
    setExtAgent(role.preferred_external_agent ?? null)
    setTeamMutationPending(false)
  }, [role.preferred_external_agent, role.external_team_binding_id])

  useEffect(() => {
    if (!teamMutationPending) {return}
    const timeout = setTimeout(() => setTeamMutationPending(false), 12_000)
    return () => clearTimeout(timeout)
  }, [teamMutationPending])

  /* ── Debounced save: batch fragments, fire once after 500ms quiescence ── */
  const dirtyRef = useRef<RoleUpdatePatch>({})
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const roleIdRef = useRef(role.role_id)
  useEffect(() => { roleIdRef.current = role.role_id }, [role.role_id])

  const flush = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
    const patch = dirtyRef.current
    dirtyRef.current = {}
    if (Object.keys(patch).length === 0) {return}
    onUpdateRole(roleIdRef.current, patch)
  }, [onUpdateRole])

  const scheduleSave = useCallback((fragment: RoleUpdatePatch) => {
    if (readOnly) {return}
    dirtyRef.current = { ...dirtyRef.current, ...fragment }
    if (timerRef.current) {clearTimeout(timerRef.current)}
    timerRef.current = setTimeout(flush, 500)
  }, [flush, readOnly])

  // Unmount flush — capture any pending edits so they are not lost
  useEffect(() => {
    return () => {
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
      const patch = dirtyRef.current
      if (Object.keys(patch).length > 0) {
        dirtyRef.current = {}
        onUpdateRole(roleIdRef.current, patch)
      }
    }
  }, [onUpdateRole])

  /* ── Setters ───────────────────────────────────────────────── */
  const handleNameChange = (v: string) => { setName(v); scheduleSave({ name: v }) }
  const handleResponsibilityChange = (v: string) => { setResponsibility(v); scheduleSave({ responsibility: v }) }
  const handleReportsToChange = (v: string) => { setReportsTo(v); scheduleSave({ reports_to: v }) }
  const handleIconChange = (v: string | null) => { setIconKey(v); scheduleSave({ icon: v }) }
  const handleExecStrategyChange = (v: string) => { setExecStrategy(v); scheduleSave({ execution_strategy: v }) }
  const handleExtAgentChange = (v: string | null) => { setExtAgent(v); scheduleSave({ preferred_external_agent: v }) }
  const handlePromptRefsChange = (v: string) => {
    setPromptRefs(v)
    const lines = v.split('\n').map(s => s.trim()).filter(Boolean)
    scheduleSave({ prompt_refs: lines })
  }
  const toggleCanSpawn = (id: string) => {
    const next = new Set(canSpawn)
    if (next.has(id)) {next.delete(id);} else {next.add(id)}
    setCanSpawn(next)
    scheduleSave({ can_spawn: Array.from(next) })
  }
  const toggleTool = (toolName: string) => {
    const next = new Set(tools)
    if (next.has(toolName)) {next.delete(toolName);} else {next.add(toolName)}
    setTools(next)
    scheduleSave({ tools: Array.from(next) })
  }

  /* ── Derived ───────────────────────────────────────────────── */
  const otherRoles = useMemo(
    () => allRoles.filter(r => r.role_id !== role.role_id),
    [allRoles, role.role_id],
  )
  const employeeCount = useMemo(
    () => employees.filter(e => (e.role_ids?.length ? e.role_ids : [e.role_id]).includes(role.role_id)).length,
    [employees, role.role_id],
  )
  const promptRefCount = useMemo(
    () => promptRefs.split('\n').filter(s => s.trim()).length,
    [promptRefs],
  )
  const isExternalTeamBoundary = Boolean(role.external_team_boundary)
  const isCoveredByExternalTeam = Boolean(role.covered_by_external_team)
  const isCoveredDescendant = isCoveredByExternalTeam && !isExternalTeamBoundary
  const coveredRoles = useMemo(() => {
    const manifestRoles = role.external_team_capability_manifest?.covered_roles ?? []
    if (manifestRoles.length > 0) {
      return manifestRoles.map(item => ({
        role_id: item.role_id,
        name: item.name || item.role_id,
        responsibility: item.responsibility || '',
      }))
    }
    const descendants: OrgRole[] = []
    const seen = new Set<string>()
    const visit = (roleId: string) => {
      if (seen.has(roleId)) {return}
      seen.add(roleId)
      const current = allRoles.find(item => item.role_id === roleId)
      if (current) {descendants.push(current)}
      allRoles.filter(item => item.reports_to === roleId).forEach(item => visit(item.role_id))
    }
    visit(role.role_id)
    return descendants
  }, [allRoles, role.external_team_capability_manifest, role.role_id])
  const capabilityManifest = role.external_team_capability_manifest

  const handleExecutionScopeChange = (scope: 'role' | 'subtree') => {
    if (!teamBindingEditable || teamMutationPending) {return}
    if (scope === 'subtree' && !onBindExternalTeam) {return}
    if (scope === 'role' && !onUnbindExternalTeam) {return}
    flush()
    setTeamMutationPending(true)
    if (scope === 'subtree') {
      onBindExternalTeam?.({
        boundary_role_id: role.role_id,
        organization_id: organizationId,
        scope: 'subtree',
      })
      return
    }
    onUnbindExternalTeam?.({
      binding_id: role.external_team_binding_id ?? undefined,
      boundary_role_id: role.external_team_boundary_role_id ?? role.role_id,
      organization_id: organizationId,
    })
  }

  /* ── Delete (2-step confirm) ──────────────────────────────── */
  const handleDelete = () => {
    if (!confirmDelete) { setConfirmDelete(true); return }
    flush()
    onDeleteRole(role.role_id)
  }

  return (
    <aside className="ri-panel" aria-label={`Inspector for role ${role.name}`}>
      <header className="ri-panel-header">
        <img src={resolveRoleIcon(iconKey)} alt="" className="ri-panel-icon" />
        <div className="ri-panel-title-wrap">
          <h3 className="ri-panel-title">{name || '(unnamed)'}</h3>
          <code className="ri-panel-id">{role.role_id}</code>
        </div>
        <button className="btn btn-ghost btn-sm ri-panel-close" onClick={onClose} title="Close (Esc)">✕</button>
      </header>

      <div className="ri-panel-body">
        <InspectorGroup title="Identity" defaultExpanded>
          <InspectorField label="Name">
            <input
              className="ri-text-input"
              value={name}
              onChange={e => handleNameChange(e.target.value)}
              disabled={readOnly}
            />
          </InspectorField>
          <InspectorField label="Responsibility">
            <textarea
              className="ri-textarea"
              rows={3}
              value={responsibility}
              onChange={e => handleResponsibilityChange(e.target.value)}
              disabled={readOnly}
            />
          </InspectorField>
          <InspectorField label="Icon">
            <IconPicker value={iconKey} onChange={handleIconChange} readOnly={readOnly} />
          </InspectorField>
        </InspectorGroup>

        <InspectorGroup title="Hierarchy" defaultExpanded>
          <InspectorField label="Reports to">
            <select
              className="ri-select"
              value={reportsTo}
              onChange={e => handleReportsToChange(e.target.value)}
              disabled={readOnly}
            >
              <option value="owner">You (Owner)</option>
              {otherRoles.map(r => (
                <option key={r.role_id} value={r.role_id}>{r.name}</option>
              ))}
            </select>
          </InspectorField>
          <InspectorField label="Can delegate to">
            <MultiSelect
              allIds={otherRoles.map(r => r.role_id)}
              labelFor={(id) => otherRoles.find(r => r.role_id === id)?.name ?? id}
              selected={canSpawn}
              onToggle={toggleCanSpawn}
              readOnly={readOnly}
            />
          </InspectorField>
          <InspectorField label="Employees assigned">
            <span className="ri-meta-value">{employeeCount}</span>
          </InspectorField>
        </InspectorGroup>

        <InspectorGroup title={`Tools (${tools.size})`}>
          <ToolChecklist tools={tools} onToggle={toggleTool} readOnly={readOnly} />
        </InspectorGroup>

        <InspectorGroup title={`Prompts (${promptRefCount})`}>
          <InspectorField label="Prompt refs / inline">
            <textarea
              className="ri-textarea ri-textarea-mono"
              rows={5}
              placeholder="One prompt ref or inline instruction per line"
              value={promptRefs}
              onChange={e => handlePromptRefsChange(e.target.value)}
              disabled={readOnly}
            />
          </InspectorField>
        </InspectorGroup>

        <RoleInspectorRuntimeSection
          role={role}
          isCoveredByExternalTeam={isCoveredByExternalTeam}
          isExternalTeamBoundary={isExternalTeamBoundary}
          isCoveredDescendant={isCoveredDescendant}
          teamBindingEditable={teamBindingEditable}
          teamMutationPending={teamMutationPending}
          handleExecutionScopeChange={handleExecutionScopeChange}
          coveredRoles={coveredRoles}
          capabilityManifest={capabilityManifest}
          execStrategy={execStrategy}
          handleExecStrategyChange={handleExecStrategyChange}
          readOnly={readOnly}
          extAgent={extAgent}
          handleExtAgentChange={handleExtAgentChange}
        />

        <InspectorGroup title="Advanced">
          <InspectorField label="Role type">
            <span className="ri-meta-value">{role.role_type ?? 'worker'}</span>
          </InspectorField>
          <InspectorField label="Skills">
            <span className="ri-meta-value">
              {role.skill_refs && role.skill_refs.length > 0 ? role.skill_refs.join(', ') : '(none)'}
            </span>
          </InspectorField>
          <InspectorField label="Artifact contract">
            <span className="ri-meta-value">{role.artifact_contract_ref ?? '(none)'}</span>
          </InspectorField>
        </InspectorGroup>
      </div>

      {!readOnly && (
        <footer className="ri-panel-footer">
          <button
            className={`btn btn-sm ${confirmDelete ? 'btn-danger' : 'btn-ghost'}`}
            onClick={handleDelete}
            onBlur={() => setConfirmDelete(false)}
          >
            {confirmDelete ? 'Confirm delete?' : 'Delete role'}
          </button>
        </footer>
      )}
    </aside>
  )
}


