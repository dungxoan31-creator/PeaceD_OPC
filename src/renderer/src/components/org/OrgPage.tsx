import React from 'react'
import { OrgTab } from './OrgTab'
import { useOrgLocalState } from './org-store'
import { useAppStore } from '@/store'
import './org.css'

import { Spatial3DScene } from '../spatial/Spatial3DScene'

type CustomCSSProperties = React.CSSProperties & {
  '--bg'?: string
  '--bg-elevated'?: string
  '--text'?: string
  '--text-secondary'?: string
  '--text-muted'?: string
  '--border'?: string
  '--surface'?: string
  '--accent'?: string
  '--primary'?: string
  '--danger'?: string
  '--success'?: string
}

export function OrgPage(): React.JSX.Element {
  const activeWorktreeId = useAppStore((s) => s.activeWorktreeId)
  const worktrees = useAppStore((s) => s.worktreesByRepo)
  const activeWorktree = activeWorktreeId
    ? Object.values(worktrees).flat().find((w) => w.id === activeWorktreeId)
    : null
  const worktreeRoot = activeWorktree?.path ?? null

  const store = useOrgLocalState(worktreeRoot)

  const orgThemeStyle: CustomCSSProperties = {
    // Bridge PeaceD OPC CSS theme tokens into Org design system
    '--bg': 'var(--background, #070913)',
    '--bg-elevated': 'var(--card, #0d1329)',
    '--text': 'var(--foreground, #f1f5f9)',
    '--text-secondary': 'var(--muted-foreground, #8e9eb8)',
    '--text-muted': 'var(--muted-foreground, #64748b)',
    '--border': 'var(--glass-border, rgba(56, 189, 248, 0.18))',
    '--surface': 'var(--glass-surface, rgba(14, 20, 44, 0.72))',
    '--accent': 'var(--primary, #00f0ff)',
    '--primary': 'var(--primary, #00f0ff)',
    '--danger': 'var(--destructive, #ff4d6d)',
    '--success': 'var(--status-success, #00ff9d)',
  }

  return (
    <div
      className="org-page-container w-full h-full flex flex-col min-w-0 min-h-0 overflow-hidden relative"
      style={orgThemeStyle}
    >
      <Spatial3DScene intensity="subtle" showCore={false} particleCount={160} />
      <div className="relative z-10 w-full h-full flex flex-col min-w-0 min-h-0">
      <OrgTab
        data={store.data}
        loadState={store.loadState}
        isDirty={store.isDirty}
        flushSave={store.flushSave}
        talents={store.talents}
        employeeDetail={store.employeeDetail}
        reorgProposals={store.reorgProposals}
        isCustomMode={store.isCustomMode}
        onRequestData={store.onRequestData}
        onRequestTalents={store.onRequestTalents}
        onRequestEmployeeDetail={store.onRequestEmployeeDetail}
        onHireTalent={store.onHireTalent}
        hiringTemplateId={store.hiringTemplateId}
        onRequestReorgList={store.onRequestReorgList}
        onReorgDecide={store.onReorgDecide}
        marketPresets={store.marketPresets}
        marketPreviewData={store.marketPreviewData}
        onMarketBrowse={store.onMarketBrowse}
        onMarketPreview={store.onMarketPreview}
        onMarketApplyPreset={store.onMarketApplyPreset}
        onMarketClearPreview={store.onMarketClearPreview}
        onConfigExport={store.onConfigExport}
        onConfigImport={store.onConfigImport}
        configExportYaml={store.configExportYaml}
        configImportPreview={store.configImportPreview}
        configImportError={store.configImportError}
        savedOrgsList={store.savedOrgsList}
        activeSavedOrg={store.activeSavedOrg}
        activeSavedOrgVersionAtLoad={store.activeSavedOrgVersionAtLoad}
        orgCreatePending={store.orgCreatePending}
        orgCreateResult={store.orgCreateResult}
        onSavedOrgSaveAs={store.onSavedOrgSaveAs}
        onSavedOrgCreate={store.onSavedOrgCreate}
        onSavedOrgLoad={store.onSavedOrgLoad}
        onSavedOrgDelete={store.onSavedOrgDelete}
        onSelectCorporate={store.onSelectCorporate}
        onAddRole={store.onAddRole}
        onBulkAddRoles={store.onBulkAddRoles}
        onUpdateRole={store.onUpdateRole}
        onDeleteRole={store.onDeleteRole}
        onUpdateOrgStrategy={store.onUpdateOrgStrategy}
        onUpdateRuntimePolicy={store.onUpdateRuntimePolicy}
        onResetArchitecture={store.onResetArchitecture}
      />
      </div>
    </div>
  )
}

export default OrgPage
