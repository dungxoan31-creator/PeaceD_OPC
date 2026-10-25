import { homedir } from 'node:os'
import { join } from 'node:path'
import { readFileSync } from 'node:fs'
import { APP_SLUG } from '../../shared/app-identity'
import {
  findTransport,
  getRuntimeMetadataPath,
  type RuntimeMetadata
} from '../../shared/runtime-bootstrap'
import { RuntimeClientError } from './types'

export function readMetadata(userDataPath: string): RuntimeMetadata {
  const metadataPath = getRuntimeMetadataPath(userDataPath)
  try {
    const metadata = JSON.parse(readFileSync(metadataPath, 'utf8')) as RuntimeMetadata | null
    if (!metadata || !findTransport(metadata, 'unix', 'named-pipe') || !metadata.authToken) {
      throw new RuntimeClientError(
        'runtime_unavailable',
        `PeaceD OPC runtime metadata is incomplete at ${metadataPath}`
      )
    }
    return metadata
  } catch (error) {
    if (error instanceof RuntimeClientError) {
      throw error
    }
    throw new RuntimeClientError(
      'runtime_unavailable',
      `Could not read PeaceD OPC runtime metadata at ${metadataPath}. Start the PeaceD OPC app first.`
    )
  }
}

export function tryReadMetadata(userDataPath: string): RuntimeMetadata | null {
  const metadataPath = getRuntimeMetadataPath(userDataPath)
  try {
    return JSON.parse(readFileSync(metadataPath, 'utf8')) as RuntimeMetadata | null
  } catch {
    return null
  }
}

export function getDefaultUserDataPath(
  platform: NodeJS.Platform = process.platform,
  homeDir = homedir()
): string {
  // Why: in dev mode (and for parallel PeaceD OPC instances), the Electron app writes
  // runtime metadata to a separate userData directory (e.g. `orca-dev`) to avoid
  // clobbering the production app's metadata. The CLI needs to find the same
  // metadata file, so this env var lets the CLI target a specific instance.
  const override = process.env.PEACED_OPC_USER_DATA_PATH || process.env.ORCA_USER_DATA_PATH
  if (override) {
    return override
  }
  if (platform === 'darwin') {
    return resolveUserDataDirectory(join(homeDir, 'Library', 'Application Support'))
  }
  if (platform === 'win32') {
    const appData = process.env.APPDATA
    if (!appData) {
      throw new RuntimeClientError(
        'runtime_unavailable',
        'APPDATA is not set, so the PeaceD OPC runtime metadata path cannot be resolved.'
      )
    }
    return resolveUserDataDirectory(appData)
  }
  // Why: the CLI must find the same metadata file Electron writes in packaged
  // runs, so this mirrors Electron's default userData base instead of inventing
  // a CLI-specific config path.
  return resolveUserDataDirectory(process.env.XDG_CONFIG_HOME || join(homeDir, '.config'))
}

function resolveUserDataDirectory(base: string): string {
  return join(base, APP_SLUG)
}
