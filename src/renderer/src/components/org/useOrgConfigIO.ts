import { useState, useCallback } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { OrgInfoPayload, OrgRole } from './types'
import { serializeOrgToYaml, parseYamlToRoles } from './org-yaml-serialization'

export function useOrgConfigIO(
  data: OrgInfoPayload,
  setData: Dispatch<SetStateAction<OrgInfoPayload>>
) {
  const [configExportYaml, setConfigExportYaml] = useState<string | null>(null)
  const [configImportPreview, setConfigImportPreview] = useState<{
    roles_added: number
    roles_removed: number
    employees_changed: number
  } | null>(null)
  const [configImportError, setConfigImportError] = useState<string | null>(null)

  const onConfigExport = useCallback(() => {
    setConfigExportYaml(serializeOrgToYaml(data))
  }, [data])

  const onConfigImport = useCallback(
    (yamlStr: string, dryRun: boolean) => {
      setConfigImportError(null)
      try {
        const parsed = parseYamlToRoles(yamlStr)
        if (parsed.length === 0) {
          setConfigImportError('No valid roles found in the provided YAML.')
          return
        }
        const existingRoleIds = new Set(data.roles.map((r) => r.role_id))
        const importedRoleIds = new Set(parsed.map((r) => r.role_id!))
        let rolesAdded = 0
        let rolesRemoved = 0
        for (const id of importedRoleIds) {
          if (!existingRoleIds.has(id)) {
            rolesAdded++
          }
        }
        for (const id of existingRoleIds) {
          if (!importedRoleIds.has(id)) {
            rolesRemoved++
          }
        }
        setConfigImportPreview({
          roles_added: rolesAdded,
          roles_removed: rolesRemoved,
          employees_changed: rolesAdded + rolesRemoved,
        })
        if (!dryRun) {
          const finalRoles: OrgRole[] = parsed.map((p) => ({
            role_id: p.role_id!,
            name: p.name || p.role_id!,
            responsibility: p.responsibility || 'Operational scope',
            reports_to: p.reports_to || 'owner',
            status: 'active',
            icon: p.icon || 'code',
            can_spawn: p.can_spawn || [],
            tools: [],
            preferred_external_agent: p.preferred_external_agent || null,
          }))
          setData((prev) => ({
            ...prev,
            roles: finalRoles,
            org_version: prev.org_version + 1,
          }))
        }
      } catch (err) {
        setConfigImportError(err instanceof Error ? err.message : 'Failed to parse YAML configuration')
      }
    },
    [data.roles, setData]
  )

  return {
    configExportYaml,
    configImportPreview,
    configImportError,
    onConfigExport,
    onConfigImport,
  }
}
