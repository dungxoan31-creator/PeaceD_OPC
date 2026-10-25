import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import type {
  OrgInfoPayload,
  OrgRole,
  TalentTemplate,
  EmployeeDetailPayload,
  ReorgProposalInfo,
  ArchitecturePresetDetail,
  InteractionReplyReceipt,
  RoleId,
  TemplateId
} from './types'
import {
  INITIAL_ORG_PAYLOAD,
  ARCHITECTURE_PRESETS,
  ARCHITECTURE_PRESET_DETAILS,
  TALENT_TEMPLATES,
  REORG_PROPOSALS
} from './default-data'
import {
  applyPresetToOrg,
  addRoleToOrg,
  bulkAddRolesToOrg,
  updateRoleInOrg,
  deleteRoleFromOrg,
  hireTalentToRole
} from './org-role-mutations'
import { useOrgConfigIO } from './useOrgConfigIO'
import { useOrgSavedSnapshots } from './useOrgSavedSnapshots'
import { payloadToOrgConfig, orgConfigToPayload } from '../../../../shared/org-config'

export function useOrgLocalState(worktreeRoot: string | null = null) {
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>(() =>
    worktreeRoot ? 'loading' : 'ready'
  )
  const [isDirty, setIsDirty] = useState(false)
  const [data, setData] = useState<OrgInfoPayload>(INITIAL_ORG_PAYLOAD)
  const dataRef = useRef(data)
  dataRef.current = data
  const lastSavedRef = useRef<OrgInfoPayload | null>(null)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [reloadNonce, setReloadNonce] = useState(0)
  const [talents] = useState<TalentTemplate[]>(TALENT_TEMPLATES)
  const [employeeDetail, setEmployeeDetail] = useState<EmployeeDetailPayload | null>(null)
  const [reorgProposals, setReorgProposals] = useState<ReorgProposalInfo[]>(REORG_PROPOSALS)
  const [hiringTemplateId, setHiringTemplateId] = useState<string | null>(null)

  const marketPresets = useMemo(() => ARCHITECTURE_PRESETS, [])
  const [marketPreviewData, setMarketPreviewData] = useState<ArchitecturePresetDetail | null>(null)

  const snapshots = useOrgSavedSnapshots(data, setData)
  const { setActiveSavedOrg, setActiveSavedOrgVersionAtLoad } = snapshots
  const configIO = useOrgConfigIO(data, setData)

  useEffect(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
      saveTimerRef.current = null
    }
    if (!worktreeRoot) {
      setData(INITIAL_ORG_PAYLOAD)
      lastSavedRef.current = INITIAL_ORG_PAYLOAD
      setIsDirty(false)
      setLoadState('ready')
      return
    }
    let cancelled = false
    setLoadState('loading')
    window.api.org
      .readConfig(worktreeRoot)
      .then((config) => {
        if (cancelled) {
          return
        }
        const payload = config ? orgConfigToPayload(config) : INITIAL_ORG_PAYLOAD
        setData(payload)
        lastSavedRef.current = payload
        setIsDirty(false)
        setLoadState('ready')
      })
      .catch(() => {
        if (cancelled) {
          return
        }
        setLoadState('error')
      })
    return () => {
      cancelled = true
    }
  }, [worktreeRoot, reloadNonce])

  const debouncedSave = useCallback(
    (next: OrgInfoPayload) => {
      if (!worktreeRoot) {
        return
      }
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
      }
      saveTimerRef.current = setTimeout(() => {
        window.api.org
          .writeConfig(worktreeRoot, payloadToOrgConfig(next))
          .then(() => {
            lastSavedRef.current = next
            setIsDirty(false)
          })
          .catch(() => {
            // Keep isDirty=true so user can retry via Save
          })
      }, 500)
    },
    [worktreeRoot]
  )

  const flushSave = useCallback((): Promise<void> => {
    if (!worktreeRoot) {
      return Promise.resolve()
    }
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
    }
    return window.api.org.writeConfig(worktreeRoot, payloadToOrgConfig(data)).then(() => {
      lastSavedRef.current = data
      setIsDirty(false)
    })
  }, [worktreeRoot, data])

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
      }
    }
  }, [])

  const mutateData = useCallback(
    (updater: (prev: OrgInfoPayload) => OrgInfoPayload) => {
      const next = updater(dataRef.current)
      setData(next)
      setIsDirty(true)
      debouncedSave(next)
    },
    [debouncedSave]
  )

  const onRequestData = useCallback(() => setReloadNonce((n) => n + 1), [])
  const onRequestTalents = useCallback(() => {}, [])

  const onRequestEmployeeDetail = useCallback(
    (employeeId: string) => {
      const emp = data.employees.find((e) => e.employee_id === employeeId)
      if (emp) {
        setEmployeeDetail({
          ...emp,
          delta_context: 'Full system authorization granted.',
          profile: {
            title: emp.seniority,
            bio: `${emp.name} is an active agent assigned to role ${emp.role_id}.`
          }
        })
      }
    },
    [data.employees]
  )

  const onHireTalent = useCallback(
    (templateId: TemplateId, roleId: RoleId) => {
      const template = talents.find((t) => t.template_id === templateId)
      if (!template) {
        return
      }
      setHiringTemplateId(templateId)
      setTimeout(() => {
        mutateData((prev) => hireTalentToRole(template, roleId, prev))
        setHiringTemplateId(null)
      }, 400)
    },
    [talents, mutateData]
  )

  const onRequestReorgList = useCallback(() => {}, [])

  const onReorgDecide = useCallback(
    async (
      proposal: ReorgProposalInfo,
      approved: boolean,
      notes?: string
    ): Promise<InteractionReplyReceipt> => {
      const status = approved ? 'approved' : 'rejected'
      setReorgProposals((prev) =>
        prev.map((p) => (p.proposal_id === proposal.proposal_id ? { ...p, status } : p))
      )
      return { ok: true, accepted: approved, status, reason: notes }
    },
    []
  )

  const onMarketBrowse = useCallback(() => {}, [])
  const onMarketPreview = useCallback((presetId: string) => {
    const detail = ARCHITECTURE_PRESET_DETAILS[presetId]
    if (detail) {
      setMarketPreviewData(detail)
    }
  }, [])
  const onMarketClearPreview = useCallback(() => {
    setMarketPreviewData(null)
  }, [])

  const onMarketApplyPreset = useCallback(
    (presetId: string, strategy: string) => {
      const detail = ARCHITECTURE_PRESET_DETAILS[presetId]
      if (!detail) {
        return
      }
      mutateData((prev) => applyPresetToOrg(presetId, strategy, detail, prev))
      setActiveSavedOrg(detail.name)
    },
    [mutateData, setActiveSavedOrg]
  )

  const onAddRole = useCallback(
    (
      roleId: string,
      name: string,
      responsibility: string,
      reportsTo: string,
      icon?: string | null
    ) => mutateData((prev) => addRoleToOrg(roleId, name, responsibility, reportsTo, icon, prev)),
    [mutateData]
  )

  const onBulkAddRoles = useCallback(
    (roles: { role_id: string; name: string; responsibility: string; reports_to: string }[]) =>
      mutateData((prev) => bulkAddRolesToOrg(roles, prev)),
    [mutateData]
  )

  const onUpdateRole = useCallback(
    (roleId: string, updates: Partial<OrgRole>) =>
      mutateData((prev) => updateRoleInOrg(roleId, updates, prev)),
    [mutateData]
  )

  const onDeleteRole = useCallback(
    (roleId: string) => mutateData((prev) => deleteRoleFromOrg(roleId, prev)),
    [mutateData]
  )

  const onUpdateOrgStrategy = useCallback(
    (strategy: { final_decider_role_id?: string | null }) =>
      mutateData((prev) => ({
        ...prev,
        final_decider_role_id: strategy.final_decider_role_id,
        org_version: prev.org_version + 1
      })),
    [mutateData]
  )

  const onUpdateRuntimePolicy = useCallback(
    (policy: Record<string, unknown>) =>
      mutateData((prev) => ({
        ...prev,
        runtime_policy: { ...prev.runtime_policy, ...policy },
        org_version: prev.org_version + 1
      })),
    [mutateData]
  )

  const onResetArchitecture = useCallback(() => {
    setData(INITIAL_ORG_PAYLOAD)
    setIsDirty(false)
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
    }
    setActiveSavedOrg(null)
    setActiveSavedOrgVersionAtLoad(null)
    if (worktreeRoot) {
      debouncedSave(INITIAL_ORG_PAYLOAD)
    }
  }, [worktreeRoot, debouncedSave, setActiveSavedOrg, setActiveSavedOrgVersionAtLoad])

  const onSelectCorporate = onResetArchitecture
  const isCustomMode = data.company_profile === 'custom' || snapshots.activeSavedOrg !== null

  return {
    ...snapshots,
    ...configIO,
    data,
    loadState,
    isDirty,
    flushSave,
    talents,
    employeeDetail,
    reorgProposals,
    isCustomMode,
    hiringTemplateId,
    marketPresets,
    marketPreviewData,
    onRequestData,
    onRequestTalents,
    onRequestEmployeeDetail,
    onHireTalent,
    onRequestReorgList,
    onReorgDecide,
    onMarketBrowse,
    onMarketPreview,
    onMarketApplyPreset,
    onMarketClearPreview,
    onSelectCorporate,
    onAddRole,
    onBulkAddRoles,
    onUpdateRole,
    onDeleteRole,
    onUpdateOrgStrategy,
    onUpdateRuntimePolicy,
    onResetArchitecture
  }
}
