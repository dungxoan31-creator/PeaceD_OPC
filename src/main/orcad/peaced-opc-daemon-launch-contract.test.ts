/**
 * The two things a supervisor reads off a launch: what the arguments mean, and what an exit
 * code means. Both are part of the ops contract in docs/reference/orcad-operations.md.
 */
import { describe, expect, it, vi } from 'vitest'
import {
  ORCAD_EXIT_CONFIGURATION,
  ORCAD_EXIT_FAILED,
  parseArgs,
  resolveOrcadExitCode
} from './peaced-opc-daemon-entry'
import { startOrcadWithLifecycle } from './peaced-opc-daemon-lifecycle'
import { PeaceDOpcDaemonBindAddressError } from './peaced-opc-daemon-bind-address'
import { PeaceDOpcDaemonInstanceLockError } from './peaced-opc-daemon-instance-lock'

describe('parseArgs', () => {
  it('accepts --bind and leaves it unset when absent', () => {
    expect(parseArgs(['--bind', '0.0.0.0'])).toEqual({ bind: '0.0.0.0' })
    expect(parseArgs([])).toEqual({})
    expect(parseArgs(['--port', '6768', '--bind', '10.0.0.5', '--json'])).toEqual({
      port: 6768,
      bind: '10.0.0.5',
      json: true
    })
  })

  it('rejects --bind with no value rather than silently binding the default', () => {
    expect(() => parseArgs(['--bind'])).toThrow('--bind expects a value')
    expect(() => parseArgs(['--bind', '--json'])).not.toThrow()
  })
})

describe('resolveOrcadExitCode', () => {
  it('separates a configuration fault from a generic failure', () => {
    // A supervisor must be able to stop restarting on faults that restarting cannot fix:
    // a data root owned by someone else, held by another instance, or a bad bind address.
    expect(
      resolveOrcadExitCode(new PeaceDOpcDaemonInstanceLockError('orcad_instance_lock_held', 'held'))
    ).toBe(ORCAD_EXIT_CONFIGURATION)
    expect(resolveOrcadExitCode(new PeaceDOpcDaemonBindAddressError('bad'))).toBe(ORCAD_EXIT_CONFIGURATION)
    expect(resolveOrcadExitCode(new Error('port in use'))).toBe(ORCAD_EXIT_FAILED)
    expect(ORCAD_EXIT_CONFIGURATION).not.toBe(ORCAD_EXIT_FAILED)
  })
})

describe('orcad lifecycle cleanup', () => {
  it('uninstalls registered runtime resources when startup fails', async () => {
    const cleanupRuntime = vi.fn(async () => {})
    const cleanupHost = vi.fn(async () => {})

    await expect(
      startOrcadWithLifecycle(async (registerCleanup) => {
        registerCleanup(cleanupRuntime)
        await Promise.resolve()
        throw new Error('startup failed')
      }, cleanupHost)
    ).rejects.toThrow('startup failed')

    expect(cleanupRuntime).toHaveBeenCalledOnce()
    expect(cleanupHost).toHaveBeenCalledOnce()
  })

  it('preserves the startup error when rollback also fails', async () => {
    const startupError = new Error('bind failed')
    const cleanupError = new Error('daemon stop failed')
    const cleanupRuntime = vi.fn(async () => {})
    const cleanupHost = vi.fn(async () => {
      throw cleanupError
    })
    const report = vi.spyOn(console, 'error').mockImplementation(() => {})

    try {
      await expect(
        startOrcadWithLifecycle(async (registerCleanup) => {
          registerCleanup(cleanupRuntime)
          throw startupError
        }, cleanupHost)
      ).rejects.toBe(startupError)
      expect(report).toHaveBeenCalledWith('[orcad] startup cleanup failed:', cleanupError)
    } finally {
      report.mockRestore()
    }
  })

  it('coalesces concurrent and repeated normal stops', async () => {
    const cleanupRuntime = vi.fn(async () => {})
    const cleanupHost = vi.fn(async () => {})
    const handle = await startOrcadWithLifecycle(async (registerCleanup) => {
      registerCleanup(cleanupRuntime)
      return { readiness: 'ready' }
    }, cleanupHost)

    await Promise.all([handle.stop(), handle.stop()])
    await handle.stop()

    expect(cleanupRuntime).toHaveBeenCalledOnce()
    expect(cleanupHost).toHaveBeenCalledOnce()
  })
})
