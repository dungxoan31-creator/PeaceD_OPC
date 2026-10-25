import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { TopLevelView } from '../../../../shared/ui-chrome-types'

export const MAIN_CSS_PATH = resolve(process.cwd(), 'src/renderer/src/assets/main.css')
export const TRONG_DONG_SVG_PATH = resolve(process.cwd(), 'src/renderer/src/assets/trong-dong.svg')
export const TRONG_DONG_BORDER_SVG_PATH = resolve(
  process.cwd(),
  'src/renderer/src/assets/trong-dong-border.svg'
)

export const CORE_TOP_LEVEL_VIEWS: readonly TopLevelView[] = [
  'terminal',
  'settings',
  'tasks',
  'activity',
  'automations',
  'space',
  'skills',
  'artifacts',
  'mobile',
  'org'
] as const

export const CANONICAL_BILINGUAL_STRINGS = [
  'Không gian làm việc // Workspace',
  'Khoang điều khiển // Navigation Dock',
  'Thanh lệnh ngữ cảnh // Command Bar',
  'Viên nang trạng thái // Telemetry Capsule',
  'Ngăn quan sát // Inspector',
  'Trạm lệnh // Terminal',
  'Bàn tròn // Org Studio',
  'Tiến trình tự động // Automations',
  'Kho đĩa // Disk Space'
] as const

export const COMMAND_LIFECYCLE_STATES = [
  'idle',
  'queued',
  'executing',
  'streaming',
  'completed',
  'error'
] as const

export type CommandLifecycleState = (typeof COMMAND_LIFECYCLE_STATES)[number]

export const BILINGUAL_LABEL_REGEX = /^[^\n/]+ \/\/ [^\n/]+$/

export function readMainCss(): string {
  if (!existsSync(MAIN_CSS_PATH)) {
    throw new Error(`main.css not found at: ${MAIN_CSS_PATH}`)
  }
  return readFileSync(MAIN_CSS_PATH, 'utf8')
}

export function parseCssVariables(css: string, selector: string): Map<string, string> {
  const vars = new Map<string, string>()
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`${escaped}\\s*\\{([^}]+)\\}`, 'g')
  let match = regex.exec(css)
  while (match !== null) {
    const blockContent = match[1]
    const varLines = blockContent.split(';')
    for (const line of varLines) {
      const trimmed = line.trim()
      if (trimmed.startsWith('--')) {
        const colonIdx = trimmed.indexOf(':')
        if (colonIdx > 0) {
          const varName = trimmed.slice(0, colonIdx).trim()
          const varVal = trimmed.slice(colonIdx + 1).trim()
          vars.set(varName, varVal)
        }
      }
    }
    match = regex.exec(css)
  }
  return vars
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleaned = hex.trim().replace(/^#/, '')
  if (cleaned.length === 3) {
    return {
      r: Number.parseInt(cleaned[0] + cleaned[0], 16),
      g: Number.parseInt(cleaned[1] + cleaned[1], 16),
      b: Number.parseInt(cleaned[2] + cleaned[2], 16)
    }
  }
  if (cleaned.length === 6) {
    return {
      r: Number.parseInt(cleaned.slice(0, 2), 16),
      g: Number.parseInt(cleaned.slice(2, 4), 16),
      b: Number.parseInt(cleaned.slice(4, 6), 16)
    }
  }
  return null
}

export function calculateLuminance(hex: string): number {
  const rgb = hexToRgb(hex)
  if (!rgb) {
    return 0
  }
  const transform = (c: number): number => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * transform(rgb.r) + 0.7152 * transform(rgb.g) + 0.0722 * transform(rgb.b)
}

export function calculateContrastRatio(hex1: string, hex2: string): number {
  const lum1 = calculateLuminance(hex1)
  const lum2 = calculateLuminance(hex2)
  const brighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)
  return (brighter + 0.05) / (darker + 0.05)
}

class MockMediaQueryListEvent extends Event implements MediaQueryListEvent {
  readonly matches: boolean
  readonly media: string
  constructor(media: string, matches: boolean) {
    super('change')
    this.media = media
    this.matches = matches
  }
}

class MockMediaQueryList extends EventTarget implements MediaQueryList {
  matches: boolean
  readonly media: string
  onchange: ((this: MediaQueryList, ev: MediaQueryListEvent) => void) | null = null

  constructor(media: string, matches: boolean) {
    super()
    this.media = media
    this.matches = matches
  }

  addListener(listener: (this: MediaQueryList, ev: MediaQueryListEvent) => void): void {
    // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: EventListener callback adapter
    this.addEventListener('change', listener as EventListener)
  }

  removeListener(listener: (this: MediaQueryList, ev: MediaQueryListEvent) => void): void {
    // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: EventListener callback adapter
    this.removeEventListener('change', listener as EventListener)
  }
}

export function createMockMatchMedia(initialMatches: boolean): {
  matchMedia: (query: string) => MediaQueryList
  setMatches: (matches: boolean) => void
} {
  let matches = initialMatches
  const instances = new Set<MockMediaQueryList>()

  const matchMedia = (query: string): MediaQueryList => {
    const instance = new MockMediaQueryList(query, matches)
    instances.add(instance)
    return instance
  }

  const setMatches = (next: boolean): void => {
    matches = next
    const event = new MockMediaQueryListEvent('(prefers-reduced-motion: reduce)', next)
    for (const instance of instances) {
      instance.matches = next
      instance.dispatchEvent(event)
      if (typeof instance.onchange === 'function') {
        instance.onchange(event)
      }
    }
  }

  return { matchMedia, setMatches }
}

export function createTestDomContainer(): { container: HTMLDivElement; cleanup: () => void } {
  const container = document.createElement('div')
  document.body.appendChild(container)
  return {
    container,
    cleanup: () => {
      container.remove()
    }
  }
}
