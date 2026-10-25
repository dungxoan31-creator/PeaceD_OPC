export const APP_NAME = 'PeaceD OPC'
export const APP_SLUG = 'peaced-opc'
export const APP_DATA_FILE_NAME = 'peaced-opc-data.json'
export const LEGACY_APP_DATA_FILE_NAME = 'orca-data.json'

// Old QR codes and published skill links must remain usable after an upgrade.
export function isAppProtocol(protocol: string): boolean {
  return ['peaced-opc:', 'opc:', 'orca:'].includes(protocol.toLowerCase())
}

export function isAppLink(value: string): boolean {
  return /^(?:peaced-opc|opc|orca):/i.test(value)
}

export type AppIdentity = {
  name: string
  isDev: boolean
  devLabel: string | null
  devBranch: string | null
  devWorktreeName: string | null
  devRepoRoot: string | null
  dockBadgeLabel: string | null
}
