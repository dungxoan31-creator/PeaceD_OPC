import { useEffect, useMemo, useRef, useState } from 'react'
import type { OrgRole, OrgEmployee, SavedOrgSummary } from './types'
import { StructureEditor } from './StructureEditor'
import { resolveRoleIcon } from './roleIcons'
import { QuickStartWizard } from './QuickStartWizard'

/* ── Inline SVG icon data-URIs (no external CDN — see P4.5 Phase 5) ─── */
const ICON = {
  team: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23888' d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E",
  deploy: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%2322c55e' d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z'/%3E%3C/svg%3E",
  person: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23888' d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E",
  addPerson: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23888' d='M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E",
  trash: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23ef4444' d='M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z'/%3E%3C/svg%3E",
}

/* ── TeamView ──────────────────────────────────────────────────── */

type TeamViewProps = {
  roles: OrgRole[]
  employees: OrgEmployee[]
  /** role_id -> recruited names for the selected session (canvas display only). */
  sessionRecruitmentByRole?: Record<string, string[]> | null
  isCustomMode?: boolean
  organizationId?: string
  onAddRole: (roleId: string, name: string, responsibility: string, reportsTo: string, icon?: string | null) => void
  onBulkAddRoles?: (roles: { role_id: string; name: string; responsibility: string; reports_to: string }[]) => void
  onUpdateRole: (roleId: string, updates: { name?: string; responsibility?: string; reports_to?: string; can_spawn?: string[]; icon?: string | null; execution_strategy?: string; preferred_external_agent?: string | null; prompt_refs?: string[] }) => void
  onDeleteRole: (roleId: string) => void
  onBindExternalTeam?: (data: { boundary_role_id: string; organization_id?: string; scope: 'subtree' }) => void
  onUnbindExternalTeam?: (data: { binding_id?: string; boundary_role_id?: string; organization_id?: string }) => void
  onExport: (data: { package_id: string; name: string; description: string; version: string }) => void
  onImportEmployee?: (employeeId: string) => void
  onResetArchitecture?: () => void
  onSwitchToTab: (target: 'employees' | 'architecture') => void
  // Saved org architectures — passed to StructureEditor for toolbar pill
  savedOrgsList?: SavedOrgSummary[] | null
  activeSavedOrg?: string | null
  currentOrgVersion?: number
  versionAtLoad?: number | null
  onSavedOrgsList?: () => void
  onSavedOrgSaveAs?: (name: string, overwrite: boolean) => void
  onSavedOrgLoad?: (name: string) => void
  onSavedOrgDelete?: (name: string) => void
}

