import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtemp, rm, readFile, writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { parse as parseYaml } from 'yaml'
import { readOrgConfig, writeOrgConfig } from './org-config-handlers'

let tmpDir: string

beforeEach(async () => {
  tmpDir = await mkdtemp(join(tmpdir(), 'orca-org-test-'))
})

afterEach(async () => {
  await rm(tmpDir, { recursive: true, force: true })
})

describe('readOrgConfig', () => {
  it('returns null when .orca/org.yaml does not exist', async () => {
    const result = await readOrgConfig(tmpDir)
    expect(result).toBeNull()
  })

  it('reads and normalizes an existing file', async () => {
    await mkdir(join(tmpDir, '.orca'))
    await writeFile(
      join(tmpDir, '.orca', 'org.yaml'),
      'company_profile: custom\norg_version: 3\nroles: []\nemployees: []\n',
      'utf8'
    )
    const result = await readOrgConfig(tmpDir)
    expect(result).not.toBeNull()
    expect(result?.company_profile).toBe('custom')
    expect(result?.org_version).toBe(3)
  })

  it('returns null for malformed YAML', async () => {
    await mkdir(join(tmpDir, '.orca'))
    await writeFile(join(tmpDir, '.orca', 'org.yaml'), 'foo: [unclosed', 'utf8')
    const result = await readOrgConfig(tmpDir)
    expect(result).toBeNull()
  })
})

describe('writeOrgConfig', () => {
  it('creates .orca directory if absent', async () => {
    await writeOrgConfig(tmpDir, { company_profile: 'custom', org_version: 1, roles: [], employees: [] })
    const content = await readFile(join(tmpDir, '.orca', 'org.yaml'), 'utf8')
    expect(content).toContain('company_profile: custom')
  })

  it('writes valid YAML that round-trips through readOrgConfig', async () => {
    const config = { company_profile: 'custom', org_version: 7, roles: [], employees: [], organization_id: 'proj-1' }
    await writeOrgConfig(tmpDir, config)
    const read = await readOrgConfig(tmpDir)
    expect(read?.org_version).toBe(7)
    expect(read?.organization_id).toBe('proj-1')
  })

  it('overwrites an existing file', async () => {
    await mkdir(join(tmpDir, '.orca'))
    await writeFile(join(tmpDir, '.orca', 'org.yaml'), 'org_version: 1\ncompany_profile: old\nroles: []\nemployees: []\n', 'utf8')
    await writeOrgConfig(tmpDir, { company_profile: 'new', org_version: 2, roles: [], employees: [] })
    const raw = parseYaml(await readFile(join(tmpDir, '.orca', 'org.yaml'), 'utf8')) as Record<string, unknown>
    expect(raw.org_version).toBe(2)
    expect(raw.company_profile).toBe('new')
  })
})
