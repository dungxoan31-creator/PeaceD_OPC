import { useCallback, useMemo } from 'react'

const EN_STRINGS: Record<string, string> = {
  'app.page.org': 'Org',
  'org.createdToast': 'Organization created: {name}',
  'org.customOrg': 'Custom Organization',
  'org.corporateCompany': 'Corporate Company',
  'org.kind.saved': 'Custom Architecture',
  'org.kind.corporate': 'Builtin Standard',
  'org.state.editableSaved': 'Editable (Saved Snapshot)',
  'org.state.editableDraft': 'Editable (Draft)',
  'org.state.readOnly': 'Read-Only',
  'common.ready': 'ready',
  'common.active': 'active',
  'common.idle': 'idle',
  'common.autoSaved': 'Auto-saved',
  'org.architectureApplied': 'Architecture applied successfully',
  'org.loading': 'Loading organization...',
  'org.company': 'Company',
  'org.organization': 'Organization',
  'org.corporate': 'Corporate Standard',
  'org.newOrganization': '+ New Organization...',
  'org.roles': 'roles',
  'org.employees': 'employees',
  'org.runtimeTeams': 'runtime teams',
  'org.tab.team': 'Team',
  'org.tab.runtime': 'Runtime',
  'org.tab.architecture': 'Architecture',
  'org.tab.employees': 'Employees',
}

export function useI18n() {
  const t = useCallback((key: string, params?: Record<string, string | number>) => {
    let template = EN_STRINGS[key] ?? key
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        template = template.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
      }
    }
    return template
  }, [])

  return useMemo(() => ({ t, locale: 'en' }), [t])
}

