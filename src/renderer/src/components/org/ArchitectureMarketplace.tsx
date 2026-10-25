import { useMemo, useState } from 'react'
import type {
  ArchitecturePreset,
  ArchitecturePresetDetail,
  InstalledPackageInfo,
  ChannelStatusInfo,
  ReorgProposalInfo,
  InteractionReplyReceipt,
} from './types'
import { PackageCard } from './PackageCard'
import { CollapsibleSection } from './CollapsibleSection'
import { ArchCard, ArchPreviewModal, PATTERN_LABELS } from './ArchitecturePresetCards'

/* ── Inline SVG icon data-URIs (no external CDN) ────────────────── */
const ICON = {
  search: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23888' d='M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z'/%3E%3C/svg%3E",
  arch: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23888' d='M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z'/%3E%3C/svg%3E",
  packages: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23888' d='M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z'/%3E%3C/svg%3E",
  channels: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23888' d='M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z'/%3E%3C/svg%3E",
  reorg: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23888' d='M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z'/%3E%3C/svg%3E",
  importPkg: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23888' d='M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z'/%3E%3C/svg%3E",
}

type ArchitectureMarketplaceProps = {
  presets: ArchitecturePreset[]
  installedIds: Set<string>
  previewData: ArchitecturePresetDetail | null
  applyingPresetId: string | null
  readOnly: boolean
  onPreview: (presetId: string) => void
  onApplyPreset: (presetId: string, strategy: string) => void
  onClearPreview: () => void
  installedPackages: InstalledPackageInfo[]
  channels: ChannelStatusInfo[]
  reorgProposals: ReorgProposalInfo[]
  isCustomMode: boolean
  onReorgDecide: (
    proposal: ReorgProposalInfo,
    approved: boolean,
    notes?: string,
  ) => Promise<InteractionReplyReceipt>
  onMarketInstall: (path: string, strategy: string) => void
  onMarketUninstall: (packageId: string) => void
}

