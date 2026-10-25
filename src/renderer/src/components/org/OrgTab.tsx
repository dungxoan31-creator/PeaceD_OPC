import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type {
  OrgInfoPayload,
  OrgCreateMemberInput,
  OrgSavedCreatePayload,
  SavedOrgSummary,
  TalentTemplate,
  EmployeeDetailPayload,
  ReorgProposalInfo,
  ArchitecturePreset,
  ArchitecturePresetDetail,
  HireTalentHandler,
  InteractionReplyReceipt,
} from './types'
import { TeamView } from './TeamView'
import { DelegationStrategyPanel } from './DelegationStrategyPanel'
import { ArchitectureMarketplace } from './ArchitectureMarketplace'
import { EmployeesMarketplace } from './EmployeesMarketplace'
import { ConfigImportExportPanel } from './ConfigImportExportPanel'
import { OrgCreateModal } from './OrgCreateModal'
import { OrgHeader } from './OrgHeader'
import { getRuntimeOrgView } from './runtimeOrg'
import { useI18n } from './i18n'
import './org.css'
import './team.css'
import './marketplace.css'
import './config.css'
import './structure.css'

/* ── Inline SVG icon data-URIs (no external CDN) ────────────────── */
const TAB_ICON = {
  team: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23888' d='M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z'/%3E%3C/svg%3E",
  runtime: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23888' d='M13 2.05v2.02c3.95.49 7 3.85 7 7.93 0 3.21-1.81 6-4.72 7.72L13 17v5h5l-1.22-1.22C19.91 19.07 22 15.76 22 12c0-5.18-3.95-9.45-9-9.95zM11 2.05C5.95 2.55 2 6.82 2 12c0 3.76 2.09 7.07 5.22 8.78L6 22h5V2.05z'/%3E%3C/svg%3E",
  architecture: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23888' d='M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z'/%3E%3C/svg%3E",
  employees: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23888' d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E",
}

type SubTab = 'team' | 'runtime' | 'architecture' | 'employees'

function humanizeOrgName(value?: string | null): string {
  const normalized = String(value ?? '').trim()
  if (!normalized) {return ''}
  return normalized
    .replace(/^org[_-]/i, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, char => char.toUpperCase())
}

type OrgTabProps = {
  data: OrgInfoPayload | null
  /** role_id -> recruited names for the selected session (canvas display only). */
  sessionRecruitmentByRole?: Record<string, string[]> | null
  talents: TalentTemplate[]
  employeeDetail: EmployeeDetailPayload | null
  reorgProposals: ReorgProposalInfo[]
  isCustomMode?: boolean
  onRequestData: () => void
  onRequestTalents: () => void
  onRequestEmployeeDetail: (employeeId: string) => void
  onHireTalent: HireTalentHandler
  hiringTemplateId?: string | null
  onImportEmployee?: (employeeId: string) => void
  onRequestReorgList: () => void
  onReorgDecide: (
    proposal: ReorgProposalInfo,
    approved: boolean,
    notes?: string,
  ) => Promise<InteractionReplyReceipt>
  // Market
  onMarketExport?: (data: { package_id: string; name: string; description: string; version: string }) => void
  onMarketInstall?: (path: string, strategy: string) => void
  onMarketUninstall?: (packageId: string) => void
  // Architecture gallery
  marketPresets?: ArchitecturePreset[]
  marketPreviewData?: ArchitecturePresetDetail | null
  onMarketBrowse?: () => void
  onMarketPreview?: (presetId: string) => void
  onMarketApplyPreset?: (presetId: string, strategy: string) => void
  onMarketClearPreview?: () => void
  // Config import/export
  onConfigExport?: () => void
  onConfigImport?: (yaml: string, dryRun: boolean) => void
  configExportYaml?: string | null
  configImportPreview?: { roles_added: number; roles_removed: number; employees_changed: number } | null
  configImportError?: string | null
  // Saved org architectures (named snapshots) — rendered in the Team tab toolbar
  onSavedOrgsList?: () => void
  onSavedOrgSaveAs?: (name: string, overwrite: boolean) => void
  onSavedOrgCreate?: (organizationName: string, members: OrgCreateMemberInput[]) => void
  onSavedOrgLoad?: (name: string) => void
  onSavedOrgDelete?: (name: string) => void
  savedOrgsList?: SavedOrgSummary[] | null
  activeSavedOrg?: string | null
  activeSavedOrgVersionAtLoad?: number | null
  orgCreatePending?: boolean
  orgCreateResult?: (OrgSavedCreatePayload & { nonce: number }) | null
  onSelectCorporate?: () => void
  // Org editing
  onAddRole?: (roleId: string, name: string, responsibility: string, reportsTo: string, icon?: string | null) => void
  onBulkAddRoles?: (roles: { role_id: string; name: string; responsibility: string; reports_to: string }[]) => void
  onUpdateRole?: (roleId: string, updates: { name?: string; responsibility?: string; reports_to?: string; can_spawn?: string[]; icon?: string | null; execution_strategy?: string; preferred_external_agent?: string | null; prompt_refs?: string[] }) => void
  onDeleteRole?: (roleId: string) => void
  onBindExternalTeam?: (data: { boundary_role_id: string; organization_id?: string; scope: 'subtree' }) => void
  onUnbindExternalTeam?: (data: { binding_id?: string; boundary_role_id?: string; organization_id?: string }) => void
  onUpdateOrgStrategy?: (data: { final_decider_role_id?: string | null }) => void
  onUpdateRuntimePolicy?: (policy: Record<string, unknown>) => void
  onResetArchitecture?: () => void
  loadState?: 'loading' | 'ready' | 'error'
  isDirty?: boolean
  flushSave?: () => Promise<void>
}

