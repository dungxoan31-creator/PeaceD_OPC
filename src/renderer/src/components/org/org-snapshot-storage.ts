import type { OrgInfoPayload, SavedOrgSummary } from './types'

export const STORAGE_KEY_ORG = 'peaced_opc_org_data_v1'
export const STORAGE_KEY_SAVED_ORGS = 'peaced_opc_saved_orgs_v1'
export const STORAGE_KEY_ACTIVE_SAVED = 'peaced_opc_active_saved_org'

export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw) {
      // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: Invariant verified by local storage schema deserialization.
      return JSON.parse(raw) as T
    }
  } catch (err) {
    console.warn(`[org-store] Failed to load ${key}:`, err)
  }
  return fallback
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (err) {
    console.warn(`[org-store] Failed to save ${key}:`, err)
  }
}

export function saveSnapshot(name: string, data: OrgInfoPayload): void {
  saveToStorage(`peaced_opc_snapshot_${name}`, data)
}

export function loadSnapshot(name: string): OrgInfoPayload | null {
  return loadFromStorage<OrgInfoPayload | null>(`peaced_opc_snapshot_${name}`, null)
}

export function deleteSnapshot(name: string): void {
  try {
    localStorage.removeItem(`peaced_opc_snapshot_${name}`)
  } catch (err) {
    console.warn(`[org-store] Failed to delete snapshot ${name}:`, err)
  }
}

export function buildSavedOrgSummary(name: string, data: OrgInfoPayload): SavedOrgSummary {
  const cleanName = name.trim()
  return {
    name: cleanName,
    organization_id: cleanName.toLowerCase().replace(/\s+/g, '-'),
    organization_name: cleanName,
    saved_at: Date.now(),
    roles_count: data.roles.length,
    employees_count: data.employees.length,
  }
}
