import type {
  PeaceDOpcCloudCapabilities,
  PeaceDOpcCloudOrgSummary,
  PeaceDOpcProfileCloudSummary
} from '../../shared/peaced-opc-profiles'

export type PeaceDOpcCloudSessionExchangeResponse = {
  accessToken: string
  refreshToken: string
  expiresAt: number
  cloud: PeaceDOpcProfileCloudSummary
  organizations?: PeaceDOpcCloudOrgSummary[]
  capabilities: PeaceDOpcCloudCapabilities
}
