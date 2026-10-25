export type TalentTemplate = {
  template_id: string
  name: string
  description: string
  category: string
  domains: string[]
  tags: string[]
  preferred_external_agent: string | null
  source_repo: string
  emoji?: string
  color?: string
  vibe?: string
  is_builtin?: boolean
  prompt_template?: string
}

export type TalentListPayload = {
  templates: TalentTemplate[]
  talent_dir?: string
}

export type EmployeeDetailPayload = {
  employee_id: string
  name: string
  role_id: string
  category: string
  domains: string[]
  seniority: string
  tags: string[]
  skill_refs: string[]
  experience_score: number
  learned_skill_refs: string[]
  delta_context: string
  profile: Record<string, unknown>
}

export type ReorgChangesetSummary = {
  role_changes: { action: string; role_id: string; reason: string }[]
  work_item_projection_changes: { action: string; work_item_projection_id: string; reason: string }[]
  task_adjustments_count: number
}

export type ReorgProposalInfo = {
  project_id: string
  proposal_id: string
  title: string
  summary: string
  rationale: string
  scope: string
  risk_level: string
  status: string
  initiated_by: string
  changeset: ReorgChangesetSummary
  impact_summary: Record<string, unknown>
  user_confirmation_required: boolean
  checkpoint_id: string
  checkpoint_type: string
  checkpoint_status: string
  requester_task_id: string
  requester_session_id: string
  created_at: number
  updated_at: number
}

export type ReorgListPayload = {
  project_id: string
  proposals: ReorgProposalInfo[]
}
