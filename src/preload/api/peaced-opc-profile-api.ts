import type {
  ConnectCurrentOrcaProfileResult,
  CreateCloudLinkedOrcaProfileArgs,
  CreateCloudLinkedOrcaProfileResult,
  CreateLocalOrcaProfileArgs,
  CreateLocalOrcaProfileResult,
  FindOrcaProfileProjectsByPathArgs,
  FindOrcaProfileProjectsByPathResult,
  PeaceDOpcProfileAuthStatus,
  PeaceDOpcProfileListResult,
  PeaceDOpcProfileOrgInviteRevokeArgs,
  PeaceDOpcProfileOrgMemberChangeRoleArgs,
  PeaceDOpcProfileOrgMemberInviteArgs,
  PeaceDOpcProfileOrgMemberMutationResult,
  PeaceDOpcProfileOrgMemberRemoveArgs,
  PeaceDOpcProfileOrgMembersListArgs,
  PeaceDOpcProfileOrgMembersListResult,
  RefreshCurrentOrcaProfileAuthResult,
  SelectOrcaProfileOrgArgs,
  SelectOrcaProfileOrgResult,
  SignOutCurrentOrcaProfileResult,
  SwitchOrcaProfileArgs,
  SwitchOrcaProfileResult,
  TransferOrcaProfileProjectArgs,
  TransferOrcaProfileProjectResult
} from '../../shared/peaced-opc-profiles'

export type PeaceDOpcProfileApi = {
  list: () => Promise<PeaceDOpcProfileListResult>
  authStatus: () => Promise<PeaceDOpcProfileAuthStatus>
  /** Fires when main changed the stored auth status on its own (e.g. a revoked session). */
  onAuthStatusChanged: (callback: () => void) => () => void
  createLocal: (args?: CreateLocalOrcaProfileArgs) => Promise<CreateLocalOrcaProfileResult>
  createCloudLinked: (
    args?: CreateCloudLinkedOrcaProfileArgs
  ) => Promise<CreateCloudLinkedOrcaProfileResult>
  switchProfile: (args: SwitchOrcaProfileArgs) => Promise<SwitchOrcaProfileResult>
  transferProject: (
    args: TransferOrcaProfileProjectArgs
  ) => Promise<TransferOrcaProfileProjectResult>
  findProjectProfiles: (
    args: FindOrcaProfileProjectsByPathArgs
  ) => Promise<FindOrcaProfileProjectsByPathResult>
  connectCurrent: () => Promise<ConnectCurrentOrcaProfileResult>
  refreshAuth: () => Promise<RefreshCurrentOrcaProfileAuthResult>
  signOutCurrent: () => Promise<SignOutCurrentOrcaProfileResult>
  selectOrg: (args: SelectOrcaProfileOrgArgs) => Promise<SelectOrcaProfileOrgResult>
  orgMembersList: (args: PeaceDOpcProfileOrgMembersListArgs) => Promise<PeaceDOpcProfileOrgMembersListResult>
  orgMemberInvite: (
    args: PeaceDOpcProfileOrgMemberInviteArgs
  ) => Promise<PeaceDOpcProfileOrgMemberMutationResult>
  orgInviteRevoke: (
    args: PeaceDOpcProfileOrgInviteRevokeArgs
  ) => Promise<PeaceDOpcProfileOrgMemberMutationResult>
  orgMemberChangeRole: (
    args: PeaceDOpcProfileOrgMemberChangeRoleArgs
  ) => Promise<PeaceDOpcProfileOrgMemberMutationResult>
  orgMemberRemove: (
    args: PeaceDOpcProfileOrgMemberRemoveArgs
  ) => Promise<PeaceDOpcProfileOrgMemberMutationResult>
}
