import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('app startup hydration progressive reconnect ordering', () => {
  const readSource = (name: string): string =>
    readFileSync(join(process.cwd(), name), 'utf8').replace(/\r\n/g, '\n')

  const source = readSource('src/renderer/src/app-shell/use-app-startup-hydration.ts')
  const deferredSource = readSource('src/renderer/src/app-shell/startup-deferred-catalog-refresh.ts')

  it('restores active workspace terminals before unlocking interactive state', () => {
    const activeReconnectIndex = source.indexOf("timeRendererStartupStep('reconnect-active-workspace-terminals'")
    const interactiveGateIndex = source.indexOf('actions.setTerminalStartupRestorationReady(true)')
    const activeTabDiagnosticIndex = source.indexOf("logRendererStartupDiagnostic('active-tab-restored')")
    const deferredRefreshIndex = source.indexOf('runStartupDeferredCatalogRefresh(')
    const backgroundReconnectIndex = deferredSource.indexOf("timeRendererStartupStep('reconnect-background-terminals'")

    expect(activeReconnectIndex).toBeGreaterThanOrEqual(0)
    expect(interactiveGateIndex).toBeGreaterThan(activeReconnectIndex)
    expect(activeTabDiagnosticIndex).toBeGreaterThan(activeReconnectIndex)
    expect(deferredRefreshIndex).toBeGreaterThan(interactiveGateIndex)
    expect(backgroundReconnectIndex).toBeGreaterThanOrEqual(0)
  })
})
