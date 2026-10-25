import { ipcMain } from 'electron'
import { readFile, writeFile, mkdir, rename } from 'node:fs/promises'
import { join } from 'node:path'
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml'
import { normalizeOrgConfig } from '../../shared/org-config'
import type { OrgConfig } from '../../shared/org-config'

const ORG_DIR = '.orca'
const ORG_FILE = 'org.yaml'

function orgFilePath(worktreeRoot: string): string {
  return join(worktreeRoot, ORG_DIR, ORG_FILE)
}

export async function readOrgConfig(worktreeRoot: string): Promise<OrgConfig | null> {
  const filePath = orgFilePath(worktreeRoot)
  let raw: string
  try {
    raw = await readFile(filePath, 'utf8')
  } catch {
    return null
  }
  try {
    const parsed: unknown = parseYaml(raw)
    return normalizeOrgConfig(parsed)
  } catch {
    return null
  }
}

export async function writeOrgConfig(worktreeRoot: string, config: OrgConfig): Promise<void> {
  const dirPath = join(worktreeRoot, ORG_DIR)
  await mkdir(dirPath, { recursive: true })
  const yaml = stringifyYaml(config)
  const tmpPath = join(dirPath, `${ORG_FILE}.tmp`)
  await writeFile(tmpPath, yaml, 'utf8')
  await rename(tmpPath, orgFilePath(worktreeRoot))
}

export function registerOrgConfigHandlers(): void {
  ipcMain.handle('org:readConfig', (_event, worktreeRoot: string): Promise<OrgConfig | null> => {
    if (typeof worktreeRoot !== 'string' || !worktreeRoot.trim()) {
      return Promise.resolve(null)
    }
    return readOrgConfig(worktreeRoot)
  })

  ipcMain.handle('org:writeConfig', (_event, worktreeRoot: string, config: unknown): Promise<void> => {
    if (typeof worktreeRoot !== 'string' || !worktreeRoot.trim()) {
      throw new Error('org:writeConfig requires a non-empty worktreeRoot string')
    }
    return writeOrgConfig(worktreeRoot, normalizeOrgConfig(config))
  })
}
