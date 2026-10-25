export const APP_ICON_OPTIONS = [
  { id: 'classic', label: 'Classic PeaceD OPC' },
  { id: 'watercolor', label: 'Watercolor PeaceD OPC' },
  { id: 'blue', label: 'Blue PeaceD OPC' }
] as const

export type AppIconId = (typeof APP_ICON_OPTIONS)[number]['id']

export const DEFAULT_APP_ICON_ID: AppIconId = 'classic'

export function normalizeAppIconId(value: unknown): AppIconId {
  return APP_ICON_OPTIONS.some((option) => option.id === value)
    ? (value as AppIconId)
    : DEFAULT_APP_ICON_ID
}
