import { useState } from 'react'
import type { OrgInfoPayload, SavedOrgSummary } from './types'

const TAB_ICON = {
  runtime: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23888' d='M13 2.05v2.02c3.95.49 7 3.85 7 7.93 0 3.21-1.81 6-4.72 7.72L13 17v5h5l-1.22-1.22C19.91 19.07 22 15.76 22 12c0-5.18-3.95-9.45-9-9.95zM11 2.05C5.95 2.55 2 6.82 2 12c0 3.76 2.09 7.07 5.22 8.78L6 22h5V2.05z'/%3E%3C/svg%3E",
  employees: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23888' d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E",
}

const STAT_ICON = {
  agents: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23888' d='M20 9V7c0-1.1-.9-2-2-2h-3c0-1.66-1.34-3-3-3S9 3.34 9 5H6c-1.1 0-2 .9-2 2v2c-1.66 0-3 1.34-3 3s1.34 3 3 3v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4c1.66 0 3-1.34 3-3s-1.34-3-3-3z'/%3E%3C/svg%3E",
  active: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%2322c55e' d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z'/%3E%3C/svg%3E",
}

export type OrgHeaderProps = {
  data: OrgInfoPayload
  isCustomMode: boolean
  architectureKindLabel: string
  activeOrgLabel: string
  architectureStateLabel: string
  runtimeStateLabel: string
  activeOrgId: string
  savedOrgOptions: SavedOrgSummary[]
  selectedOrgValue: string
  handleOrgSelection: (val: string) => void
  onSavedOrgsList?: () => void
  setCreateOpen: (open: boolean) => void
  displayRolesCount: number
  displayEmployeesCount: number
  runtimeTeamsCount: number
  activeAgentsCount: number
  t: (key: string) => string
  isDirty?: boolean
  flushSave?: () => Promise<void>
}

export function OrgHeader({
  data,
  isCustomMode,
  architectureKindLabel,
  activeOrgLabel,
  architectureStateLabel,
  runtimeStateLabel,
  activeOrgId,
  savedOrgOptions,
  selectedOrgValue,
  handleOrgSelection,
  onSavedOrgsList,
  setCreateOpen,
  displayRolesCount,
  displayEmployeesCount,
  runtimeTeamsCount,
  activeAgentsCount,
  t,
  isDirty,
  flushSave,
}: OrgHeaderProps) {
  const [applying, setApplying] = useState(false)

  return (
    <div className={`org-header${isCustomMode ? ' org-header--custom' : ' org-header--corporate'}`}>
      <div className="org-header-main">
        <div className="org-eyebrow">
          <span>{t('org.company')}</span>
          <span className="org-eyebrow-separator">/</span>
          <span>{architectureKindLabel}</span>
        </div>
        <div className="org-title-row">
          <h2 className="org-title">{activeOrgLabel}</h2>
          <span className="org-version-badge">v{data.org_version}</span>
          <span className={`org-state-badge${isCustomMode ? ' org-state-badge--editable' : ' org-state-badge--readonly'}`}>
            {architectureStateLabel}
          </span>
        </div>
        {isDirty && (
          <div className="flex items-center gap-2 rounded-md bg-[var(--surface)] border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--text-secondary)]">
            <span>Org config has unsaved changes</span>
            <button
              type="button"
              className="ml-2 rounded px-2 py-0.5 bg-[var(--accent)] text-white text-xs disabled:opacity-50 cursor-pointer"
              disabled={applying || !flushSave}
              onClick={async () => {
                if (!flushSave) {
                  return
                }
                setApplying(true)
                try {
                  await flushSave()
                } finally {
                  setApplying(false)
                }
              }}
            >
              {applying ? 'Saving…' : 'Save Config'}
            </button>
          </div>
        )}
        <div className="org-header-meta">
          <span className="org-meta-pill">{data.company_profile || (isCustomMode ? 'custom' : 'corporate')}</span>
          {activeOrgId && <code className="org-meta-code">{activeOrgId}</code>}
          <span className="org-meta-pill org-meta-pill--runtime">{runtimeStateLabel}</span>
          <span className="org-meta-pill org-meta-pill--saved">{t('common.autoSaved')}</span>
        </div>
      </div>

      <div className="org-control-panel">
        <label className="org-switcher">
          <span className="org-switcher-label">{t('org.organization')}</span>
          <span className="org-switcher-select-wrap">
            <select
              className="org-switcher-select"
              value={selectedOrgValue}
              onChange={e => handleOrgSelection(e.target.value)}
              onFocus={() => onSavedOrgsList?.()}
              onPointerDown={() => onSavedOrgsList?.()}
              aria-label={t('org.organization')}
            >
              <option value="corporate">{t('org.corporate')}</option>
              {savedOrgOptions.map(org => (
                <option key={org.name} value={`org:${org.name}`}>
                  {(org.organization_name || org.name).trim() || org.name}
                </option>
              ))}
            </select>
          </span>
        </label>
        <button type="button" className="org-create-trigger" onClick={() => setCreateOpen(true)}>
          <span className="org-create-trigger-icon" aria-hidden>+</span>
          {t('org.newOrganization')}
        </button>
      </div>

      <div className="org-stats-strip">
        <span className="org-stat">
          <img src={STAT_ICON.agents} alt="" className="org-stat-icon" />
          <b>{displayRolesCount}</b> {t('org.roles')}
        </span>
        <span className="org-stat">
          <img src={TAB_ICON.employees} alt="" className="org-stat-icon" />
          <b>{displayEmployeesCount}</b> {t('org.employees')}
        </span>
        <span className="org-stat">
          <img src={TAB_ICON.runtime} alt="" className="org-stat-icon" />
          <b>{runtimeTeamsCount}</b> {t('org.runtimeTeams')}
        </span>
        <span className="org-stat">
          <img src={STAT_ICON.active} alt="" className="org-stat-icon" />
          <b>{activeAgentsCount}</b> {t('common.active')}
        </span>
      </div>
    </div>
  )
}

