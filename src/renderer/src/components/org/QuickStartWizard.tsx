import { useState } from 'react'

const ICON = {
  rocket: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23888' d='M13.13 22.19L11.5 18.36c3.07-1.39 5.51-3.94 6.69-7.07L22 13l-8.87 9.19zM5.64 12.5L2 10.87l9.19-8.87 1.63 3.81c-3.13 1.18-5.68 3.62-7.07 6.69zM14.54 9.46c-.78-.78-.78-2.05 0-2.83s2.05-.78 2.83 0 .78 2.05 0 2.83c-.79.78-2.05.78-2.83 0zM8 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z'/%3E%3C/svg%3E",
  people: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23888' d='M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z'/%3E%3C/svg%3E",
  check: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23888' d='M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z'/%3E%3C/svg%3E",
  addPerson: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23888' d='M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E",
  trash: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23888' d='M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z'/%3E%3C/svg%3E",
}

export type QuickStartProps = {
  onComplete: (roles: { name: string; responsibility: string; reportsTo: string }[]) => void
  onSwitchToTab: (target: 'employees' | 'architecture') => void
}

type QuickStartMember = { id: string; name: string; resp: string; parent: string }

export function QuickStartWizard({ onComplete, onSwitchToTab }: QuickStartProps) {
  const [step, setStep] = useState(1)
  const [members, setMembers] = useState<QuickStartMember[]>([
    { id: 'qs-init-0', name: '', resp: '', parent: 'owner' },
  ])

  const addMember = () => setMembers([...members, { id: `qs-${Date.now()}-${members.length}`, name: '', resp: '', parent: 'owner' }])
  const updateMember = (i: number, field: 'name' | 'resp' | 'parent', val: string) => {
    setMembers(prev => prev.map((m, idx) => (idx === i ? { ...m, [field]: val } : m)))
  }
  const removeMember = (i: number) => {
    if (members.length <= 1) {
      return
    }
    setMembers(members.filter((_, idx) => idx !== i))
  }

  const validMembers = members.filter(m => m.name.trim())
  const memberNames = validMembers.map(m => m.name.trim()).filter(Boolean)

  const handleFinish = () => {
    onComplete(
      validMembers.map(m => ({ name: m.name.trim(), responsibility: m.resp.trim(), reportsTo: m.parent })),
    )
  }

  return (
    <div className="qs-wizard">
      <div className="qs-header">
        <img src={ICON.rocket} alt="" className="qs-header-icon" />
        <div>
          <h3 className="qs-header-title">Build Your Team</h3>
          <p className="qs-header-sub">
            Create an org team in a few steps, or{' '}
            <button className="qs-link-btn" onClick={() => onSwitchToTab('architecture')}>
              use a template
            </button>
          </p>
        </div>
      </div>

      <div className="qs-progress">
        {[
          { n: 1, icon: ICON.people, label: 'Team Members' },
          { n: 2, icon: ICON.check, label: 'Preview' },
        ].map(s => (
          <div key={s.n} className={`qs-step${step === s.n ? ' qs-step-active' : step > s.n ? ' qs-step-done' : ''}`}>
            <img src={s.icon} alt="" className="qs-step-icon" />
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="qs-panel">
          <h4>Who&apos;s on your team?</h4>
          <p className="qs-hint">Add each team member with their name and what they do.</p>
          <div className="qs-members">
            {members.map((m, i) => (
              <div key={m.id} className="qs-member-row">
                <input
                  className="qs-member-name"
                  value={m.name}
                  placeholder="Role name (e.g. Engineer)"
                  onChange={e => updateMember(i, 'name', e.target.value)}
                />
                <input
                  className="qs-member-resp"
                  value={m.resp}
                  placeholder="What do they do?"
                  onChange={e => updateMember(i, 'resp', e.target.value)}
                />
                <select
                  className="qs-member-parent"
                  value={m.parent}
                  onChange={e => updateMember(i, 'parent', e.target.value)}
                >
                  <option value="owner">Reports to you</option>
                  {memberNames.filter(n => n !== m.name.trim()).map(n => (
                    <option key={n} value={n}>{`Managed by ${n}`}</option>
                  ))}
                </select>
                {members.length > 1 && (
                  <button className="qs-remove-btn" onClick={() => removeMember(i)} title="Remove">
                    <img src={ICON.trash} alt="" className="qs-remove-icon" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button className="qs-add-member" onClick={addMember}>
            <img src={ICON.addPerson} alt="" className="qs-add-icon" /> Add another member
          </button>
          <div className="qs-nav">
            <span />
            <button className="oc-btn-primary" onClick={() => setStep(2)} disabled={validMembers.length === 0}>
              Next: Preview →
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="qs-panel">
          <h4>Your team at a glance</h4>
          <div className="qs-preview">
            <div className="qs-preview-section">
              <h5>Team ({validMembers.length} members)</h5>
              {validMembers.map((m) => (
                <div key={m.id} className="qs-preview-member">
                  <strong>{m.name}</strong>
                  {m.resp && <span className="qs-preview-resp"> — {m.resp}</span>}
                  <span className="qs-preview-parent">
                    {m.parent === 'owner' ? ' (reports to you)' : ` (managed by ${m.parent})`}
                  </span>
                </div>
              ))}
            </div>
            <div className="qs-preview-section">
              <h5>Actor Runtime</h5>
              <p>Seat routing and delegation will be derived from your reporting structure and any team seats you configure later.</p>
            </div>
          </div>
          <div className="qs-nav">
            <button className="oc-btn-ghost" onClick={() => setStep(1)}>← Back</button>
            <button className="oc-btn-primary qs-create-btn" onClick={handleFinish}>Create Team</button>
          </div>
        </div>
      )}
    </div>
  )
}
