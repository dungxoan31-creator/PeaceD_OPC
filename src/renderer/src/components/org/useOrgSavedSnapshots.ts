import { useState, useEffect, useCallback } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type {
  OrgInfoPayload,
  SavedOrgSummary,
  OrgCreateMemberInput,
  OrgSavedCreatePayload,
} from './types'
import { INITIAL_ORG_PAYLOAD } from './default-data'
import {
  STORAGE_KEY_SAVED_ORGS,
  STORAGE_KEY_ACTIVE_SAVED,
  loadFromStorage,
  saveToStorage,
  saveSnapshot,
  loadSnapshot,
  deleteSnapshot,
  buildSavedOrgSummary,
} from './org-snapshot-storage'
import { createOrgFromWizard } from './org-wizard-creator'

export function useOrgSavedSnapshots(
  data: OrgInfoPayload,
  setData: Dispatch<SetStateAction<OrgInfoPayload>>
) {
  const [savedOrgsList, setSavedOrgsList] = useState<SavedOrgSummary[]>(() =>
    loadFromStorage<SavedOrgSummary[]>(STORAGE_KEY_SAVED_ORGS, [])
  )
  const [activeSavedOrg, setActiveSavedOrg] = useState<string | null>(() =>
    loadFromStorage<string | null>(STORAGE_KEY_ACTIVE_SAVED, null)
  )
  const [activeSavedOrgVersionAtLoad, setActiveSavedOrgVersionAtLoad] = useState<number | null>(null)

  const [orgCreatePending, setOrgCreatePending] = useState(false)
  const [orgCreateResult, setOrgCreateResult] = useState<(OrgSavedCreatePayload & { nonce: number }) | null>(null)

  useEffect(() => {
    saveToStorage(STORAGE_KEY_SAVED_ORGS, savedOrgsList)
  }, [savedOrgsList])

  useEffect(() => {
    saveToStorage(STORAGE_KEY_ACTIVE_SAVED, activeSavedOrg)
  }, [activeSavedOrg])

  const onSavedOrgSaveAs = useCallback(
    (name: string, overwrite: boolean) => {
      const cleanName = name.trim()
      if (!cleanName) {
        return
      }
      const existing = savedOrgsList.some((s) => s.name.toLowerCase() === cleanName.toLowerCase())
      if (existing && !overwrite) {
        return
      }
      const summary = buildSavedOrgSummary(cleanName, data)
      saveSnapshot(cleanName, data)
      setSavedOrgsList((prev) => [summary, ...prev.filter((s) => s.name.toLowerCase() !== cleanName.toLowerCase())])
      setActiveSavedOrg(cleanName)
      setActiveSavedOrgVersionAtLoad(data.org_version)
    },
    [data, savedOrgsList]
  )

  const onSavedOrgLoad = useCallback(
    (name: string) => {
      const snapshot = loadSnapshot(name)
      if (snapshot) {
        setData(snapshot)
        setActiveSavedOrg(name)
        setActiveSavedOrgVersionAtLoad(snapshot.org_version)
      }
    },
    [setData]
  )

  const onSavedOrgDelete = useCallback((name: string) => {
    deleteSnapshot(name)
    setSavedOrgsList((prev) => prev.filter((s) => s.name !== name))
    setActiveSavedOrg((curr) => (curr === name ? null : curr))
  }, [])

  const onSavedOrgCreate = useCallback(
    (organizationName: string, members: OrgCreateMemberInput[]) => {
      setOrgCreatePending(true)
      const cleanName = organizationName.trim()
      const newOrgPayload = createOrgFromWizard(cleanName, members, INITIAL_ORG_PAYLOAD)

      setData(newOrgPayload)
      setActiveSavedOrg(cleanName)
      setActiveSavedOrgVersionAtLoad(1)

      const summary = buildSavedOrgSummary(cleanName, newOrgPayload)
      saveSnapshot(cleanName, newOrgPayload)
      setSavedOrgsList((prev) => [summary, ...prev.filter((s) => s.name !== cleanName)])

      setOrgCreatePending(false)
      setOrgCreateResult({
        ok: true,
        name: cleanName,
        organization_id: newOrgPayload.organization_id,
        organization_name: cleanName,
        roles_count: newOrgPayload.roles.length,
        employees_count: newOrgPayload.employees.length,
        nonce: Date.now(),
      })
    },
    [setData]
  )

  return {
    savedOrgsList,
    activeSavedOrg,
    setActiveSavedOrg,
    activeSavedOrgVersionAtLoad,
    setActiveSavedOrgVersionAtLoad,
    orgCreatePending,
    orgCreateResult,
    onSavedOrgSaveAs,
    onSavedOrgLoad,
    onSavedOrgDelete,
    onSavedOrgCreate,
  }
}
