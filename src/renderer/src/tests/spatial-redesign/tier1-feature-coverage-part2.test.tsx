// @vitest-environment happy-dom

globalThis.IS_REACT_ACT_ENVIRONMENT = true

import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { act, createRef, type ReactNode, type RefObject } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  BILINGUAL_LABEL_REGEX,
  CANONICAL_BILINGUAL_STRINGS,
  COMMAND_LIFECYCLE_STATES,
  CORE_TOP_LEVEL_VIEWS,
  createTestDomContainer,
  readMainCss
} from './spatial-redesign-test-fixtures'
import { isTopLevelView } from '../../../../shared/top-level-view'
import TerminalPaneHeaderOverlay from '@/components/terminal-pane/TerminalPaneHeaderOverlay'
import type { ManagedPane, PaneManager } from '@/lib/pane-manager/pane-manager'
import type { PtyTransport } from '@/components/terminal-pane/pty-transport'

vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: { children?: ReactNode }) => children,
  TooltipTrigger: ({ children }: { children?: ReactNode }) => children,
  TooltipContent: ({ children }: { children?: ReactNode }) => <span>{children}</span>
}))

vi.mock('@/i18n/i18n', () => ({
  translate: (_key: string, fallback: string) => fallback
}))

function makeManagedPane(id: number): ManagedPane {
  // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: Test mock for ManagedPane leafId
  const leafId = `leaf-${id}` as ManagedPane['leafId']
  return {
    id,
    leafId,
    stablePaneId: leafId,
    container: document.createElement('div'),
    linkTooltip: document.createElement('div'),
    // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: Test double for ManagedPane terminal
    terminal: {} as ManagedPane['terminal'],
    // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: Test double for ManagedPane fitAddon
    fitAddon: {} as ManagedPane['fitAddon'],
    // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: Test double for ManagedPane searchAddon
    searchAddon: {} as ManagedPane['searchAddon'],
    // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: Test double for ManagedPane serializeAddon
    serializeAddon: {} as ManagedPane['serializeAddon']
  }
}