export function TeamView({
  roles, employees, sessionRecruitmentByRole, isCustomMode, organizationId,
  onAddRole, onBulkAddRoles, onUpdateRole, onDeleteRole, onBindExternalTeam, onUnbindExternalTeam, onExport,
  onImportEmployee,
  onResetArchitecture, onSwitchToTab,
  savedOrgsList, activeSavedOrg, currentOrgVersion, versionAtLoad,
  onSavedOrgsList, onSavedOrgSaveAs, onSavedOrgLoad, onSavedOrgDelete,
}: TeamViewProps) {
  const [quickStartPending, setQuickStartPending] = useState(false)
  const [showExportForm, setShowExportForm] = useState(false)
  const [exportId, setExportId] = useState('')
  const [exportName, setExportName] = useState('')
  const [exportDesc, setExportDesc] = useState('')
  const [exportVersion, setExportVersion] = useState('1.0.0')

  const empByRole = useMemo(() => {
    const m = new Map<string, OrgEmployee[]>()
    for (const e of employees) {
      const roleIds = e.role_ids?.length ? e.role_ids : [e.role_id]
      for (const roleId of roleIds) {
        if (!roleId) {continue}
        const list = m.get(roleId) || []; list.push(e); m.set(roleId, list)
      }
    }
    return m
  }, [employees])

  const handleExport = () => {
    if (!exportId.trim() || !exportName.trim()) {return}
    onExport({ package_id: exportId.trim(), name: exportName.trim(), description: exportDesc, version: exportVersion })
    setShowExportForm(false); setExportId(''); setExportName(''); setExportDesc(''); setExportVersion('1.0.0')
  }

  // When roles arrive after bulk add, clear the quick-start loading state.
  const quickStartTimer = useRef<ReturnType<typeof setTimeout>>(null)
  useEffect(() => {
    if (quickStartPending && roles.length > 0) {
      setQuickStartPending(false)
      if (quickStartTimer.current) { clearTimeout(quickStartTimer.current); quickStartTimer.current = null }
    }
  }, [roles.length, quickStartPending])
  // Timeout: if roles never arrive within 10s, reset to wizard
  useEffect(() => {
    if (!quickStartPending) {return}
    quickStartTimer.current = setTimeout(() => setQuickStartPending(false), 10000)
    return () => { if (quickStartTimer.current) {clearTimeout(quickStartTimer.current)} }
  }, [quickStartPending])

  const handleQuickStart = (
    newRoles: { name: string; responsibility: string; reportsTo: string }[],
  ) => {
    const nameToId = new Map<string, string>()
    const usedIds = new Set<string>()
    const bulkRoles: { role_id: string; name: string; responsibility: string; reports_to: string }[] = []

    for (const r of newRoles) {
      let id = r.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/^-+|-+$/g, '')
      if (!id) {continue} // skip roles with empty ID (e.g. name was "!!!")
      // Deduplicate: append suffix if ID already used
      let finalId = id
      let suffix = 2
      while (usedIds.has(finalId)) { finalId = `${id}-${suffix++}` }
      usedIds.add(finalId)
      nameToId.set(r.name, finalId)
      const parentId = r.reportsTo === 'owner' ? 'owner' : (nameToId.get(r.reportsTo) || 'owner')
      bulkRoles.push({ role_id: finalId, name: r.name, responsibility: r.responsibility, reports_to: parentId })
    }

    if (bulkRoles.length === 0) {return} // all roles had invalid names

    if (onBulkAddRoles) {
      setQuickStartPending(true)
      onBulkAddRoles(bulkRoles)
    } else {
      for (const r of bulkRoles) {onAddRole(r.role_id, r.name, r.responsibility, r.reports_to)}
      setQuickStartPending(true)
    }
  }

  const handleReset = () => {
    if (!confirm('This will remove all org roles, employees, and work-item templates. Continue?')) {return}
    onResetArchitecture?.()
  }

  const assignedRoleCount = useMemo(() => {
    let count = 0
    for (const role of roles) {
      if (role.covered_by_external_team || (empByRole.get(role.role_id) ?? []).length > 0) {count += 1}
    }
    return count
  }, [roles, empByRole])
  const linkedEmployeeCount = useMemo(
    () => employees.filter(e => e.linked_agent_id).length,
    [employees],
  )
  const vacantRoleCount = Math.max(0, roles.filter(role =>
    !role.covered_by_external_team && (empByRole.get(role.role_id) ?? []).length === 0,
  ).length)

  // Show wizard only in org mode when no roles exist
  if (isCustomMode && roles.length === 0) {
    return (
      <div className="team-view">
        {quickStartPending ? (
          <div className="qs-wizard">
            <div className="qs-loading">
              <span className="spinner-inline" /> Setting up your team...
            </div>
          </div>
        ) : (
          <QuickStartWizard onComplete={handleQuickStart} onSwitchToTab={onSwitchToTab} />
        )}
      </div>
    )
  }

  return (
    <div className="team-view">
      <div className={`team-command-bar${isCustomMode ? ' team-command-bar--editable' : ' team-command-bar--readonly'}`}>
        <div className="team-command-copy">
          <span className="team-command-eyebrow">{isCustomMode ? 'Saved org workspace' : 'Corporate baseline'}</span>
          <span className="team-command-title">{isCustomMode ? 'Editable company architecture' : 'Built-in company architecture'}</span>
        </div>
        <div className="team-command-metrics">
          <span><b>{assignedRoleCount}</b> staffed roles</span>
          <span><b>{vacantRoleCount}</b> vacant</span>
          <span><b>{linkedEmployeeCount}</b> in office</span>
        </div>
        {isCustomMode && (
          <div className="team-command-actions">
            <button className="myorg-inline-btn" onClick={() => onSwitchToTab('employees')}>
              <img src={ICON.addPerson} alt="" className="myorg-inline-icon" /> Hire Talent
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowExportForm(true)}>
              Export Package
            </button>
            {onResetArchitecture && (
              <button className="myorg-reset-btn" onClick={handleReset}>
                <img src={ICON.trash} alt="" className="myorg-reset-icon" /> Reset
              </button>
            )}
          </div>
        )}
      </div>

      {!isCustomMode && (
        <div className="team-readonly-strip">
          Corporate role structure is fixed. Execution scope can still bind a role subtree to one JiuwenSwarm-team.
        </div>
      )}

      {/* Structure Editor (Canvas + Table + Inspector) */}
      <StructureEditor
        roles={roles}
        employees={employees}
        sessionRecruitmentByRole={sessionRecruitmentByRole}
        isCustomMode={isCustomMode}
        organizationId={organizationId}
        onAddRole={onAddRole}
        onUpdateRole={onUpdateRole}
        onDeleteRole={onDeleteRole}
        onBindExternalTeam={onBindExternalTeam}
        onUnbindExternalTeam={onUnbindExternalTeam}
        savedOrgsList={savedOrgsList ?? null}
        activeSavedOrg={activeSavedOrg ?? null}
        currentOrgVersion={currentOrgVersion ?? 0}
        versionAtLoad={versionAtLoad ?? null}
        onSavedOrgsList={onSavedOrgsList}
        onSavedOrgSaveAs={onSavedOrgSaveAs}
        onSavedOrgLoad={onSavedOrgLoad}
        onSavedOrgDelete={onSavedOrgDelete}
      />
      {/* Export form */}
      {showExportForm && (
        <div className="myorg-form">
          <h4 className="myorg-form-title">Export as .opcpkg</h4>
          <div className="oc-form-row"><label>Package ID</label>
            <input value={exportId} onChange={e => setExportId(e.target.value)} placeholder="my-architecture" /></div>
          <div className="oc-form-row"><label>Name</label>
            <input value={exportName} onChange={e => setExportName(e.target.value)} placeholder="My Architecture" /></div>
          <div className="oc-form-row"><label>Description</label>
            <input value={exportDesc} onChange={e => setExportDesc(e.target.value)} placeholder="An org team structure" /></div>
          <div className="oc-form-row"><label>Version</label>
            <input value={exportVersion} onChange={e => setExportVersion(e.target.value)} /></div>
          <div className="oc-form-actions">
            <button className="oc-btn-primary" onClick={handleExport} disabled={!exportId.trim() || !exportName.trim()}>Export</button>
            <button className="oc-btn-ghost" onClick={() => setShowExportForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Team Roster — enhanced with actions */}
      <div className="myorg-section">
        <div className="myorg-section-header">
          <img src={ICON.team} alt="" className="myorg-section-icon" />
          <h3 className="myorg-section-title">Team Roster</h3>
          <span className="myorg-section-count">{employees.length} members</span>
          <span className="myorg-section-spacer" />
          <span className="myorg-section-note">{assignedRoleCount}/{roles.length} staffed</span>
        </div>
        <div className="team-roster-grid">
          {roles.map(r => {
            const emps = empByRole.get(r.role_id) || []
            const externallyCovered = Boolean(r.covered_by_external_team)
            return (
              <div key={r.role_id} className={`team-roster-card${externallyCovered ? ' team-roster-card--external' : ''}`}>
                <div className="team-roster-card-header">
                  <img src={resolveRoleIcon(r.icon)} alt="" className="team-roster-card-icon" />
                  <span className="team-roster-role-name">{r.name}</span>
                  <span className="team-roster-count">{externallyCovered ? 'team' : (emps.length || 'vacant')}</span>
                </div>
                {externallyCovered ? (
                  <div className="team-roster-external">
                    <b>{r.external_team_boundary ? 'JiuwenSwarm-team boundary' : 'Covered by external team'}</b>
                    <span>{r.external_team_boundary
                      ? 'No separate role recruitment; JiuwenSwarm-team manages internal staffing.'
                      : `Inherited from ${r.external_team_boundary_role_id ?? 'team boundary'}.`}</span>
                  </div>
                ) : emps.length > 0 ? emps.map(e => (
                  <div key={e.employee_id} className="team-roster-emp">
                    <img src={ICON.person} alt="" className="team-roster-emp-avatar" />
                    <div className="team-roster-emp-info">
                      <span className="team-roster-emp-name">{e.name}</span>
                      <span className={`team-roster-seniority team-roster-seniority--${e.seniority}`}>{e.seniority}</span>
                    </div>
                    {e.linked_agent_id ? (
                      <span className="team-roster-badge team-roster-badge--active">In Office</span>
                    ) : onImportEmployee && e.role_id ? (
                      <button className="team-roster-deploy-btn" onClick={() => onImportEmployee(e.employee_id)}
                        title="Add this employee to the office workspace">
                        <img src={ICON.deploy} alt="" className="team-roster-deploy-icon" /> Deploy
                      </button>
                    ) : null}
                  </div>
                )) : (
                  <div className="team-roster-vacant">
                    <span className="team-roster-vacant-text">No members yet</span>
                    {isCustomMode && <button className="team-roster-hire-btn" onClick={() => onSwitchToTab('employees')}>Hire</button>}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
