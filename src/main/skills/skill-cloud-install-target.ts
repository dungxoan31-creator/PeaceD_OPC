import type { SkillInstallDestination } from '../../shared/skill-install-contract'
import type { PeaceDOpcRuntimeService } from '../runtime/peaced-opc-runtime'

export async function classifySkillCloudInstallTarget(
  runtime: PeaceDOpcRuntimeService,
  input: { environmentId?: string; destination: SkillInstallDestination }
): Promise<'local' | 'remote'> {
  return input.environmentId || (await runtime.skillInstallDestinationUsesSsh(input.destination))
    ? 'remote'
    : 'local'
}
