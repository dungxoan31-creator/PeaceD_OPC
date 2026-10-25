import { describe, it, expect } from 'vitest'
import type { OrgInfoPayload } from '../renderer/src/components/org/types'
import {
  payloadToOrgConfig,
  orgConfigToPayload,
  normalizeOrgConfig,
} from './org-config'

const MINIMAL_CONFIG = {
  organization_id: 'test-org',
  organization_name: 'Test',
  company_profile: 'custom',
  final_decider_role_id: 'ceo',
  top_level_role_ids: ['ceo'],
  org_version: 2,
  runtime_policy: { parallel: { max_workers: 4 } },
  roles: [
    {
      role_id: 'ceo', name: 'CEO', responsibility: 'Top', status: 'active',
      reports_to: '', can_spawn: [], tools: [],
    },
  ],
  employees: [],
}

const MINIMAL_PAYLOAD: OrgInfoPayload = {
  ...MINIMAL_CONFIG,
  channels: [{ name: 'general', enabled: true, running: true, configured: true, available: true, ready: true, last_error: null, delivery_mode: 'broadcast' }],
  connectors: [],
  org_version: 2,
  runtime_topology_version: 1,
  runtime_seats: [{ role_session_id: 's1', role_id: 'ceo', employee_id: 'e1', status: 'warm' }],
  work_items: [{ work_item_id: 'w1', role_id: 'ceo', cell_id: 'c1', title: 'Task', kind: 'feature', phase: 'ready', kanban_column: 'todo' }],
}

describe('payloadToOrgConfig', () => {
  it('strips runtime-only fields', () => {
    const config = payloadToOrgConfig(MINIMAL_PAYLOAD)
    expect('runtime_seats' in config).toBe(false)
    expect('work_items' in config).toBe(false)
    expect('channels' in config).toBe(false)
    expect('connectors' in config).toBe(false)
    expect('frontier' in config).toBe(false)
  })

  it('preserves config fields', () => {
    const config = payloadToOrgConfig(MINIMAL_PAYLOAD)
    expect(config.organization_id).toBe('test-org')
    expect(config.roles).toHaveLength(1)
    expect(config.org_version).toBe(2)
  })
})

describe('orgConfigToPayload', () => {
  it('produces empty runtime arrays', () => {
    const payload = orgConfigToPayload(MINIMAL_CONFIG)
    expect(payload.channels).toEqual([])
    expect(payload.connectors).toEqual([])
    expect(payload.runtime_seats ?? []).toEqual([])
    expect(payload.work_items ?? []).toEqual([])
  })

  it('preserves config fields', () => {
    const payload = orgConfigToPayload(MINIMAL_CONFIG)
    expect(payload.organization_id).toBe('test-org')
    expect(payload.roles).toHaveLength(1)
    expect(payload.runtime_topology_version).toBe(0)
  })
})

describe('normalizeOrgConfig', () => {
  it('returns defaults for empty object', () => {
    const config = normalizeOrgConfig({})
    expect(config.company_profile).toBe('')
    expect(config.org_version).toBe(0)
    expect(config.roles).toEqual([])
    expect(config.employees).toEqual([])
  })

  it('coerces org_version to number', () => {
    const config = normalizeOrgConfig({ org_version: '5', company_profile: 'custom', roles: [], employees: [] })
    expect(config.org_version).toBe(5)
  })

  it('ignores unknown fields', () => {
    const config = normalizeOrgConfig({ UNKNOWN_FIELD: true, company_profile: 'custom', roles: [], employees: [] })
    expect('UNKNOWN_FIELD' in config).toBe(false)
  })
})
