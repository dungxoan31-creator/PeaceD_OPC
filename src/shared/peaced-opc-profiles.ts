import { ORCA_BROWSER_PARTITION } from './constants'
import type { ExecutionHostId } from './execution-host'

export const ORCA_PROFILE_INDEX_SCHEMA_VERSION = 1
export const DEFAULT_LOCAL_ORCA_PROFILE_ID = 'local-default'
export const DEFAULT_LOCAL_ORCA_PROFILE_NAME = 'Personal'
/** Main -> renderer push when the stored auth status changed without the renderer asking. */
export const ORCA_PROFILE_AUTH_STATUS_CHANGED_CHANNEL = 'orcaProfiles:authStatusChanged'
const LEGACY_ORCA_BROWSER_SESSION_PARTITION_PREFIX = 'persist:orca-browser-session-'

export type PeaceDOpcProfileAvatar = {
  kind: 'initials'
  initials: string
  color: 'neutral'
}

export type PeaceDOpcProfileKind = 'local' | 'cloud-linked'

export type PeaceDOpcProfileCloudSummary = {
  cloudProfileId: string
  userId: string
  email: string
  displayName?: string
  activeOrgId?: string
  activeOrgName?: string
  linkedAt: number
}

export type PeaceDOpcCloudOrgSummary = {
  orgId: string
  name: string
  role?: string
}

export type PeaceDOpcCloudCapabilityFlags = Record<string, boolean>

export type PeaceDOpcCloudCapabilities = {
  flags: PeaceDOpcCloudCapabilityFlags
  refreshedAt: number
}

export type PeaceDOpcCloudSessionPersistence = 'none' | 'encrypted' | 'memory-only' | 'dev-plaintext'

export type PeaceDOpcProfileAuthState = 'local' | 'unconfigured' | 'connected' | 'reconnect-required'

export type PeaceDOpcProfileAuthStatus = {
  activeProfileId: string
  configured: boolean
  state: PeaceDOpcProfileAuthState
  persistence: PeaceDOpcCloudSessionPersistence
  cloud?: PeaceDOpcProfileCloudSummary
  organizations?: PeaceDOpcCloudOrgSummary[]
  capabilities?: PeaceDOpcCloudCapabilities
  credentialError?: string
  setupMessage?: string
}

export type PeaceDOpcProfileSummary = {
  id: string
  name: string
  avatar: PeaceDOpcProfileAvatar
  kind: PeaceDOpcProfileKind
  createdAt: number
  updatedAt: number
  lastOpenedAt: number
  cloud?: PeaceDOpcProfileCloudSummary
}

export type PeaceDOpcProfileIndex = {
  schemaVersion: number
  activeProfileId: string
  profiles: PeaceDOpcProfileSummary[]
}

export type PeaceDOpcProfileListState = {
  activeProfileId: string
  profiles: PeaceDOpcProfileSummary[]
}

export type PeaceDOpcProfileListResult = PeaceDOpcProfileListState & {
  // Why: gates the full multi-profile switcher UI; default builds show a
  // single-profile account menu instead.
  multiProfileUi: boolean
}

export type CreateLocalOrcaProfileArgs = {
  name?: string
}

export type CreateLocalOrcaProfileResult = PeaceDOpcProfileListState & {
  profile: PeaceDOpcProfileSummary
}

export type CreateCloudLinkedOrcaProfileArgs = {
  orgId?: string
  name?: string
}

export type SwitchOrcaProfileArgs = {
  profileId: string
}

export type SwitchOrcaProfileResult = {
  status: 'already-active' | 'relaunching'
}

export type TransferOrcaProfileProjectMode = 'move' | 'copy'

export type TransferOrcaProfileProjectArgs = {
  sourceProfileId: string
  targetProfileId: string
  repoId: string
  mode: TransferOrcaProfileProjectMode
}

export type FindOrcaProfileProjectsByPathArgs = {
  path: string
  connectionId?: string | null
  executionHostId?: ExecutionHostId | null
  excludeProfileId?: string | null
}

export type PeaceDOpcProfileProjectPresence = {
  profileId: string
  profileName: string
  profileKind: PeaceDOpcProfileKind
  repoId: string
  repoName: string
}

export type FindOrcaProfileProjectsByPathResult = {
  projects: PeaceDOpcProfileProjectPresence[]
}

export type TransferOrcaProfileProjectResult =
  | {
      status: 'transferred'
      mode: TransferOrcaProfileProjectMode
      sourceProfileId: string
      targetProfileId: string
      sourceRepoId: string
      targetRepoId: string
      targetProjectId: string | null
      willRelaunch?: boolean
    }
  | {
      status: 'duplicate-target'
      sourceProfileId: string
      targetProfileId: string
      sourceRepoId: string
      duplicateRepoId: string
    }

export type ConnectCurrentOrcaProfileResult =
  | {
      status: 'connected'
      auth: PeaceDOpcProfileAuthStatus
      activeProfileId: string
      profiles: PeaceDOpcProfileSummary[]
    }
  | {
      status: 'unconfigured'
      auth: PeaceDOpcProfileAuthStatus
    }
  | {
      status: 'cancelled'
      auth: PeaceDOpcProfileAuthStatus
    }
  | {
      status: 'failed'
      auth: PeaceDOpcProfileAuthStatus
      error: string
    }

