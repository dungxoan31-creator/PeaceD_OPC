import type { TaskPreferredAgent } from './types'

export const TASK_AGENT_LABELS: Record<TaskPreferredAgent, string> = {
  native: 'PeaceD Native',
  codex: 'Codex',
  claude_code: 'Claude Code',
  cursor: 'Cursor',
  opencode: 'OpenCode',
  jiuwen: 'JiuwenSwarm-single',
  jiuwenswarm: 'JiuwenSwarm-team',
}

export const TASK_AGENT_OPTIONS: TaskPreferredAgent[] = [
  'native',
  'codex',
  'claude_code',
  'cursor',
  'opencode',
  'jiuwen',
  'jiuwenswarm',
]

export const RECRUITMENT_AGENT_OPTIONS: TaskPreferredAgent[] = [
  'native',
  'codex',
  'claude_code',
  'cursor',
  'opencode',
  'jiuwen',
  'jiuwenswarm',
]

function isTaskPreferredAgent(val: string): val is TaskPreferredAgent {
  return val in TASK_AGENT_LABELS
}

export function executionAgentLabel(value?: string): string {
  const normalized = String(value ?? '').trim().toLowerCase().replaceAll('-', '_')
  if (isTaskPreferredAgent(normalized)) {
    return TASK_AGENT_LABELS[normalized]
  }
  return String(value ?? '').trim()
}
