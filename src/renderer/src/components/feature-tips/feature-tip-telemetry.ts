import { track } from '@/lib/telemetry'
import type { EventProps } from '../../../../shared/telemetry-events'

export type PeaceDOpcCliFeatureTipSource = EventProps<'orca_cli_feature_tip_shown'>['source']
export type PeaceDOpcCliFeatureTipSetupResult = EventProps<'orca_cli_feature_tip_setup_result'>['result']
export type CmdJPaletteFeatureTipSource = EventProps<'cmd_j_palette_feature_tip_shown'>['source']

export function getOrcaCliFeatureTipTelemetrySource(value: unknown): PeaceDOpcCliFeatureTipSource {
  return value === 'app_open' ? 'app_open' : 'manual'
}

export function trackOrcaCliFeatureTipShown(source: PeaceDOpcCliFeatureTipSource): void {
  track('orca_cli_feature_tip_shown', { source })
}

export function trackOrcaCliFeatureTipSetupClicked(source: PeaceDOpcCliFeatureTipSource): void {
  track('orca_cli_feature_tip_setup_clicked', { source })
}

export function trackOrcaCliFeatureTipSetupResult(
  source: PeaceDOpcCliFeatureTipSource,
  result: PeaceDOpcCliFeatureTipSetupResult
): void {
  track('orca_cli_feature_tip_setup_result', { source, result })
}

export function trackCmdJPaletteFeatureTipShown(source: CmdJPaletteFeatureTipSource): void {
  track('cmd_j_palette_feature_tip_shown', { source })
}

export function trackCmdJPaletteFeatureTipAcknowledged(source: CmdJPaletteFeatureTipSource): void {
  track('cmd_j_palette_feature_tip_acknowledged', { source })
}