export type CreateCloudLinkedOrcaProfileResult =
  | {
      status: 'created'
      auth: PeaceDOpcProfileAuthStatus
      activeProfileId: string
      profiles: PeaceDOpcProfileSummary[]
      profile: PeaceDOpcProfileSummary
    }
  | {
      status: 'unconfigured' | 'reconnect-required'
      auth: PeaceDOpcProfileAuthStatus
    }
  | {
      status: 'failed'
      auth: PeaceDOpcProfileAuthStatus
      error: string
    }

export type SignOutCurrentOrcaProfileResult = {
  status: 'signed-out'
  auth: PeaceDOpcProfileAuthStatus
  activeProfileId: string
  profiles: PeaceDOpcProfileSummary[]
}

export type SelectOrcaProfileOrgArgs = {
  orgId: string
}

export type SelectOrcaProfileOrgResult =
  | {
      status: 'selected'
      auth: PeaceDOpcProfileAuthStatus
      activeProfileId: string
      profiles: PeaceDOpcProfileSummary[]
    }
  | {
      status: 'unconfigured' | 'reconnect-required'
      auth: PeaceDOpcProfileAuthStatus
    }
  | {
      status: 'failed'
      auth: PeaceDOpcProfileAuthStatus
      error: string
    }

export type RefreshCurrentOrcaProfileAuthResult =
  | {
      status: 'refreshed'
      auth: PeaceDOpcProfileAuthStatus
      activeProfileId: string
      profiles: PeaceDOpcProfileSummary[]
    }
  | {
      status: 'local' | 'unconfigured' | 'reconnect-required'
      auth: PeaceDOpcProfileAuthStatus
    }
  | {
      status: 'failed'
      auth: PeaceDOpcProfileAuthStatus
      error: string
    }

// Why: organization roles are a fixed server-side enum; the desktop UI mirrors
// exactly these three so role selects can't drift from what the API accepts.
export type PeaceDOpcOrgRole = 'owner' | 'admin' | 'member'

export type PeaceDOpcOrgMember = {
  // Why: null for teammates provisioned server-side who never signed into PeaceD OPC;
  // mutation actions are disabled for them since the API keys on a real userId.
  userId: string | null
  email: string
  displayName?: string
  role: PeaceDOpcOrgRole
}

export type PeaceDOpcOrgPendingInvite = {
  email: string
  role: PeaceDOpcOrgRole
  createdAt: number
}

export type PeaceDOpcOrgMembersRoster = {
  members: PeaceDOpcOrgMember[]
  pendingInvites: PeaceDOpcOrgPendingInvite[]
  viewerRole: PeaceDOpcOrgRole
  canManageMembers: boolean
}

export type PeaceDOpcProfileOrgMembersListArgs = {
  orgId: string
}

export type PeaceDOpcProfileOrgMemberInviteArgs = {
  orgId: string
  email: string
  role: PeaceDOpcOrgRole
}

export type PeaceDOpcProfileOrgInviteRevokeArgs = {
  orgId: string
  email: string
}

export type PeaceDOpcProfileOrgMemberChangeRoleArgs = {
  orgId: string
  userId: string
  role: PeaceDOpcOrgRole
}

export type PeaceDOpcProfileOrgMemberRemoveArgs = {
  orgId: string
  userId: string
}

export type PeaceDOpcProfileOrgMembersListResult =
  | { status: 'ok'; roster: PeaceDOpcOrgMembersRoster }
  | { status: 'unconfigured' | 'reconnect-required' }
  | { status: 'failed'; error: string }

export type PeaceDOpcOrgInviteConflictReason = 'already_member' | 'already_invited'
export type PeaceDOpcOrgMutationInvalidReason = 'cannot_change_own_role' | 'cannot_remove_self'

export type PeaceDOpcProfileOrgMemberMutationResult =
  | { status: 'ok' }
  | { status: 'unconfigured' | 'reconnect-required' | 'forbidden' | 'not-found' }
  | { status: 'conflict'; reason: PeaceDOpcOrgInviteConflictReason }
  | { status: 'invalid'; reason: PeaceDOpcOrgMutationInvalidReason }
  | { status: 'failed'; error: string }

export function createDefaultLocalOrcaProfile(now: number): PeaceDOpcProfileSummary {
  return {
    id: DEFAULT_LOCAL_ORCA_PROFILE_ID,
    name: DEFAULT_LOCAL_ORCA_PROFILE_NAME,
    avatar: { kind: 'initials', initials: 'P', color: 'neutral' },
    kind: 'local',
    createdAt: now,
    updatedAt: now,
    lastOpenedAt: now
  }
}

function profilePartitionHash(value: string): string {
  let hash = 2166136261
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

export function getOrcaProfileBrowserPartitionSegment(profileId: string): string {
  const safe = profileId.replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 48) || 'profile'
  return `${safe}-${profilePartitionHash(profileId)}`
}

export function getOrcaProfileBrowserDefaultPartition(profileId: string): string {
  if (profileId === DEFAULT_LOCAL_ORCA_PROFILE_ID) {
    return ORCA_BROWSER_PARTITION
  }
  return `persist:orca-profile-${getOrcaProfileBrowserPartitionSegment(profileId)}-browser-default`
}

export function getOrcaProfileBrowserSessionPartition(
  profileId: string,
  browserSessionProfileId: string
): string {
  if (profileId === DEFAULT_LOCAL_ORCA_PROFILE_ID) {
    return `${LEGACY_ORCA_BROWSER_SESSION_PARTITION_PREFIX}${browserSessionProfileId}`
  }
  return `persist:orca-profile-${getOrcaProfileBrowserPartitionSegment(
    profileId
  )}-browser-session-${browserSessionProfileId}`
}
