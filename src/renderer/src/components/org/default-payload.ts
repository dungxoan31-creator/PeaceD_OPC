import type { OrgInfoPayload } from './types'
import { DEFAULT_CORPORATE_ROLES } from './default-roles'
import { DEFAULT_CORPORATE_EMPLOYEES } from './default-employees'

export const INITIAL_ORG_PAYLOAD: OrgInfoPayload = {
  organization_id: 'corporate',
  organization_name: 'PeaceD OPC Corporate Standard',
  company_profile: 'corporate',
  final_decider_role_id: 'ceo',
  top_level_role_ids: ['ceo'],
  org_version: 1,
  runtime_topology_version: 1,
  roles: DEFAULT_CORPORATE_ROLES,
  employees: DEFAULT_CORPORATE_EMPLOYEES,
  channels: [
    { name: 'general', enabled: true, running: true, configured: true, available: true, ready: true, last_error: null, delivery_mode: 'broadcast' },
    { name: 'executive', enabled: true, running: true, configured: true, available: true, ready: true, last_error: null, delivery_mode: 'direct' },
    { name: 'engineering', enabled: true, running: true, configured: true, available: true, ready: true, last_error: null, delivery_mode: 'direct' },
  ],
  connectors: [
    { connector_id: 'local_git', name: 'Git Workspace', connector_type: 'vcs', description: 'Local repository tracking and change control', actions: ['commit', 'diff', 'branch'] },
    { connector_id: 'task_runner', name: 'Task Daemon', connector_type: 'executor', description: 'Autonomous agent task dispatch runner', actions: ['spawn', 'pause', 'kill'] },
  ],
  runtime_teams: [
    { cell_id: 'exec-cell', manager_role_id: 'ceo', member_role_ids: ['cto', 'cmo', 'coo'], status: 'active', is_final_decider_cell: true },
    { cell_id: 'eng-cell', manager_role_id: 'cto', member_role_ids: ['senior_engineer', 'devops_engineer', 'env_engineer'], status: 'active' },
    { cell_id: 'product-cell', manager_role_id: 'cmo', member_role_ids: ['content_specialist', 'designer'], status: 'active' },
    { cell_id: 'ops-cell', manager_role_id: 'coo', member_role_ids: ['acquisition_specialist', 'qa_analyst'], status: 'active' },
  ],
  runtime_seats: [
    { role_session_id: 'seat-ceo', role_id: 'ceo', employee_id: 'emp-ceo-1', status: 'warm', resident_status: 'standby' },
    { role_session_id: 'seat-cto', role_id: 'cto', employee_id: 'emp-cto-1', status: 'warm', resident_status: 'standby' },
    { role_session_id: 'seat-cmo', role_id: 'cmo', employee_id: 'emp-cmo-1', status: 'warm', resident_status: 'standby' },
    { role_session_id: 'seat-eng', role_id: 'senior_engineer', employee_id: 'emp-eng-1', status: 'warm', resident_status: 'active' },
  ],
  work_items: [
    { work_item_id: 'wi-001', role_id: 'ceo', cell_id: 'exec-cell', title: 'Q4 Product Roadmap & Capabilities', kind: 'strategy', phase: 'done', kanban_column: 'done' },
    { work_item_id: 'wi-002', role_id: 'cto', cell_id: 'eng-cell', title: 'Org Architecture & Self-Run Engine', kind: 'architecture', phase: 'running', kanban_column: 'in_progress' },
    { work_item_id: 'wi-003', role_id: 'senior_engineer', cell_id: 'eng-cell', title: 'Integrate Canvas & TanStack Table Views', kind: 'feature', phase: 'ready', kanban_column: 'todo' },
  ],
  frontier: {
    total_cells: 4,
    total_role_sessions: 11,
    total_work_items: 3,
    ready_count: 1,
    running_count: 1,
    done_count: 1,
    blocked_count: 0,
  },
  runtime_policy: {
    communication: { default_mode: 'async', blocking_default: false, allow_broadcast: true },
    handoff: { require_structured_handoff: true, require_ack: true },
    review: { strict_gate_inference: true, allow_human_override: true },
    parallel: { auto_dispatch: true, max_workers: 8 },
  },
}
