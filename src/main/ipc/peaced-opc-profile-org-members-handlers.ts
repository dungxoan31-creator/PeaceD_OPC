import { ipcMain } from 'electron'
import type {
  PeaceDOpcOrgRole,
  PeaceDOpcProfileOrgInviteRevokeArgs,
  PeaceDOpcProfileOrgMemberChangeRoleArgs,
  PeaceDOpcProfileOrgMemberInviteArgs,
  PeaceDOpcProfileOrgMemberMutationResult,
  PeaceDOpcProfileOrgMemberRemoveArgs,
  PeaceDOpcProfileOrgMembersListArgs,
  PeaceDOpcProfileOrgMembersListResult
} from '../../shared/peaced-opc-profiles'
import { getProfileUserDataPath } from '../orca-profiles/profile-storage-paths'
import {
  changeOrcaProfileOrgMemberRole,
  inviteOrcaProfileOrgMember,
  listOrcaProfileOrgMembers,
  removeOrcaProfileOrgMember,
  revokeOrcaProfileOrgInvite
} from '../orca-profiles/profile-cloud-org-members-service'

function orgMembersScopedArgs(args: unknown): { orgId: string; record: Record<string, unknown> } {
  if (!args || typeof args !== 'object') {
    throw new Error('invalid_orca_profile_org_selection')
  }
  const record = args as Record<string, unknown>
  const orgId = typeof record.orgId === 'string' ? record.orgId.trim() : ''
  if (!orgId) {
    throw new Error('invalid_orca_profile_org_selection')
  }
  return { orgId, record }
}

function orgRoleFromUnknown(value: unknown): PeaceDOpcOrgRole {
  if (value === 'owner' || value === 'admin' || value === 'member') {
    return value
  }
  throw new Error('invalid_orca_org_role')
}

function orgEmailFromUnknown(value: unknown): string {
  const email = typeof value === 'string' ? value.trim() : ''
  if (!email) {
    throw new Error('invalid_orca_org_member_email')
  }
  return email
}

function orgUserIdFromUnknown(value: unknown): string {
  const userId = typeof value === 'string' ? value.trim() : ''
  if (!userId) {
    throw new Error('invalid_orca_org_member_user')
  }
  return userId
}

function orgMemberInviteArgsFromUnknown(args: unknown): PeaceDOpcProfileOrgMemberInviteArgs {
  const { orgId, record } = orgMembersScopedArgs(args)
  return { orgId, email: orgEmailFromUnknown(record.email), role: orgRoleFromUnknown(record.role) }
}

function orgInviteRevokeArgsFromUnknown(args: unknown): PeaceDOpcProfileOrgInviteRevokeArgs {
  const { orgId, record } = orgMembersScopedArgs(args)
  return { orgId, email: orgEmailFromUnknown(record.email) }
}

function orgMemberChangeRoleArgsFromUnknown(args: unknown): PeaceDOpcProfileOrgMemberChangeRoleArgs {
  const { orgId, record } = orgMembersScopedArgs(args)
  return {
    orgId,
    userId: orgUserIdFromUnknown(record.userId),
    role: orgRoleFromUnknown(record.role)
  }
}

function orgMemberRemoveArgsFromUnknown(args: unknown): PeaceDOpcProfileOrgMemberRemoveArgs {
  const { orgId, record } = orgMembersScopedArgs(args)
  return { orgId, userId: orgUserIdFromUnknown(record.userId) }
}

export function registerOrcaProfileOrgMemberHandlers(): void {
  ipcMain.handle(
    'orcaProfiles:orgMembersList',
    async (
      _event,
      rawArgs: PeaceDOpcProfileOrgMembersListArgs
    ): Promise<PeaceDOpcProfileOrgMembersListResult> =>
      listOrcaProfileOrgMembers(getProfileUserDataPath(), orgMembersScopedArgs(rawArgs).orgId)
  )

  ipcMain.handle(
    'orcaProfiles:orgMemberInvite',
    async (
      _event,
      rawArgs: PeaceDOpcProfileOrgMemberInviteArgs
    ): Promise<PeaceDOpcProfileOrgMemberMutationResult> =>
      inviteOrcaProfileOrgMember(getProfileUserDataPath(), orgMemberInviteArgsFromUnknown(rawArgs))
  )

  ipcMain.handle(
    'orcaProfiles:orgInviteRevoke',
    async (
      _event,
      rawArgs: PeaceDOpcProfileOrgInviteRevokeArgs
    ): Promise<PeaceDOpcProfileOrgMemberMutationResult> =>
      revokeOrcaProfileOrgInvite(getProfileUserDataPath(), orgInviteRevokeArgsFromUnknown(rawArgs))
  )

  ipcMain.handle(
    'orcaProfiles:orgMemberChangeRole',
    async (
      _event,
      rawArgs: PeaceDOpcProfileOrgMemberChangeRoleArgs
    ): Promise<PeaceDOpcProfileOrgMemberMutationResult> =>
      changeOrcaProfileOrgMemberRole(
        getProfileUserDataPath(),
        orgMemberChangeRoleArgsFromUnknown(rawArgs)
      )
  )

  ipcMain.handle(
    'orcaProfiles:orgMemberRemove',
    async (
      _event,
      rawArgs: PeaceDOpcProfileOrgMemberRemoveArgs
    ): Promise<PeaceDOpcProfileOrgMemberMutationResult> =>
      removeOrcaProfileOrgMember(getProfileUserDataPath(), orgMemberRemoveArgsFromUnknown(rawArgs))
  )
}
