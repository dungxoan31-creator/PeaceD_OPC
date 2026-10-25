import { stripCredentialsFromMessage } from './git-remote-error'
import type { PeaceDOpcVmRecipe } from './peaced-opc-yaml-hook-types'

export function getProvisionedRootRecipeRepoUrl(
  checkoutMode: PeaceDOpcVmRecipe['checkoutMode'],
  remoteUrl: string | undefined
): string | undefined {
  if (checkoutMode !== 'provisioned-root' || !remoteUrl) {
    return undefined
  }
  return stripCredentialsFromMessage(remoteUrl)
}
