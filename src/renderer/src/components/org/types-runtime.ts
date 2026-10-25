export type RuntimeTeamInfo = {
  cell_id: string
  team_instance_id?: string
  team_id?: string
  manager_role_id: string
  member_role_ids: string[]
  seat_ids?: string[]
  parent_team_id?: string
  status: string
  is_final_decider_cell?: boolean
}

export type RuntimeSeatInfo = {
  role_session_id: string
  role_id: string
  employee_id: string
  team_id?: string
  team_instance_id?: string
  seat_id?: string
  focused_work_item_id?: string
  current_work_item_id?: string
  background_work_item_ids?: string[]
  manager_role_ids?: string[]
  manager_seat_id?: string
  resident_status?: string
  latest_notification?: Record<string, unknown>
  manager_digest?: Record<string, unknown>
  status: string
}

export type RuntimeWorkItemInfo = {
  work_item_id: string
  role_id: string
  cell_id: string
  team_id?: string
  team_instance_id?: string
  seat_id?: string
  title: string
  kind: string
  phase: string
  kanban_column: string
  batch_id?: string
  batch_index?: number
  deliverable_summary?: string
  blocked_reason?: string
  handoff_status?: string
  parent_work_item_id?: string | null
  work_item_projection_id?: string
  metadata?: Record<string, unknown>
  adaptive?: Record<string, unknown>
}

export type RuntimeFrontierSummary = {
  run_id?: string
  status?: string
  total_cells?: number
  total_role_sessions?: number
  total_work_items?: number
  ready_count?: number
  running_count?: number
  blocked_count?: number
  waiting_count?: number
  done_count?: number
  failed_count?: number
}

export type ProjectRunInfo = {
  run_id?: string
  project_id?: string
  session_id?: string
  status?: string
  lifecycle_status?: string
  company_profile?: string
  execution_model?: string
  current_revision?: number
  latest_deliverable_summary?: string
  recovery_pointer?: Record<string, unknown>
}

export type ProjectDossierInfo = {
  project_id?: string
  run_id?: string
  latest_deliverable_summary?: string
  architecture_decisions?: Record<string, unknown>[]
  completed_work_items?: Record<string, unknown>[]
  open_issues?: string[]
  verification_summary?: string
  artifact_index?: Record<string, unknown>[]
  handoff_summaries?: Record<string, unknown>[]
  last_failure_summary?: string
  project_memory_excerpt?: string
  session_memory_excerpt?: string
}

export type SeatDigestInfo = {
  seat_id: string
  team_id?: string
  role_id?: string
  employee_id?: string
  role_session_id?: string
  resident_status?: string
  current_work_item?: Record<string, unknown>
  latest_notification?: Record<string, unknown>
  manager_digest?: Record<string, unknown>
}

export type SessionLinkInfo = {
  link_id?: string
  session_id?: string
  linked_session_id?: string | null
  link_type?: string
  metadata?: Record<string, unknown>
  created_at?: string
}

export type ChannelStatusInfo = {
  name: string
  enabled: boolean
  running: boolean
  configured: boolean
  available: boolean
  ready: boolean
  last_error: string | null
  delivery_mode: string
}

export type ConnectorInfo = {
  connector_id: string
  name: string
  connector_type: string
  description: string
  actions: string[]
}

export type InstalledPackageInfo = {
  package_id: string
  name: string
  version: string
  installed_at: string
  source_path: string
  role_ids: string[]
  template_ids: string[]
  work_item_template_ids: string[]
}

export type ArchitecturePreset = {
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  team_size: string
  emoji: string
  color: string
  roles_count: number
  work_item_templates_count: number
  gates_count: number
  collaboration_pattern: string
  dag_summary: string
}

export type ArchitecturePresetDetail = {
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  team_size: string
  emoji: string
  color: string
  roles: {
    id: string
    name: string
    responsibility: string
    reports_to: string
    can_spawn?: string[]
  }[]
  work_item_templates: {
    id: string
    title: string
    role_id: string
    dependencies: string[]
    parallel_group: string | null
    gate?: { type: string; reviewer_role: string } | null
  }[]
}

export type RuntimePolicy = {
  communication?: { default_mode?: string; blocking_default?: boolean; allow_broadcast?: boolean }
  handoff?: { require_structured_handoff?: boolean; require_ack?: boolean }
  review?: { strict_gate_inference?: boolean; allow_human_override?: boolean }
  parallel?: { auto_dispatch?: boolean; max_workers?: number }
}
