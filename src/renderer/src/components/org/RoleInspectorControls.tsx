import { useState, type ReactNode } from 'react'
import { TASK_AGENT_OPTIONS } from './externalAgents'
import { ROLE_ICON_KEYS, ROLE_ICONS, resolveRoleIcon, type RoleIconKey } from './roleIcons'

/** Tool union derived from company_runtime_profiles.py _CORPORATE_*_TOOLS. */
export const AVAILABLE_TOOLS = [
  'file_read', 'file_write', 'file_edit', 'file_search', 'list_dir',
  'shell_exec',
  'web_search', 'web_fetch',
  'todo_read', 'todo_write',
  'browser_navigate', 'browser_navigate_back', 'browser_snapshot',
  'browser_wait_for', 'browser_scroll', 'browser_click', 'browser_type',
  'browser_select_option', 'browser_take_screenshot',
  'browser_evaluate', 'browser_close',
] as const

export const TOOL_GROUPS: { label: string; prefix: string; tools: readonly string[] }[] = [
  { label: 'Files', prefix: 'file_', tools: AVAILABLE_TOOLS.filter(t => t.startsWith('file_')) },
  { label: 'Shell', prefix: 'shell_', tools: AVAILABLE_TOOLS.filter(t => t === 'shell_exec') },
  { label: 'Web', prefix: 'web_', tools: AVAILABLE_TOOLS.filter(t => t.startsWith('web_')) },
  { label: 'TODOs', prefix: 'todo_', tools: AVAILABLE_TOOLS.filter(t => t.startsWith('todo_')) },
  { label: 'Browser', prefix: 'browser_', tools: AVAILABLE_TOOLS.filter(t => t.startsWith('browser_')) },
]

export const EXTERNAL_AGENTS = TASK_AGENT_OPTIONS.filter(
  agent => agent !== 'native' && agent !== 'jiuwenswarm',
)

export const EXECUTION_STRATEGIES = [
  { value: 'auto', label: 'Auto', hint: 'System picks native or external based on role config' },
  { value: 'native', label: 'Native', hint: 'Run directly in-process via LLM' },
  { value: 'external', label: 'External', hint: 'Delegate to an external agent (codex, cursor, etc.)' },
] as const

export function InspectorGroup({
  title,
  defaultExpanded = false,
  children,
}: {
  title: string
  defaultExpanded?: boolean
  children: ReactNode
}) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  return (
    <section className={`ri-group${expanded ? ' is-expanded' : ''}`}>
      <button className="ri-group-header" onClick={() => setExpanded(e => !e)}>
        <span className="ri-group-caret">{expanded ? '▾' : '▸'}</span>
        <span className="ri-group-title">{title}</span>
      </button>
      {expanded && <div className="ri-group-body">{children}</div>}
    </section>
  )
}

export function InspectorField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="ri-field">
      <label className="ri-field-label">{label}</label>
      <div className="ri-field-control">{children}</div>
    </div>
  )
}

export function IconPicker({
  value,
  onChange,
  readOnly,
}: {
  value: string | null
  onChange: (v: string | null) => void
  readOnly?: boolean
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="ri-icon-picker">
      <button
        className="ri-icon-picker-trigger"
        onClick={() => !readOnly && setOpen(o => !o)}
        disabled={readOnly}
      >
        <img src={resolveRoleIcon(value)} alt="" className="ri-icon-picker-current" />
        <span className="ri-icon-picker-label">{value ?? 'generic'}</span>
      </button>
      {open && (
        <div className="ri-icon-picker-popover">
          <button
            className={`ri-icon-option${value === null ? ' is-active' : ''}`}
            onClick={() => {
              onChange(null)
              setOpen(false)
            }}
            title="Default icon"
          >
            <img src={ROLE_ICONS.generic} alt="" />
          </button>
          {ROLE_ICON_KEYS.filter((k): k is RoleIconKey => k !== 'generic').map(key => (
            <button
              key={key}
              className={`ri-icon-option${value === key ? ' is-active' : ''}`}
              onClick={() => {
                onChange(key)
                setOpen(false)
              }}
              title={key}
            >
              <img src={ROLE_ICONS[key]} alt={key} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function MultiSelect({
  allIds,
  labelFor,
  selected,
  onToggle,
  readOnly,
}: {
  allIds: string[]
  labelFor: (id: string) => string
  selected: Set<string>
  onToggle: (id: string) => void
  readOnly?: boolean
}) {
  const [open, setOpen] = useState(false)
  const available = allIds.filter(id => !selected.has(id))

  return (
    <div className="ri-multiselect">
      <div className="ri-chips">
        {Array.from(selected).map(id => (
          <span key={id} className="ri-chip">
            {labelFor(id)}
            {!readOnly && (
              <button className="ri-chip-x" onClick={() => onToggle(id)} title="Remove">
                ×
              </button>
            )}
          </span>
        ))}
        {!readOnly && available.length > 0 && (
          <button className="ri-chip-add" onClick={() => setOpen(o => !o)}>
            + Add
          </button>
        )}
        {selected.size === 0 && readOnly && <span className="ri-meta-value">(none)</span>}
      </div>
      {open && !readOnly && (
        <div className="ri-multiselect-popover">
          {available.map(id => (
            <button
              key={id}
              className="ri-multiselect-option"
              onClick={() => {
                onToggle(id)
                setOpen(false)
              }}
            >
              {labelFor(id)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function ToolChecklist({
  tools,
  onToggle,
  readOnly,
}: {
  tools: Set<string>
  onToggle: (name: string) => void
  readOnly?: boolean
}) {
  return (
    <div className="ri-toolcheck">
      {TOOL_GROUPS.map(g => (
        <fieldset key={g.prefix} className="ri-toolcheck-group">
          <legend className="ri-toolcheck-legend">{g.label}</legend>
          <div className="ri-toolcheck-items">
            {g.tools.map(t => (
              <label key={t} className="ri-toolcheck-item">
                <input
                  type="checkbox"
                  checked={tools.has(t)}
                  onChange={() => onToggle(t)}
                  disabled={readOnly}
                />
                <span className="ri-toolcheck-name">{t.replace(g.prefix, '') || t}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  )
}

