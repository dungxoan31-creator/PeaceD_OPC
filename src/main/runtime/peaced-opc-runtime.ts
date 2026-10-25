import { installRuntimeLinearCommandSurface } from './runtime-linear-command-surface'
import { PeaceDOpcRuntimeWithResolveWaiter } from './peaced-opc-runtime-resolve-waiter'
import type { RuntimeCommandSurfaceHost } from './peaced-opc-runtime-core'

class PeaceDOpcRuntimeService extends PeaceDOpcRuntimeWithResolveWaiter {}
type PeaceDOpcRuntimeServiceExport = RuntimeCommandSurfaceHost<PeaceDOpcRuntimeService>
const PeaceDOpcRuntimeServiceExport = PeaceDOpcRuntimeService as unknown as {
  new (...args: ConstructorParameters<typeof PeaceDOpcRuntimeService>): PeaceDOpcRuntimeServiceExport
  readonly prototype: PeaceDOpcRuntimeServiceExport
}
export { PeaceDOpcRuntimeServiceExport as PeaceDOpcRuntimeService }
installRuntimeLinearCommandSurface(PeaceDOpcRuntimeServiceExport.prototype)

export type { LegacyWorkerTerminalRecoveryResult } from './runtime-legacy-worker-terminal-recovery-types'
export type {
  RuntimeAutomationCreateInput,
  RuntimeAutomationUpdateInput
} from './runtime-automation-controller'
export type { SubscriptionRegistration } from './runtime-subscription-registry'
export type {
  OrchestrationCompatibilityCallerAuthority,
  OrchestrationCompatibilityTerminalAuthority,
  RuntimePtyDataAdmission,
  RuntimeTerminalAgentStatusEvent
} from './runtime-terminal-contracts'
export type { MessageWaitResult } from './runtime-message-waiters'
export type { AccountsSnapshot, CodexRateLimitResetRpcResult } from './runtime-account-controller'
export type {
  MobileNotificationDispatchEvent,
  MobileNotificationDismissEvent,
  MobileNotificationEvent
} from './runtime-mobile-notification-controller'
export type { RuntimeTerminalDataMeta } from './runtime-terminal-stream-consumers'
export type { RemoteFetchResult, RemoteTrackingBase } from './runtime-remote-fetch-controller'
export {
  computeTerminalTailWaitState,
  tailGainedNewerBlockedReason,
  type TerminalTailWaitState
} from './terminal-wait-tail-state'
export { appendNormalizedToTailBuffer } from './terminal-tail-buffer'
export { appendNormalizedToMultilineTailBufferUnwindowed } from './terminal-tail-redraw-buffer'
export { buildPreview } from './terminal-tail-state'
export { buildRestoredTerminalTailSeed } from './terminal-tail-restore-seed'
export { projectTerminalTailLines } from './peaced-opc-runtime-terminal-projection'
export { resolveWorktreeScanCacheTtlMs } from './runtime-worktree-scan-cache'
export type {
  RuntimeWorktreeLifecycleEvent,
  DriverState,
  PtyLayoutTarget,
  PtyLayoutState,
  ApplyLayoutResult,
  RuntimeRendererReloadFence
} from './peaced-opc-runtime-core'
export {
  AUTHORITATIVE_TERMINAL_SNAPSHOT_TIMEOUT_MS,
  WORKTREE_SCAN_ADMIN_RECONCILE_INTERVAL_MS,
  WORKTREE_SCAN_ADMIN_FINGERPRINT_TIMEOUT_MS
} from './peaced-opc-runtime-postlude'
