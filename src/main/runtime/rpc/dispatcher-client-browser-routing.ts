import type { PeaceDOpcRuntimeService } from '../peaced-opc-runtime'

export function routeDispatcherClientHostedBrowserRpc(
  runtime: PeaceDOpcRuntimeService,
  method: string,
  params: unknown
) {
  const candidate = runtime as PeaceDOpcRuntimeService & {
    routeClientHostedBrowserRpc?: PeaceDOpcRuntimeService['routeClientHostedBrowserRpc']
  }
  return candidate.routeClientHostedBrowserRpc?.(method, params) ?? { handled: false as const }
}
