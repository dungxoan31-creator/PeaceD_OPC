import type { PeaceDOpcVmRecipe } from '../../shared/peaced-opc-yaml-hook-types'
import type { PluginService } from './plugin-service'

export async function getApprovedPluginVmRecipes(
  pluginService?: PluginService
): Promise<PeaceDOpcVmRecipe[]> {
  if (!pluginService) {
    return []
  }
  await pluginService.whenReady()
  return pluginService.contentPacks.vmRecipes.list().map(({ recipe }) => recipe)
}
