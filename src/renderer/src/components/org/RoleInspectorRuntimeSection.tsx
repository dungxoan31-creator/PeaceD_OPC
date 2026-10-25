import type { OrgRole, ExternalTeamCapabilityManifest } from './types'
import { executionAgentLabel } from './externalAgents'
import {
  EXTERNAL_AGENTS,
  EXECUTION_STRATEGIES,
  InspectorGroup,
  InspectorField,
} from './RoleInspectorControls'

export type RoleInspectorRuntimeSectionProps = {
  role: OrgRole
  isCoveredByExternalTeam: boolean
  isExternalTeamBoundary: boolean
  isCoveredDescendant: boolean
  teamBindingEditable: boolean
  teamMutationPending: boolean
  handleExecutionScopeChange: (scope: 'role' | 'subtree') => void
  coveredRoles: { role_id: string; name: string; responsibility: string }[]
  capabilityManifest?: ExternalTeamCapabilityManifest | null
  execStrategy: string
  handleExecStrategyChange: (strategy: string) => void
  readOnly?: boolean
  extAgent: string | null
  handleExtAgentChange: (agent: string | null) => void
}

export function RoleInspectorRuntimeSection({
  role,
  isCoveredByExternalTeam,
  isExternalTeamBoundary,
  isCoveredDescendant,
  teamBindingEditable,
  teamMutationPending,
  handleExecutionScopeChange,
  coveredRoles,
  capabilityManifest,
  execStrategy,
  handleExecStrategyChange,
  readOnly,
  extAgent,
  handleExtAgentChange,
}: RoleInspectorRuntimeSectionProps) {
  return (
    <InspectorGroup title="Runtime policy" defaultExpanded>
      <InspectorField label="Execution scope">
        <div className="ri-scope-options">
          <label className="ri-scope-option">
            <input
              type="radio"
              name={`execution-scope-${role.role_id}`}
              checked={!isCoveredByExternalTeam}
              onChange={() => handleExecutionScopeChange('role')}
              disabled={!teamBindingEditable || teamMutationPending || isCoveredDescendant}
            />
            <span>
              <b>This role only</b>
              <small>Choose one executor for this organizational seat.</small>
            </span>
          </label>
          <label className="ri-scope-option">
            <input
              type="radio"
              name={`execution-scope-${role.role_id}`}
              checked={isExternalTeamBoundary}
              onChange={() => handleExecutionScopeChange('subtree')}
              disabled={!teamBindingEditable || teamMutationPending || isCoveredDescendant}
            />
            <span>
              <b>This role and descendants</b>
              <small>One opaque JiuwenSwarm-team; no covered roles are recruited separately.</small>
            </span>
          </label>
        </div>
      </InspectorField>

      {isCoveredDescendant && (
        <div className="ri-team-notice">
          This role is covered by the JiuwenSwarm-team at <code>{role.external_team_boundary_role_id}</code>.
          Its staffing and executor are inherited from that boundary.
        </div>
      )}

      {isExternalTeamBoundary && (
        <div className="ri-team-card">
          <div className="ri-team-card-title">
            <span>JiuwenSwarm-team</span>
            <code>{role.external_team_binding_id}</code>
          </div>
          <div className="ri-team-card-copy">
            OPC dispatches to <code>{role.role_id}</code>; JiuwenSwarm-team manages its internal leader and members.
          </div>
          <div className="ri-team-covered-list">
            {coveredRoles.map(item => (
              <div key={item.role_id} className="ri-team-covered-role" title={item.responsibility}>
                <span>{item.name}</span>
                <code>{item.role_id}</code>
              </div>
            ))}
          </div>
          {capabilityManifest && (
            <div className="ri-team-capabilities">
              <b>Compiled capability contract</b>
              <span>
                {capabilityManifest.capabilities.length > 0
                  ? capabilityManifest.capabilities.join(' · ')
                  : 'Derived from the covered role responsibilities shown above.'}
              </span>
              {capabilityManifest.deliverables.length > 0 && (
                <span>Deliverables: {capabilityManifest.deliverables.join(' · ')}</span>
              )}
              <code title={capabilityManifest.manifest_hash}>
                manifest {capabilityManifest.manifest_hash.slice(0, 12)}
              </code>
            </div>
          )}
        </div>
      )}

      {!isCoveredByExternalTeam && (
        <InspectorField label="Execution strategy">
          <div className="ri-radio-group">
            {EXECUTION_STRATEGIES.map(opt => (
              <label key={opt.value} className="ri-radio" title={opt.hint}>
                <input
                  type="radio"
                  name={`exec-strategy-${role.role_id}`}
                  value={opt.value}
                  checked={execStrategy === opt.value}
                  onChange={() => handleExecStrategyChange(opt.value)}
                  disabled={readOnly}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </InspectorField>
      )}

      {!isCoveredByExternalTeam && execStrategy === 'external' && (
        <InspectorField label="Preferred external agent">
          <select
            className="ri-select"
            value={extAgent ?? ''}
            onChange={e => handleExtAgentChange(e.target.value || null)}
            disabled={readOnly}
          >
            <option value="">(any)</option>
            {extAgent === 'jiuwenswarm' && (
              <option value="jiuwenswarm">JiuwenSwarm-team (select Team scope above)</option>
            )}
            {EXTERNAL_AGENTS.map(a => (
              <option key={a} value={a}>
                {executionAgentLabel(a)}
              </option>
            ))}
          </select>
          {extAgent === 'jiuwenswarm' && (
            <span className="ri-field-hint">
              This legacy role-only value is ambiguous. Select “This role and descendants” above to create the Team binding.
            </span>
          )}
        </InspectorField>
      )}

      {!isExternalTeamBoundary && readOnly && !isCoveredDescendant && (
        <div className="ri-team-notice">
          Corporate role structure is fixed. Choose its single-role executor in the Company staffing step,
          or bind this entire subtree to JiuwenSwarm-team here.
        </div>
      )}
    </InspectorGroup>
  )
}