export function OrgTab({
  data, loadState: _loadState, isDirty, flushSave, sessionRecruitmentByRole, talents, employeeDetail: _employeeDetail, reorgProposals, isCustomMode,
  onRequestData, onRequestTalents, onRequestEmployeeDetail: _onRequestEmployeeDetail,
  onHireTalent, hiringTemplateId, onImportEmployee, onRequestReorgList, onReorgDecide,
  onMarketExport, onMarketInstall, onMarketUninstall,
  marketPresets, marketPreviewData, onMarketBrowse, onMarketPreview, onMarketApplyPreset, onMarketClearPreview,
  onAddRole, onBulkAddRoles, onUpdateRole, onDeleteRole, onBindExternalTeam, onUnbindExternalTeam, onUpdateOrgStrategy,
  onUpdateRuntimePolicy, onResetArchitecture,
  onConfigExport, onConfigImport, configExportYaml, configImportPreview, configImportError,
  onSavedOrgsList, onSavedOrgSaveAs, onSavedOrgCreate, onSavedOrgLoad, onSavedOrgDelete, savedOrgsList,
  activeSavedOrg, activeSavedOrgVersionAtLoad, orgCreatePending, orgCreateResult, onSelectCorporate,
}: OrgTabProps) {
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState<SubTab>('team')
  const [createOpen, setCreateOpen] = useState(false)

  const switchTab = useCallback((tab: SubTab) => {
    setActiveTab(tab)
  }, [])
  const [applyingPresetId, setApplyingPresetId] = useState<string | null>(null)
  const versionAtApply = useRef<number>(-1) // track org_version when apply starts
  const [toast, setToast] = useState<{ msg: string; type: 'info' | 'warn' } | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(null)

  const showToast = useCallback((msg: string, type: 'info' | 'warn' = 'info') => {
    setToast({ msg, type })
    if (toastTimer.current) {clearTimeout(toastTimer.current)}
    toastTimer.current = setTimeout(() => setToast(null), 3000)
  }, [])

  useEffect(() => () => {
    if (toastTimer.current) {clearTimeout(toastTimer.current)}
  }, [])

  const onRequestDataRef = useRef(onRequestData)
  const onRequestTalentsRef = useRef(onRequestTalents)
  const onRequestReorgListRef = useRef(onRequestReorgList)
  const onMarketBrowseRef = useRef(onMarketBrowse)
  const onSavedOrgsListRef = useRef(onSavedOrgsList)
  onRequestDataRef.current = onRequestData
  onRequestTalentsRef.current = onRequestTalents
  onRequestReorgListRef.current = onRequestReorgList
  onMarketBrowseRef.current = onMarketBrowse
  onSavedOrgsListRef.current = onSavedOrgsList

  useEffect(() => {
    onRequestDataRef.current()
    onRequestTalentsRef.current()
    onRequestReorgListRef.current()
    onMarketBrowseRef.current?.()
    onSavedOrgsListRef.current?.()
  }, [])

  useEffect(() => {
    if (!orgCreateResult || !orgCreateResult.ok) {return}
    setCreateOpen(false)
    setActiveTab('team')
    showToast(t('org.createdToast', { name: orgCreateResult.organization_name || orgCreateResult.name }))
  }, [orgCreateResult, showToast, t])

  // In org mode: show only user-owned roles. In company mode: show all roles read-only.
  const roles = data?.roles
  const displayRoles = useMemo(() => {
    const list = roles ?? []
    return isCustomMode ? list.filter(r => !r.is_builtin) : list
  }, [roles, isCustomMode])
  const displayEmployees = useMemo(() => data?.employees ?? [], [data?.employees])
  const runtimeView = useMemo(() => getRuntimeOrgView(data), [data])
  const activeAgents = useMemo(() => displayEmployees.filter(e => e.linked_agent_id), [displayEmployees])
  const configuredOrgName = data?.organization_name?.trim()
  const activeOrgLabel = configuredOrgName || humanizeOrgName(activeSavedOrg) || (isCustomMode ? t('org.customOrg') : t('org.corporateCompany'))
  const activeOrgId = (isCustomMode ? (data?.organization_id || activeSavedOrg) : 'corporate') || ''
  const architectureKindLabel = isCustomMode ? t('org.kind.saved') : t('org.kind.corporate')
  const architectureStateLabel = isCustomMode
    ? activeSavedOrg ? t('org.state.editableSaved') : t('org.state.editableDraft')
    : t('org.state.readOnly')
  const runtimeStateLabel = runtimeView.frontier.status || runtimeView.projectRun?.status || runtimeView.projectRun?.lifecycle_status || t('common.ready')

  // Roles that already have at least one non-placeholder employee.
  const filledRoleIds = useMemo(
    () => {
      const ids = new Set<string>()
      for (const employee of displayEmployees) {
        if (employee.is_default_employee) {continue}
        const roleIds = employee.role_ids?.length ? employee.role_ids : [employee.role_id]
        for (const roleId of roleIds) {
          if (roleId) {ids.add(roleId)}
        }
      }
      return ids
    },
    [displayEmployees],
  )
  const vacantRoles = useMemo(() => displayRoles.filter(r => !filledRoleIds.has(r.role_id)), [displayRoles, filledRoleIds])

  const installedIds = useMemo(() => new Set((data?.installed_packages ?? []).map(p => p.package_id)), [data?.installed_packages])

  // When applying a preset, wait for org_version to change (every config.save() increments it)
  const orgVersion = data?.org_version ?? 0
  useEffect(() => {
    if (applyingPresetId && versionAtApply.current >= 0 && orgVersion !== versionAtApply.current) {
      setApplyingPresetId(null)
      versionAtApply.current = -1
      setActiveTab('team')
      showToast(t('org.architectureApplied'))
    }
  }, [orgVersion, applyingPresetId, showToast, t])

  const handleApplyPreset = (presetId: string, strategy: string) => {
    versionAtApply.current = orgVersion // snapshot current version
    setApplyingPresetId(presetId)
    onMarketApplyPreset?.(presetId, strategy)
  }

  const handleOrgSelection = (value: string) => {
    if (value === 'corporate') {
      onSelectCorporate?.()
      return
    }
    if (value.startsWith('org:')) {
      const orgName = value.slice(4)
      if (orgName) {onSavedOrgLoad?.(orgName)}
    }
  }

  if (!data) {
    return <div className="org-tab"><div className="org-loading">{t('org.loading')}</div></div>
  }

  const installedPackages = data.installed_packages ?? []
  const savedOrgOptions = savedOrgsList ?? []
  const selectedOrgValue = isCustomMode && activeSavedOrg ? `org:${activeSavedOrg}` : 'corporate'

  return (
    <div className="org-tab">
      <OrgHeader
        data={data}
        isCustomMode={Boolean(isCustomMode)}
        architectureKindLabel={architectureKindLabel}
        activeOrgLabel={activeOrgLabel}
        architectureStateLabel={architectureStateLabel}
        runtimeStateLabel={runtimeStateLabel}
        activeOrgId={activeOrgId}
        savedOrgOptions={savedOrgOptions}
        selectedOrgValue={selectedOrgValue}
        handleOrgSelection={handleOrgSelection}
        onSavedOrgsList={onSavedOrgsList}
        setCreateOpen={setCreateOpen}
        displayRolesCount={displayRoles.length}
        displayEmployeesCount={displayEmployees.length}
        runtimeTeamsCount={runtimeView.runtimeTeams.length}
        activeAgentsCount={activeAgents.length}
        t={t}
        isDirty={Boolean(isDirty)}
        flushSave={flushSave}
      />

      <div className="org-subtabs">
        {(
          [
            { id: 'team', icon: TAB_ICON.team, label: t('org.tab.team'), count: displayRoles.length },
            { id: 'runtime', icon: TAB_ICON.runtime, label: t('org.tab.runtime'), count: runtimeView.runtimeTeams.length },
            { id: 'architecture', icon: TAB_ICON.architecture, label: t('org.tab.architecture'), count: marketPresets?.length ?? 0 },
            { id: 'employees', icon: TAB_ICON.employees, label: t('org.tab.employees'), count: talents.length },
          ] satisfies { id: SubTab; icon: string; label: string; count: number }[]
        ).map(tab => (
          <button key={tab.id}
            className={`org-subtab${activeTab === tab.id ? ' org-subtab--active' : ''}`}
            onClick={() => switchTab(tab.id)}>
            <img src={tab.icon} alt="" className="org-subtab-icon" />
            <span className="org-subtab-label">{tab.label}</span>
            <span className="org-subtab-count">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* ── Tab content ─────────────────────────────────── */}
      {/* Toast notification */}
      {toast && (
        <div className={`org-toast org-toast--${toast.type}`} onClick={() => setToast(null)}>
          {toast.msg}
        </div>
      )}

      <div className="org-tab-content">

        {/* Team tab */}
        {activeTab === 'team' && (
          <TeamView
            roles={displayRoles}
            employees={displayEmployees}
            sessionRecruitmentByRole={sessionRecruitmentByRole}
            isCustomMode={isCustomMode}
            organizationId={data.organization_id}
            onAddRole={onAddRole ?? (() => {})}
            onBulkAddRoles={onBulkAddRoles}
            onUpdateRole={onUpdateRole ?? (() => {})}
            onDeleteRole={onDeleteRole ?? (() => {})}
            onBindExternalTeam={onBindExternalTeam}
            onUnbindExternalTeam={onUnbindExternalTeam}
            onExport={onMarketExport ?? (() => {})}
            onImportEmployee={onImportEmployee}
            onResetArchitecture={onResetArchitecture}
            onSwitchToTab={(target) => setActiveTab(target)}
            savedOrgsList={savedOrgsList}
            activeSavedOrg={activeSavedOrg ?? null}
            currentOrgVersion={data?.org_version ?? 0}
            versionAtLoad={activeSavedOrgVersionAtLoad ?? null}
            onSavedOrgsList={onSavedOrgsList}
            onSavedOrgSaveAs={onSavedOrgSaveAs}
            onSavedOrgLoad={onSavedOrgLoad}
            onSavedOrgDelete={onSavedOrgDelete}
          />
        )}

        {/* Runtime tab */}
        {activeTab === 'runtime' && (
          <DelegationStrategyPanel
            roles={displayRoles}
            runtimeTeams={runtimeView.runtimeTeams}
            runtimeSeats={runtimeView.runtimeSeats}
            workItems={runtimeView.workItems}
            frontier={runtimeView.frontier}
            companyProfile={data.company_profile}
            runtimePolicy={data.runtime_policy}
            finalDeciderRoleId={data.final_decider_role_id}
            topLevelRoleIds={data.top_level_role_ids}
            readOnly={!isCustomMode}
            onUpdateOrgStrategy={onUpdateOrgStrategy}
            onUpdateRuntimePolicy={onUpdateRuntimePolicy}
          />
        )}

        {/* Architecture tab */}
        {activeTab === 'architecture' && (
          <>
            <ArchitectureMarketplace
              presets={marketPresets ?? []}
              installedIds={installedIds}
              previewData={marketPreviewData ?? null}
              applyingPresetId={applyingPresetId}
              readOnly={!isCustomMode}
              onPreview={onMarketPreview ?? (() => {})}
              onApplyPreset={handleApplyPreset}
              onClearPreview={onMarketClearPreview ?? (() => {})}
              installedPackages={installedPackages}
              channels={data.channels}
              reorgProposals={reorgProposals}
              isCustomMode={!!isCustomMode}
              onReorgDecide={onReorgDecide}
              onMarketInstall={(p, s) => onMarketInstall?.(p, s)}
              onMarketUninstall={(id) => onMarketUninstall?.(id)}
            />
            {isCustomMode && (
              <ConfigImportExportPanel
                onExport={onConfigExport ?? (() => {})}
                onImport={onConfigImport ?? (() => {})}
                configExportYaml={configExportYaml ?? null}
                importPreview={configImportPreview ?? null}
                importError={configImportError ?? null}
              />
            )}
          </>
        )}

        {/* Employees tab */}
        {activeTab === 'employees' && (
          <EmployeesMarketplace
            templates={talents}
            vacantRoles={vacantRoles}
            hiringTemplateId={hiringTemplateId ?? null}
            readOnly={!isCustomMode}
            onHireTalent={onHireTalent}
          />
        )}
      </div>
      <OrgCreateModal
        open={createOpen}
        pending={orgCreatePending}
        result={orgCreateResult ?? null}
        onClose={() => setCreateOpen(false)}
        onCreate={(organizationName, members) => onSavedOrgCreate?.(organizationName, members)}
      />
    </div>
  )
}

