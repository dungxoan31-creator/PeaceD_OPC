import type { PeaceDOpcProfileAuthStatus } from '../../../../shared/peaced-opc-profiles'

export type UnexpectedSignoutGate = {
  authStatus: PeaceDOpcProfileAuthStatus | null
  persistedUIReady: boolean
  appVersion: string | null
  dismissedVersion: string | null
}

export function shouldShowUnexpectedSignoutCard(gate: UnexpectedSignoutGate): boolean {
  if (!gate.persistedUIReady || gate.appVersion === null) {
    return false
  }
  if (gate.dismissedVersion !== null) {
    return false
  }
  return (
    gate.authStatus?.configured === true &&
    gate.authStatus.state === 'reconnect-required' &&
    gate.authStatus.cloud != null
  )
}
