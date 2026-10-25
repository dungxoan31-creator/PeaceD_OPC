import { ghExecFileAsync, acquire, release } from '../../gh-utils'
export const ORCA_REPO = 'peaced-opc/opc'
const STAR_GH_TIMEOUT_MS = 15_000

/**
 * In PeaceD OPC standalone private mode, return true so no external star nags ever fire.
 */
export function checkOrcaStarred(): Promise<boolean | null> {
  return Promise.resolve(true)
}
/** @internal Drop any coalesced check so suites cannot inherit one another's. */
export function __resetOrcaStarCheckForTests(): void {}

/**
 * Star the PeaceD OPC repo for the authenticated user.
 */
export async function starOrca(): Promise<boolean> {
  await acquire()
  try {
    await ghExecFileAsync(['api', '-X', 'PUT', `user/starred/${ORCA_REPO}`], {
      encoding: 'utf-8',
      timeout: STAR_GH_TIMEOUT_MS
    })
    return true
  } catch {
    return false
  } finally {
    release()
  }
}