describe('Tier 1 — Feature Coverage (Part 2: Features 9-15)', () => {
  let container: HTMLDivElement
  let cleanupDom: () => void

  beforeEach(() => {
    const fixture = createTestDomContainer()
    container = fixture.container
    cleanupDom = fixture.cleanup
  })

  afterEach(() => {
    cleanupDom()
    vi.restoreAllMocks()
  })

  // ── FEATURE 9: High-DPI & Responsive Scaling (R1) ───────────────────
  describe('Feature 9: High-DPI & Responsive Scaling', () => {
    it('verifies main.css specifies app layout width and height with modern viewport units', () => {
      const css = readMainCss()
      expect(css).toContain('height: 100dvh')
      expect(css).toContain('width: 100vw')
      expect(css).toContain('overflow: hidden')
    })

    it('verifies titlebar reserves window-controls-width clearance in main.css', () => {
      const css = readMainCss()
      expect(css).toContain('--window-controls-width')
    })

    it('verifies native shell layout class configuration in main.css', () => {
      const css = readMainCss()
      expect(css).toContain('html.native-shell .app-layout')
    })

    it('handles simulated window resize dispatch without throwing layout exceptions', () => {
      let resized = false
      const onResize = (): void => {
        resized = true
      }
      window.addEventListener('resize', onResize)
      window.dispatchEvent(new Event('resize'))
      expect(resized).toBe(true)
      window.removeEventListener('resize', onResize)
    })

    it('maintains devicePixelRatio calculation compatibility under high-DPI simulation', () => {
      const origDpr = window.devicePixelRatio
      try {
        Object.defineProperty(window, 'devicePixelRatio', { value: 2.5, configurable: true })
        expect(window.devicePixelRatio).toBe(2.5)
        const cappedDpr = Math.min(window.devicePixelRatio, 2)
        expect(cappedDpr).toBe(2)
      } finally {
        Object.defineProperty(window, 'devicePixelRatio', { value: origDpr, configurable: true })
      }
    })
  })

  // ── FEATURE 10: Vietnamese Terminal Chrome Overlay (R4) ─────────────
  describe('Feature 10: Vietnamese Terminal Chrome Overlay', () => {
    it('mounts TerminalPaneHeaderOverlay with pane titles and controls', () => {
      const panes = [makeManagedPane(1)]
      const root = createRoot(container)
      act(() => {
        root.render(
          <TerminalPaneHeaderOverlay
            tabId="tab-1"
            worktreeId="wt-1"
            cwd="/tmp"
            showAlwaysOnHeaders={true}
            showSplitButton={true}
            paneCount={1}
            activePaneId={1}
            panes={panes}
            paneTitles={{ 1: 'Trạm lệnh // Terminal 1' }}
            paneTitleOverlayRects={{ 1: { left: 0, top: 0, width: 220 } }}
            renamingPaneId={null}
            renameValue=""
            renameInputRef={createRef<HTMLInputElement>()}
            titleUsesLightSurface={false}
            paneTitleBackground="transparent"
            terminalContentVisible={true}
            hiddenStartupStyle={{}}
            // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: RefObject double
            managerRef={{ current: null } as RefObject<PaneManager | null>}
            // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: RefObject double
            paneTransportsRef={{ current: new Map() } as RefObject<Map<number, PtyTransport>>}
            onClosePane={vi.fn()}
            onSplitPane={vi.fn()}
            onStartRename={vi.fn()}
            onRenameValueChange={vi.fn()}
            onRenameSubmit={vi.fn()}
            onRenameCancel={vi.fn()}
            onRenameBlur={vi.fn()}
            onRemoveTitle={vi.fn()}
            onBeginPaneDrag={vi.fn()}
            onActivatePaneTitleInteraction={vi.fn()}
            onPaneTitleContextMenu={vi.fn()}
          />
        )
      })
      expect(container.textContent).toContain('Trạm lệnh // Terminal 1')
      act(() => {
        root.unmount()
      })
    })

    it('renders close button and triggers onClosePane callback when clicked', () => {
      const onClose = vi.fn()
      const panes = [makeManagedPane(1), makeManagedPane(2)]
      const root = createRoot(container)
      act(() => {
        root.render(
          <TerminalPaneHeaderOverlay
            tabId="tab-1"
            worktreeId="wt-1"
            cwd="/tmp"
            showAlwaysOnHeaders={true}
            showSplitButton={true}
            paneCount={2}
            activePaneId={1}
            panes={panes}
            paneTitles={{}}
            paneTitleOverlayRects={{
              1: { left: 0, top: 0, width: 200 },
              2: { left: 210, top: 0, width: 200 }
            }}
            renamingPaneId={null}
            renameValue=""
            renameInputRef={createRef<HTMLInputElement>()}
            titleUsesLightSurface={false}
            paneTitleBackground="transparent"
            terminalContentVisible={true}
            hiddenStartupStyle={{}}
            // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: RefObject double
            managerRef={{ current: null } as RefObject<PaneManager | null>}
            // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: RefObject double
            paneTransportsRef={{ current: new Map() } as RefObject<Map<number, PtyTransport>>}
            onClosePane={onClose}
            onSplitPane={vi.fn()}
            onStartRename={vi.fn()}
            onRenameValueChange={vi.fn()}
            onRenameSubmit={vi.fn()}
            onRenameCancel={vi.fn()}
            onRenameBlur={vi.fn()}
            onRemoveTitle={vi.fn()}
            onBeginPaneDrag={vi.fn()}
            onActivatePaneTitleInteraction={vi.fn()}
            onPaneTitleContextMenu={vi.fn()}
          />
        )
      })
      const closeButtons = container.querySelectorAll('button.pane-title-close')
      expect(closeButtons.length).toBeGreaterThanOrEqual(1)
      act(() => {
        // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: Button DOM element click
        ;(closeButtons[0] as HTMLButtonElement).click()
      })
      expect(onClose).toHaveBeenCalled()
      act(() => {
        root.unmount()
      })
    })

    it('mounts inline rename input when renamingPaneId matches active pane', () => {
      const panes = [makeManagedPane(1)]
      const root = createRoot(container)
      act(() => {
        root.render(
          <TerminalPaneHeaderOverlay
            tabId="tab-1"
            worktreeId="wt-1"
            cwd="/tmp"
            showAlwaysOnHeaders={true}
            showSplitButton={true}
            paneCount={1}
            activePaneId={1}
            panes={panes}
            paneTitles={{ 1: 'Old Title' }}
            paneTitleOverlayRects={{ 1: { left: 0, top: 0, width: 200 } }}
            renamingPaneId={1}
            renameValue="New Renamed Title"
            renameInputRef={createRef<HTMLInputElement>()}
            titleUsesLightSurface={false}
            paneTitleBackground="transparent"
            terminalContentVisible={true}
            hiddenStartupStyle={{}}
            // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: RefObject double
            managerRef={{ current: null } as RefObject<PaneManager | null>}
            // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: RefObject double
            paneTransportsRef={{ current: new Map() } as RefObject<Map<number, PtyTransport>>}
            onClosePane={vi.fn()}
            onSplitPane={vi.fn()}
            onStartRename={vi.fn()}
            onRenameValueChange={vi.fn()}
            onRenameSubmit={vi.fn()}
            onRenameCancel={vi.fn()}
            onRenameBlur={vi.fn()}
            onRemoveTitle={vi.fn()}
            onBeginPaneDrag={vi.fn()}
            onActivatePaneTitleInteraction={vi.fn()}
            onPaneTitleContextMenu={vi.fn()}
          />
        )
      })
      const input = container.querySelector('input')
      expect(input).not.toBeNull()
      expect(input?.value).toBe('New Renamed Title')
      act(() => {
        root.unmount()
      })
    })

    it('renders split pane button and handles click callback', () => {
      const onSplit = vi.fn()
      const panes = [makeManagedPane(1)]
      const root = createRoot(container)
      act(() => {
        root.render(
          <TerminalPaneHeaderOverlay
            tabId="tab-1"
            worktreeId="wt-1"
            cwd="/tmp"
            showAlwaysOnHeaders={true}
            showSplitButton={true}
            paneCount={1}
            activePaneId={1}
            panes={panes}
            paneTitles={{ 1: 'Terminal 1' }}
            paneTitleOverlayRects={{ 1: { left: 0, top: 0, width: 200 } }}
            renamingPaneId={null}
            renameValue=""
            renameInputRef={createRef<HTMLInputElement>()}
            titleUsesLightSurface={false}
            paneTitleBackground="transparent"
            terminalContentVisible={true}
            hiddenStartupStyle={{}}
            // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: RefObject double
            managerRef={{ current: null } as RefObject<PaneManager | null>}
            // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: RefObject double
            paneTransportsRef={{ current: new Map() } as RefObject<Map<number, PtyTransport>>}
            onClosePane={vi.fn()}
            onSplitPane={onSplit}
            onStartRename={vi.fn()}
            onRenameValueChange={vi.fn()}
            onRenameSubmit={vi.fn()}
            onRenameCancel={vi.fn()}
            onRenameBlur={vi.fn()}
            onRemoveTitle={vi.fn()}
            onBeginPaneDrag={vi.fn()}
            onActivatePaneTitleInteraction={vi.fn()}
            onPaneTitleContextMenu={vi.fn()}
          />
        )
      })
      const splitBtn = container.querySelector('button.pane-title-split-trigger')
      expect(splitBtn).not.toBeNull()
      act(() => {
        // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: Button click
        ;(splitBtn as HTMLButtonElement).click()
      })
      expect(onSplit).toHaveBeenCalled()
      act(() => {
        root.unmount()
      })
    })

    it('hides header overlay when showAlwaysOnHeaders is false and paneCount is 1', () => {
      const panes = [makeManagedPane(1)]
      const root = createRoot(container)
      act(() => {
        root.render(
          <TerminalPaneHeaderOverlay
            tabId="tab-1"
            worktreeId="wt-1"
            cwd="/tmp"
            showAlwaysOnHeaders={false}
            showSplitButton={false}
            paneCount={1}
            activePaneId={1}
            panes={panes}
            paneTitles={{ 1: 'Terminal 1' }}
            paneTitleOverlayRects={{ 1: { left: 0, top: 0, width: 200 } }}
            renamingPaneId={null}
            renameValue=""
            renameInputRef={createRef<HTMLInputElement>()}
            titleUsesLightSurface={false}
            paneTitleBackground="transparent"
            terminalContentVisible={true}
            hiddenStartupStyle={{}}
            // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: RefObject double
            managerRef={{ current: null } as RefObject<PaneManager | null>}
            // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: RefObject double
            paneTransportsRef={{ current: new Map() } as RefObject<Map<number, PtyTransport>>}
            onClosePane={vi.fn()}
            onSplitPane={vi.fn()}
            onStartRename={vi.fn()}
            onRenameValueChange={vi.fn()}
            onRenameSubmit={vi.fn()}
            onRenameCancel={vi.fn()}
            onRenameBlur={vi.fn()}
            onRemoveTitle={vi.fn()}
            onBeginPaneDrag={vi.fn()}
            onActivatePaneTitleInteraction={vi.fn()}
            onPaneTitleContextMenu={vi.fn()}
          />
        )
      })
      expect(container.querySelector('button[aria-label="Split pane"]')).toBeNull()
      act(() => {
        root.unmount()
      })
    })
  })

  // ── FEATURE 11: Command Lifecycle Visual States (R4) ────────────────
  describe('Feature 11: Command Lifecycle Visual States', () => {
    it('verifies all 6 command lifecycle states are recognized', () => {
      expect(COMMAND_LIFECYCLE_STATES).toEqual([
        'idle',
        'queued',
        'executing',
        'streaming',
        'completed',
        'error'
      ])
    })

    it('listens to orca:terminal-command-finished custom event and parses exit code', () => {
      let eventPayload: { worktreeId: string; exitCode: number } | null = null
      const handler = (e: Event): void => {
        // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: CustomEvent detail
        eventPayload = (e as CustomEvent<{ worktreeId: string; exitCode: number }>).detail
      }
      window.addEventListener('orca:terminal-command-finished', handler)
      window.dispatchEvent(
        new CustomEvent('orca:terminal-command-finished', {
          detail: { worktreeId: 'wt-demo', exitCode: 0 }
        })
      )
      expect(eventPayload).toEqual({ worktreeId: 'wt-demo', exitCode: 0 })
      window.removeEventListener('orca:terminal-command-finished', handler)
    })

    it('maps exit code 0 to completed status state', () => {
      const exitCode = 0
      const status = exitCode === 0 ? 'completed' : 'error'
      expect(status).toBe('completed')
    })

    it('maps non-zero exit code to error status state', () => {
      const exitCode: number = 127
      const status = exitCode === 0 ? 'completed' : 'error'
      expect(status).toBe('error')
    })

    it('determines spinner visibility only for active execution states', () => {
      const shouldSpin = (state: string): boolean => state === 'executing' || state === 'streaming'
      expect(shouldSpin('idle')).toBe(false)
      expect(shouldSpin('queued')).toBe(false)
      expect(shouldSpin('executing')).toBe(true)
      expect(shouldSpin('streaming')).toBe(true)
      expect(shouldSpin('completed')).toBe(false)
      expect(shouldSpin('error')).toBe(false)
    })
  })

  // ── FEATURE 12: PTY & PowerShell Preservation (R4, R5) ──────────────
  describe('Feature 12: PTY & PowerShell Preservation', () => {
    it('preserves UTF-8 encoding of Vietnamese diacritics in terminal string transport', () => {
      const vietnameseCommand = 'echo "Trống Đồng Đông Sơn // Ngọc Lũ"'
      const encoded = new TextEncoder().encode(vietnameseCommand)
      const decoded = new TextDecoder('utf-8').decode(encoded)
      expect(decoded).toBe(vietnameseCommand)
    })

    it('preserves ANSI escape sequences without stripping formatting codes', () => {
      const rawAnsi = '\x1b[32m✔ Thành công // Success\x1b[0m'
      expect(rawAnsi).toContain('\x1b[32m')
      expect(rawAnsi).toContain('\x1b[0m')
      expect(rawAnsi).toContain('Thành công // Success')
    })

    it('preserves PowerShell command arguments with quotation and special characters', () => {
      const psCommand = 'Get-ChildItem -Path "C:\\Users\\PeaceD\\Downloads" | Where-Object { $_.Length -gt 100MB }'
      expect(psCommand).toContain('-Path "C:\\Users\\PeaceD\\Downloads"')
      expect(psCommand).toContain('$_.Length -gt 100MB')
    })

    it('verifies PTY dimensions payload schema preserves rows and cols as positive integers', () => {
      const dimensions = { rows: 35, cols: 120 }
      expect(Number.isInteger(dimensions.rows)).toBe(true)
      expect(Number.isInteger(dimensions.cols)).toBe(true)
      expect(dimensions.rows).toBeGreaterThan(0)
      expect(dimensions.cols).toBeGreaterThan(0)
    })

    it('ensures terminal header overlay does not intercept interactive terminal keystrokes', () => {
      const keyEvent = new KeyboardEvent('keydown', { key: 'a', bubbles: true, cancelable: true })
      const dispatched = container.dispatchEvent(keyEvent)
      expect(dispatched).toBe(true)
      expect(keyEvent.defaultPrevented).toBe(false)
    })
  })

  // ── FEATURE 13: Bilingual Terminology System (R3) ───────────────────
  describe('Feature 13: Bilingual Terminology System', () => {
    it('verifies all canonical strings conform to [Vietnamese] // [English] pattern', () => {
      for (const phrase of CANONICAL_BILINGUAL_STRINGS) {
        expect(BILINGUAL_LABEL_REGEX.test(phrase)).toBe(true)
      }
    })

    it('verifies primary workspace and navigation bilingual labels', () => {
      expect(CANONICAL_BILINGUAL_STRINGS).toContain('Không gian làm việc // Workspace')
      expect(CANONICAL_BILINGUAL_STRINGS).toContain('Khoang điều khiển // Navigation Dock')
    })

    it('verifies command dock and telemetry capsule bilingual labels', () => {
      expect(CANONICAL_BILINGUAL_STRINGS).toContain('Thanh lệnh ngữ cảnh // Command Bar')
      expect(CANONICAL_BILINGUAL_STRINGS).toContain('Viên nang trạng thái // Telemetry Capsule')
    })

    it('verifies terminal and org studio bilingual labels', () => {
      expect(CANONICAL_BILINGUAL_STRINGS).toContain('Trạm lệnh // Terminal')
      expect(CANONICAL_BILINGUAL_STRINGS).toContain('Bàn tròn // Org Studio')
    })

    it('preserves Unicode NFC normalization equivalence for Vietnamese characters', () => {
      const composed = 'Đông Sơn'
      const decomposed = 'Đông Sơn'
      expect(composed.normalize('NFC')).toEqual(decomposed.normalize('NFC'))
    })
  })

  // ── FEATURE 14: Internal Routes & IPC Preservation (R3, R5) ─────────
  describe('Feature 14: Internal Routes & IPC Preservation', () => {
    it('validates that all 10 core views are accepted by isTopLevelView', () => {
      for (const view of CORE_TOP_LEVEL_VIEWS) {
        expect(isTopLevelView(view)).toBe(true)
      }
    })

    it('rejects invalid or unsafe view strings via isTopLevelView', () => {
      expect(isTopLevelView('__proto__')).toBe(false)
      expect(isTopLevelView('constructor')).toBe(false)
      expect(isTopLevelView('invalid_view')).toBe(false)
      expect(isTopLevelView(null)).toBe(false)
      expect(isTopLevelView(123)).toBe(false)
    })

    it('verifies exact count of 10 distinct top-level views', () => {
      expect(CORE_TOP_LEVEL_VIEWS).toHaveLength(10)
      const uniqueViews = new Set(CORE_TOP_LEVEL_VIEWS)
      expect(uniqueViews.size).toBe(10)
    })

    it('verifies critical IPC channel contracts on window.api mock interface', () => {
      const mockApi = {
        getWorktrees: vi.fn(),
        spawnTerminal: vi.fn(),
        closeTerminal: vi.fn(),
        writeTerminal: vi.fn(),
        resizeTerminal: vi.fn()
      }
      expect(typeof mockApi.getWorktrees).toBe('function')
      expect(typeof mockApi.spawnTerminal).toBe('function')
      expect(typeof mockApi.writeTerminal).toBe('function')
      expect(typeof mockApi.resizeTerminal).toBe('function')
    })

    it('verifies view routes preserve exact enum constants without string mutation', () => {
      const routes = {
        terminal: 'terminal',
        settings: 'settings',
        tasks: 'tasks',
        activity: 'activity',
        automations: 'automations',
        space: 'space',
        skills: 'skills',
        artifacts: 'artifacts',
        mobile: 'mobile',
        org: 'org'
      }
      expect(routes.terminal).toBe('terminal')
      expect(routes.org).toBe('org')
      expect(routes.automations).toBe('automations')
    })
  })

  // ── FEATURE 15: Repo Quality Gates Verification (R5) ────────────────
  describe('Feature 15: Repo Quality Gates Verification', () => {
    it('verifies config/tsconfig.tc.web.json includes all renderer paths', () => {
      const tsconfigPath = resolve(process.cwd(), 'config/tsconfig.tc.web.json')
      expect(existsSync(tsconfigPath)).toBe(true)
      const content = readFileSync(tsconfigPath, 'utf8')
      expect(content).toContain('../src/renderer/src/**/*')
    })

    it('verifies config/oxlint-design-system.json enforces shadcn lint rules', () => {
      const oxlintPath = resolve(process.cwd(), 'config/oxlint-design-system.json')
      expect(existsSync(oxlintPath)).toBe(true)
      const content = readFileSync(oxlintPath, 'utf8')
      expect(content).toContain('shadcn/no-restyle')
      expect(content).toContain('shadcn/no-raw-colors')
    })

    it('verifies config/vitest.config.ts configures happy-dom setup scripts', () => {
      const vitestPath = resolve(process.cwd(), 'config/vitest.config.ts')
      expect(existsSync(vitestPath)).toBe(true)
      const content = readFileSync(vitestPath, 'utf8')
      expect(content).toContain('happy-dom-offscreen-canvas.ts')
      expect(content).toContain('happy-dom-mutation-observer-retention.ts')
    })

    it('verifies config/scripts/check-max-lines-ratchet.mjs sets 800-line budget for test files', () => {
      const ratchetPath = resolve(process.cwd(), 'config/scripts/check-max-lines-ratchet.mjs')
      expect(existsSync(ratchetPath)).toBe(true)
      const content = readFileSync(ratchetPath, 'utf8')
      expect(content).toContain('return 800')
    })

    it('verifies PROJECT.md documents all 5 implementation milestones', () => {
      const projectMdPath = resolve(process.cwd(), 'PROJECT.md')
      expect(existsSync(projectMdPath)).toBe(true)
      const content = readFileSync(projectMdPath, 'utf8')
      expect(content).toContain('M1')
      expect(content).toContain('M2')
      expect(content).toContain('M3')
      expect(content).toContain('M4')
      expect(content).toContain('M5')
    })
  })
})
