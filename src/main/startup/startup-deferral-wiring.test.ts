import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('startup deferral wiring', () => {
  const readSource = (name: string): string =>
    readFileSync(join(process.cwd(), 'src/main/startup', name), 'utf8').replace(/\r\n/g, '\n')

  const readyRuntimeSource = readSource('main-process-ready-runtime.ts')
  const foundationSource = readSource('main-process-ready-foundation.ts')

  it('defers plugin bootstrap, star nag, and orphan sweep behind first window shown', () => {
    // initializeMainProcessPlugins must NOT be awaited on the critical path
    expect(readyRuntimeSource).not.toContain('await initializeMainProcessPlugins(runtime)')
    // Background services must be wired to runAfterFirstWindowShown
    expect(readyRuntimeSource).toContain('runAfterFirstWindowShown(runDeferredBackgroundServices')
    expect(readyRuntimeSource).toContain('void initializeMainProcessPlugins(runtime)')
    expect(readyRuntimeSource).toContain('state.starNag?.start()')
    expect(readyRuntimeSource).toContain('void state.agentBrowserBridge?.sweepOrphanedSessions()')
  })

  it('defers browser session proxies behind first window shown in desktop mode', () => {
    // applyBrowserSessionProxies must NOT be awaited unconditionally on critical path
    expect(foundationSource).not.toMatch(
      /^\s*await applyBrowserSessionProxies\(browserSessionRegistry\.listProfiles\(\)/m
    )
    expect(foundationSource).toContain('runAfterFirstWindowShown(applyProxies')
    expect(foundationSource).toContain('applyBrowserSessionProxies(browserSessionRegistry.listProfiles()')
  })
})
