import { describe, it, expect } from 'vitest'
import { payloadToOrgConfig, orgConfigToPayload } from '../../../../shared/org-config'
import { INITIAL_ORG_PAYLOAD } from './default-data'

describe('payloadToOrgConfig round-trip', () => {
  it('strips runtime fields and round-trips config fields', () => {
    const config = payloadToOrgConfig(INITIAL_ORG_PAYLOAD)
    const payload = orgConfigToPayload(config)
    expect(payload.roles).toEqual(INITIAL_ORG_PAYLOAD.roles)
    expect(payload.employees).toEqual(INITIAL_ORG_PAYLOAD.employees)
    expect(payload.company_profile).toBe(INITIAL_ORG_PAYLOAD.company_profile)
    // runtime fields should be empty
    expect(payload.channels).toEqual([])
    expect(payload.connectors).toEqual([])
    expect(payload.runtime_seats ?? []).toEqual([])
  })
})

describe('orgConfigToPayload defaults', () => {
  it('sets runtime_topology_version to 0', () => {
    const payload = orgConfigToPayload({
      company_profile: 'custom',
      org_version: 1,
      roles: [],
      employees: []
    })
    expect(payload.runtime_topology_version).toBe(0)
  })
})
