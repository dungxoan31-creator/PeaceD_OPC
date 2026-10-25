import type { ReactNode } from 'react'
import type { ArchitecturePreset, ArchitecturePresetDetail } from './types'

const ICON = {
  arrow: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23888' d='M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z'/%3E%3C/svg%3E",
  gateReview: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23f59e0b' d='M12 2L4 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-3zm-2 16l-4-4 1.41-1.41L10 15.17l6.59-6.59L18 10l-8 8z'/%3E%3C/svg%3E",
  gateApproval: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%2322c55e' d='M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z'/%3E%3C/svg%3E",
  gateHold: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23ef4444' d='M6 19h4V5H6v14zm8-14v14h4V5h-4z'/%3E%3C/svg%3E",
}

export const PATTERN_LABELS: Record<string, string> = {
  pipeline: 'Pipeline',
  hub_spoke: 'Hub & Spoke',
  review_loop: 'Review Loop',
  hierarchical: 'Hierarchical',
  flat: 'Flat Team',
}

export function ArchCard({
  preset: p,
  isInstalled,
  isApplying,
  readOnly,
  onPreview,
  onApply,
}: {
  preset: ArchitecturePreset
  isInstalled: boolean
  isApplying: boolean
  readOnly: boolean
  onPreview: () => void
  onApply: () => void
}) {
  const patternLabel = PATTERN_LABELS[p.collaboration_pattern] || p.collaboration_pattern

  return (
    <div
      className="mkt-arch-card"
      style={{ borderLeftColor: p.color || 'var(--accent)' }}
      onClick={onPreview}
    >
      <div className="mkt-arch-header">
        <span className="mkt-arch-emoji">{p.emoji}</span>
        <div className="mkt-arch-title-wrap">
          <span className="mkt-arch-name">{p.name}</span>
          <div className="mkt-arch-badges">
            <span className="mkt-arch-category">{p.category}</span>
            {p.collaboration_pattern && <span className="mkt-arch-pattern">{patternLabel}</span>}
          </div>
        </div>
      </div>

      {p.dag_summary && <div className="mkt-arch-dag-summary">{p.dag_summary}</div>}
      <div className="mkt-arch-desc">{p.description}</div>

      <div className="mkt-arch-stats">
        <span className="mkt-arch-stat">{p.roles_count} roles</span>
        <span className="mkt-arch-stat">{p.work_item_templates_count} templates</span>
        {p.gates_count > 0 && <span className="mkt-arch-stat">{p.gates_count} checkpoints</span>}
        {p.team_size && <span className="mkt-arch-stat">{p.team_size} people</span>}
      </div>

      {p.tags.length > 0 && (
        <div className="mkt-arch-tags">
          {p.tags.slice(0, 4).map((t) => (
            <span key={t} className="mkt-tag">
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="mkt-arch-actions">
        {isInstalled ? (
          <span className="mkt-installed-badge">Installed</span>
        ) : !readOnly ? (
          <button
            className="mkt-btn mkt-btn-primary mkt-btn-sm"
            disabled={isApplying}
            onClick={(e) => {
              e.stopPropagation()
              onApply()
            }}
          >
            {isApplying ? 'Applying...' : 'Use This'}
          </button>
        ) : null}
        <button
          className="mkt-btn mkt-btn-ghost mkt-btn-sm"
          onClick={(e) => {
            e.stopPropagation()
            onPreview()
          }}
        >
          Preview
        </button>
      </div>
    </div>
  )
}

export function ArchPreviewModal({
  data,
  isInstalled,
  isApplying,
  onApply,
  onClose,
}: {
  data: ArchitecturePresetDetail
  isInstalled: boolean
  isApplying: boolean
  onApply: () => void
  onClose: () => void
}) {
  return (
    <div className="mkt-modal-overlay" onClick={onClose}>
      <div className="mkt-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mkt-modal-header" style={{ borderBottomColor: data.color || 'var(--border)' }}>
          <span className="mkt-modal-emoji">{data.emoji}</span>
          <div>
            <h2 className="mkt-modal-name">{data.name}</h2>
            <span className="mkt-modal-category">{data.category}</span>
          </div>
          <button className="mkt-modal-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="mkt-modal-body">
          <p className="mkt-modal-desc">{data.description}</p>

          {data.tags.length > 0 && (
            <div className="mkt-modal-section">
              <div className="mkt-modal-label">Tags</div>
              <div className="mkt-modal-tags">
                {data.tags.map((t) => (
                  <span key={t} className="mkt-tag">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mkt-modal-section">
            <div className="mkt-modal-label">Roles ({data.roles.length})</div>
            <div className="mkt-role-list">
              {data.roles.map((r) => (
                <div key={r.id} className="mkt-role-item">
                  <div className="mkt-role-name">
                    {r.name} <code>{r.id}</code>
                  </div>
                  <div className="mkt-role-resp">{r.responsibility}</div>
                  <div className="mkt-role-meta">
                    reports to: <code>{r.reports_to}</code>
                    {r.can_spawn && r.can_spawn.length > 0 && (
                      <> &middot; spawns: {r.can_spawn.map((s) => <code key={s}>{s}</code>)}</>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mkt-modal-section">
            <div className="mkt-modal-label">
              Work item templates ({data.work_item_templates.length} templates)
            </div>
            <div className="mkt-dag-wrap">
              <ModalWorkItemTemplates templates={data.work_item_templates} />
            </div>
          </div>
        </div>

        <div className="mkt-modal-footer">
          {isInstalled ? (
            <span className="mkt-installed-badge">Already Installed</span>
          ) : (
            <button className="mkt-btn mkt-btn-primary" disabled={isApplying} onClick={onApply}>
              {isApplying ? 'Applying...' : 'Use This Architecture'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function ModalWorkItemTemplates({
  templates,
}: {
  templates: ArchitecturePresetDetail['work_item_templates']
}): ReactNode {
  type Group = { group: string | null; templates: typeof templates }
  const groups: Group[] = []
  let currentGroup: string | null = '__init__'
  let currentTemplates: typeof templates = []
  for (const template of templates) {
    if (template.parallel_group !== currentGroup) {
      if (currentTemplates.length > 0) {
        groups.push({ group: currentGroup, templates: currentTemplates })
      }
      currentGroup = template.parallel_group
      currentTemplates = [template]
    } else {
      currentTemplates.push(template)
    }
  }
  if (currentTemplates.length > 0) {
    groups.push({ group: currentGroup, templates: currentTemplates })
  }

  return (
    <div className="org-dag">
      {groups.map((g, gi) => (
        <div key={gi} className="org-dag-group-wrap">
          {gi > 0 && (
            <div className="org-dag-arrow">
              <img src={ICON.arrow} alt="→" className="org-dag-arrow-icon" />
            </div>
          )}
          <div className={`org-dag-group${g.templates.length > 1 ? ' org-dag-parallel' : ''}`}>
            {g.templates.length > 1 && <div className="org-dag-parallel-label">parallel</div>}
            {g.templates.map((template) => (
              <div key={template.id} className="org-dag-node">
                <div className="org-dag-node-header">
                  <span className="org-dag-node-title">{template.title}</span>
                  <span className="org-dag-node-role">{template.role_id}</span>
                </div>
                <div className="org-dag-node-id">{template.id}</div>
                {template.gate && (
                  <div className={`org-dag-gate org-gate-${template.gate.type}`}>
                    <img
                      src={
                        template.gate.type === 'review'
                          ? ICON.gateReview
                          : template.gate.type === 'approval'
                          ? ICON.gateApproval
                          : ICON.gateHold
                      }
                      alt=""
                      className="org-gate-icon"
                    />
                    <span>{template.gate.type}</span>
                    {template.gate.reviewer_role && (
                      <span className="org-gate-reviewer">by {template.gate.reviewer_role}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