export function ArchitectureMarketplace({
  presets, installedIds, previewData, applyingPresetId, readOnly,
  onPreview, onApplyPreset, onClearPreview,
  installedPackages, channels, reorgProposals, isCustomMode,
  onReorgDecide, onMarketInstall, onMarketUninstall,
}: ArchitectureMarketplaceProps) {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [activePattern, setActivePattern] = useState<string | null>(null)
  const [showImportForm, setShowImportForm] = useState(false)
  const [importPath, setImportPath] = useState('')
  const [uninstallingId, setUninstallingId] = useState<string | null>(null)
  const [submittingReorgId, setSubmittingReorgId] = useState<string | null>(null)
  const [acceptedReorgIds, setAcceptedReorgIds] = useState<Set<string>>(
    () => new Set(),
  )
  const [reorgError, setReorgError] = useState<Record<string, string>>({})

  const categories = useMemo(() => {
    const cats = new Set<string>()
    for (const p of presets) { if (p.category) {cats.add(p.category)} }
    return Array.from(cats).sort()
  }, [presets])

  const patterns = useMemo(() => {
    const pats = new Set<string>()
    for (const p of presets) { if (p.collaboration_pattern) {pats.add(p.collaboration_pattern)} }
    return Array.from(pats).sort()
  }, [presets])

  const filteredPresets = useMemo(() => {
    let result = presets
    if (activeCategory) {result = result.filter(p => p.category === activeCategory)}
    if (activePattern) {result = result.filter(p => p.collaboration_pattern === activePattern)}
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q)) ||
        (PATTERN_LABELS[p.collaboration_pattern] || '').toLowerCase().includes(q),
      )
    }
    return result
  }, [presets, activeCategory, activePattern, search])

  const handleImport = () => {
    if (!importPath.trim()) {return}
    onMarketInstall(importPath.trim(), 'namespace')
    setShowImportForm(false)
    setImportPath('')
  }

  const handleUninstall = (pkgId: string) => {
    if (!confirm('Uninstall this package? Roles and work-item templates from this package will be removed.')) {return}
    setUninstallingId(pkgId)
    onMarketUninstall(pkgId)
    setTimeout(() => setUninstallingId(null), 3000)
  }

  const handleReorgDecision = async (
    proposal: ReorgProposalInfo,
    approved: boolean,
  ) => {
    if (!proposal.checkpoint_id || proposal.checkpoint_status !== 'pending') {return}
    setSubmittingReorgId(proposal.proposal_id)
    setReorgError(current => ({ ...current, [proposal.proposal_id]: '' }))
    try {
      const receipt = await onReorgDecide(proposal, approved)
      if (!receipt.accepted) {
        setReorgError(current => ({
          ...current,
          [proposal.proposal_id]: receipt.reason || receipt.error || 'Decision was not accepted.',
        }))
        return
      }
      // The local control changes only after the durable interaction ACK.
      setAcceptedReorgIds(current => {
        const next = new Set(current)
        next.add(proposal.proposal_id)
        return next
      })
    } catch (error) {
      setReorgError(current => ({
        ...current,
        [proposal.proposal_id]: error instanceof Error ? error.message : 'Decision failed.',
      }))
    } finally {
      setSubmittingReorgId(current => (
        current === proposal.proposal_id ? null : current
      ))
    }
  }

  return (
    <div className="mkt-container" data-testid="architecture-marketplace">
      {/* Toolbar */}
      <div className="mkt-toolbar">
        <div className="mkt-search-wrap">
          <img src={ICON.search} alt="" className="mkt-search-icon" />
          <input
            className="mkt-search"
            placeholder="Search architectures..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <span className="mkt-count">{filteredPresets.length} architectures</span>
      </div>

      {/* Filter pills */}
      <div className="mkt-filters">
        {categories.length > 0 && (
          <div className="mkt-pill-row">
            <button className={`mkt-pill${!activeCategory ? ' active' : ''}`}
              onClick={() => setActiveCategory(null)}>All</button>
            {categories.map(cat => (
              <button key={cat} className={`mkt-pill${activeCategory === cat ? ' active' : ''}`}
                onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              >{cat}</button>
            ))}
          </div>
        )}
        {patterns.length > 0 && (
          <div className="mkt-pill-row">
            <button className={`mkt-pill mkt-pill-pattern${!activePattern ? ' active' : ''}`}
              onClick={() => setActivePattern(null)}>All Patterns</button>
            {patterns.map(pat => (
              <button key={pat} className={`mkt-pill mkt-pill-pattern${activePattern === pat ? ' active' : ''}`}
                onClick={() => setActivePattern(activePattern === pat ? null : pat)}
              >{PATTERN_LABELS[pat] || pat}</button>
            ))}
          </div>
        )}
      </div>

      {/* Architecture Blueprints grid */}
      {filteredPresets.length > 0 ? (
        <div className="mkt-section">
          <div className="mkt-section-header">
            <img src={ICON.arch} alt="" className="mkt-section-icon" />
            <h3 className="mkt-section-title">Architecture Blueprints</h3>
            <span className="mkt-section-count">{filteredPresets.length}</span>
          </div>
          <div className="mkt-arch-grid">
            {filteredPresets.map(p => (
              <ArchCard key={p.id} preset={p}
                isInstalled={installedIds.has(p.id)}
                isApplying={applyingPresetId === p.id}
                readOnly={readOnly}
                onPreview={() => onPreview(p.id)}
                onApply={() => onApplyPreset(p.id, 'namespace')}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="mkt-empty"><p>No architectures match your search.</p></div>
      )}

      {/* Installed Packages */}
      <CollapsibleSection icon={ICON.packages} title="Installed Packages" count={installedPackages.length}
        extra={isCustomMode ? (
          <button className="myorg-inline-btn" onClick={() => setShowImportForm(!showImportForm)}>
            <img src={ICON.importPkg} alt="" className="myorg-inline-icon" /> Import
          </button>
        ) : undefined}>
        {isCustomMode && showImportForm && (
          <div className="myorg-form">
            <div className="oc-form-row">
              <label>Path</label>
              <input value={importPath} onChange={e => setImportPath(e.target.value)}
                placeholder="/path/to/package.opcpkg" />
            </div>
            <div className="oc-form-actions">
              <button className="oc-btn-primary" onClick={handleImport} disabled={!importPath.trim()}>Install</button>
              <button className="oc-btn-ghost" onClick={() => setShowImportForm(false)}>Cancel</button>
            </div>
          </div>
        )}
        {installedPackages.length > 0 ? (
          <div className="pkg-grid">
            {installedPackages.map(pkg => (
              <PackageCard key={pkg.package_id} pkg={pkg}
                onUninstall={isCustomMode ? handleUninstall : undefined}
                uninstallingId={uninstallingId} />
            ))}
          </div>
        ) : (
          <div className="myorg-empty-hint">No packages installed.</div>
        )}
      </CollapsibleSection>

      {/* Channels & Connectors */}
      <CollapsibleSection icon={ICON.channels} title="Channels & Connectors" count={channels.length}>
        {channels.length > 0 ? (
          <div className="org-channels-grid">
            {channels.map(ch => (
              <div key={ch.name} className={`org-channel-card${ch.running ? ' org-ch-running' : ''}${!ch.enabled ? ' org-ch-disabled' : ''}`}>
                <div className="org-ch-header">
                  <span className={`org-ch-dot${ch.running ? ' running' : ch.ready ? ' ready' : ch.configured ? ' configured' : ''}`} />
                  <span className="org-ch-name">{ch.name}</span>
                </div>
                <div className="org-ch-status-row">
                  {ch.enabled && <span className="org-ch-badge org-ch-enabled">enabled</span>}
                  {ch.running && <span className="org-ch-badge org-ch-running-badge">running</span>}
                  {!ch.enabled && <span className="org-ch-badge org-ch-off">disabled</span>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="myorg-empty-hint">No channels configured.</div>
        )}
      </CollapsibleSection>

      {/* Reorg Proposals */}
      {reorgProposals.length > 0 && (
        <CollapsibleSection icon={ICON.reorg} title="Reorg Proposals" count={reorgProposals.length}>
          <div className="org-reorg-list">
            {reorgProposals.map(p => {
              const isPending = p.status === 'proposed'
              const isSubmitting = submittingReorgId === p.proposal_id
              const wasAccepted = acceptedReorgIds.has(p.proposal_id)
              const canDecide = (
                isPending
                && isCustomMode
                && p.checkpoint_status === 'pending'
                && Boolean(p.checkpoint_id)
                && !wasAccepted
              )
              return (
                <div key={p.proposal_id} className={`org-reorg-card org-reorg-${p.status}`}>
                  <div className="org-reorg-header">
                    <span className="org-reorg-title">{p.title || p.summary || 'Untitled'}</span>
                    <span className="org-reorg-status">{p.status}</span>
                  </div>
                  {p.summary && <div className="org-reorg-summary">{p.summary}</div>}
                  {canDecide && (
                    <div className="org-reorg-actions">
                      <button
                        className="org-reorg-approve"
                        disabled={isSubmitting}
                        onClick={() => void handleReorgDecision(p, true)}
                      >{isSubmitting ? 'Submitting…' : 'Approve'}</button>
                      <button
                        className="org-reorg-deny"
                        disabled={isSubmitting}
                        onClick={() => void handleReorgDecision(p, false)}
                      >Deny</button>
                    </div>
                  )}
                  {isPending && isCustomMode && wasAccepted && (
                    <div className="org-reorg-status">Decision submitted</div>
                  )}
                  {isPending && isCustomMode && p.user_confirmation_required
                    && !p.checkpoint_id && !wasAccepted && (
                    <div className="org-reorg-status">
                      Approval is unavailable until its review checkpoint is restored.
                    </div>
                  )}
                  {reorgError[p.proposal_id] && (
                    <div className="org-reorg-status">{reorgError[p.proposal_id]}</div>
                  )}
                </div>
              )
            })}
          </div>
        </CollapsibleSection>
      )}

      {/* Architecture preview modal */}
      {previewData && (
        <ArchPreviewModal
          data={previewData}
          isInstalled={installedIds.has(previewData.id)}
          isApplying={applyingPresetId === previewData.id}
          onApply={() => onApplyPreset(previewData.id, 'namespace')}
          onClose={onClearPreview}
        />
      )}
    </div>
  )
}


