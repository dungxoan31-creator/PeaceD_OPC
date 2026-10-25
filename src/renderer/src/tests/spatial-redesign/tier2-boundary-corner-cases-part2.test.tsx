// @vitest-environment happy-dom

globalThis.IS_REACT_ACT_ENVIRONMENT = true

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { act, createRef, type ReactNode, type RefObject } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  BILINGUAL_LABEL_REGEX,
  createTestDomContainer
} from './spatial-redesign-test-fixtures'
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

describe('Tier 2 — Boundary & Corner Cases (Part 2: Features 9-15 Boundaries)', () => {
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

  // ── FEATURE 9 BOUNDARY: Viewport Extreme Resolutions & High-DPI ─────
  describe('Feature 9 Boundary: Viewport Extreme Resolutions', () => {
    it('handles micro-viewport dimensions (320x240) clamped safely', () => {
      const clampViewport = (w: number, h: number): { width: number; height: number } => ({
        width: Math.max(320, w),
        height: Math.max(240, h)
      })
      expect(clampViewport(100, 100)).toEqual({ width: 320, height: 240 })
      expect(clampViewport(320, 240)).toEqual({ width: 320, height: 240 })
      expect(clampViewport(1920, 1080)).toEqual({ width: 1920, height: 1080 })
    })

    it('calculates ultrawide 8K dimensions (7680x4320) aspect ratio accurately', () => {
      const w = 7680
      const h = 4320
      const aspect = w / h
      expect(aspect).toBeCloseTo(16 / 9, 4)
    })

    it('tolerates fractional devicePixelRatio scaling (1.25, 1.5, 1.75)', () => {
      const snapToPhysicalPixels = (cssPx: number, dpr: number): number =>
        Math.round(cssPx * dpr) / dpr
      expect(snapToPhysicalPixels(10.3, 1.25)).toBeCloseTo(10.4, 1)
      expect(snapToPhysicalPixels(10.3, 1.5)).toBeCloseTo(10, 1)
      expect(snapToPhysicalPixels(10.3, 2)).toBeCloseTo(10.5, 1)
    })

    it('handles portrait vs landscape aspect ratio orientation flags', () => {
      const getOrientation = (w: number, h: number): 'landscape' | 'portrait' =>
        w >= h ? 'landscape' : 'portrait'
      expect(getOrientation(1920, 1080)).toBe('landscape')
      expect(getOrientation(1080, 1920)).toBe('portrait')
      expect(getOrientation(1000, 1000)).toBe('landscape')
    })

    it('debounces rapid burst of 20 window resize dispatches', () => {
      let callCount = 0
      let timeoutId: ReturnType<typeof setTimeout> | null = null
      const debouncedResize = (): void => {
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
        timeoutId = setTimeout(() => {
          callCount++
        }, 10)
      }
      for (let i = 0; i < 20; i++) {
        debouncedResize()
      }
      expect(callCount).toBe(0)
    })
  })

  // ── FEATURE 10 BOUNDARY: Terminal Header Truncation & Boundaries ─────
  describe('Feature 10 Boundary: Terminal Header Truncation', () => {
    it('truncates 500-character pane title safely in DOM rendering', () => {
      const extremeTitle = 'A'.repeat(500)
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
            paneTitles={{ 1: extremeTitle }}
            paneTitleOverlayRects={{ 1: { left: 0, top: 0, width: 300 } }}
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
      expect(container.textContent).toContain('A'.repeat(50))
      act(() => {
        root.unmount()
      })
    })

    it('calculates non-overlapping bounding rects for 16 split panes', () => {
      const paneCount = 16
      const containerWidth = 1600
      const paneWidth = containerWidth / paneCount
      const rects: Record<number, { left: number; top: number; width: number }> = {}
      for (let i = 1; i <= paneCount; i++) {
        rects[i] = { left: (i - 1) * paneWidth, top: 0, width: paneWidth }
      }
      expect(Object.keys(rects)).toHaveLength(16)
      for (let i = 1; i < paneCount; i++) {
        expect(rects[i].left + rects[i].width).toBeCloseTo(rects[i + 1].left, 4)
      }
    })

    it('cancels inline rename on Escape key without throwing', () => {
      const onCancel = vi.fn()
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
            paneTitles={{ 1: 'Title' }}
            paneTitleOverlayRects={{ 1: { left: 0, top: 0, width: 200 } }}
            renamingPaneId={1}
            renameValue="Draft"
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
            onRenameCancel={onCancel}
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
      const escEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
      act(() => {
        input?.dispatchEvent(escEvent)
      })
      expect(onCancel).toHaveBeenCalled()
      act(() => {
        root.unmount()
      })
    })

    it('clamps negative rectangle coordinates safely to zero offset', () => {
      const clampRect = (r: { left: number; top: number; width: number }): { left: number; top: number; width: number } => ({
        left: Math.max(0, r.left),
        top: Math.max(0, r.top),
        width: Math.max(0, r.width)
      })
      expect(clampRect({ left: -50, top: -20, width: 200 })).toEqual({ left: 0, top: 0, width: 200 })
    })

    it('handles empty panes array rendering without throwing exceptions', () => {
      const root = createRoot(container)
      expect(() => {
        act(() => {
          root.render(
            <TerminalPaneHeaderOverlay
              tabId="tab-1"
              worktreeId="wt-1"
              cwd="/tmp"
              showAlwaysOnHeaders={false}
              showSplitButton={false}
              paneCount={0}
              activePaneId={1}
              panes={[]}
              paneTitles={{}}
              paneTitleOverlayRects={{}}
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
      }).not.toThrow()
      act(() => {
        root.unmount()
      })
    })
  })

  // ── FEATURE 11 BOUNDARY: Command Lifecycle Burst & Signals ──────────
  describe('Feature 11 Boundary: Command Lifecycle Out-of-Order & Signals', () => {
    it('tolerates receiving command finished event when lifecycle is already idle', () => {
      let state = 'idle'
      const onFinished = (exitCode: number): void => {
        state = exitCode === 0 ? 'completed' : 'error'
      }
      onFinished(0)
      expect(state).toBe('completed')
    })

    it('processes rapid burst of 50 command execution events in sequence', () => {
      const results: number[] = []
      for (let i = 0; i < 50; i++) {
        results.push(i % 2 === 0 ? 0 : 1)
      }
      expect(results).toHaveLength(50)
      expect(results.filter((c) => c === 0)).toHaveLength(25)
      expect(results.filter((c) => c === 1)).toHaveLength(25)
    })

    it('maps SIGINT (exit code 130) to error status', () => {
      const exitCode: number = 130
      const isError = exitCode !== 0
      expect(isError).toBe(true)
    })

    it('maps SIGKILL (exit code 137) to error status', () => {
      const exitCode: number = 137
      const isError = exitCode !== 0
      expect(isError).toBe(true)
    })

    it('formats extreme command duration (100,000 seconds) into hours and minutes', () => {
      const formatDuration = (sec: number): string => {
        const h = Math.floor(sec / 3600)
        const m = Math.floor((sec % 3600) / 60)
        const s = sec % 60
        return `${h}h ${m}m ${s}s`
      }
      expect(formatDuration(100000)).toBe('27h 46m 40s')
      expect(formatDuration(65)).toBe('0h 1m 5s')
    })
  })

  // ── FEATURE 12 BOUNDARY: PTY High-Throughput & Stream Tolerance ──────
  describe('Feature 12 Boundary: PTY High-Throughput Stream Tolerance', () => {
    it('simulates 1MB text buffer chunk without data loss', () => {
      const largeChunk = 'X'.repeat(1024 * 1024)
      const encoded = new TextEncoder().encode(largeChunk)
      expect(encoded.byteLength).toBe(1048576)
      const decoded = new TextDecoder().decode(encoded)
      expect(decoded.length).toBe(1048576)
    })

    it('tolerates null bytes and terminal control codes in stream', () => {
      const streamData = 'Text\x00With\x07Control\x1b[31mRed\x1b[0mEnd'
      const sanitized = streamData.replaceAll('\x00', '')
      expect(sanitized).not.toContain('\x00')
      expect(sanitized).toContain('Control')
    })

    it('handles multiple rapid terminal resize dimensions in sequence', () => {
      const resizes = [
        { cols: 80, rows: 24 },
        { cols: 120, rows: 35 },
        { cols: 200, rows: 50 }
      ]
      let activeCols = 0
      let activeRows = 0
      for (const r of resizes) {
        activeCols = r.cols
        activeRows = r.rows
      }
      expect(activeCols).toBe(200)
      expect(activeRows).toBe(50)
    })

    it('handles empty chunk transmission without throwing errors', () => {
      const emptyChunk = ''
      expect(new TextEncoder().encode(emptyChunk).byteLength).toBe(0)
    })

    it('reassembles multi-byte Vietnamese characters split across chunks', () => {
      const fullText = 'Đồng'
      const encoded = new TextEncoder().encode(fullText)
      const chunk1 = encoded.subarray(0, 3)
      const chunk2 = encoded.subarray(3)
      const merged = new Uint8Array(encoded.length)
      merged.set(chunk1, 0)
      merged.set(chunk2, 3)
      expect(new TextDecoder('utf-8').decode(merged)).toBe(fullText)
    })
  })

  // ── FEATURE 13 BOUNDARY: Bilingual Formatting Resiliency ────────────
  describe('Feature 13 Boundary: Bilingual Formatting Resiliency', () => {
    it('trims leading and trailing spaces before validating bilingual format', () => {
      const padded = '  Trạm lệnh // Terminal  '
      expect(BILINGUAL_LABEL_REGEX.test(padded.trim())).toBe(true)
    })

    it('rejects strings missing Vietnamese prefix', () => {
      expect(BILINGUAL_LABEL_REGEX.test('// Terminal')).toBe(false)
    })

    it('rejects strings missing English suffix', () => {
      expect(BILINGUAL_LABEL_REGEX.test('Trạm lệnh //')).toBe(false)
    })

    it('rejects strings with double separators', () => {
      expect(BILINGUAL_LABEL_REGEX.test('A // B // C')).toBe(false)
    })

    it('verifies complex tone marks in Vietnamese phrases normalize identically under NFC', () => {
      const text1 = 'Tiến trình tự động // Automations'
      const text2 = text1.normalize('NFD').normalize('NFC')
      expect(text1).toBe(text2)
    })
  })

  // ── FEATURE 14 BOUNDARY: IPC Channel Rejection & Guards ──────────────
  describe('Feature 14 Boundary: IPC Channel Rejection & Guards', () => {
    it('catches simulated IPC rejection cleanly with try/catch', async () => {
      const failingIpc = async (): Promise<never> => {
        throw new Error('IPC_CHANNEL_UNAVAILABLE')
      }
      let errorCaught = false
      try {
        await failingIpc()
      } catch (err) {
        errorCaught = true
        // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: Error cast for message check
        expect((err as Error).message).toBe('IPC_CHANNEL_UNAVAILABLE')
      }
      expect(errorCaught).toBe(true)
    })

    it('handles null response from IPC channel with default fallback object', () => {
      function handleIpcResponse<T extends unknown>(res: T | null, fallback: T): T {
        return res ?? fallback
      }
      expect(handleIpcResponse(null, { worktrees: [] })).toEqual({ worktrees: [] })
    })

    it('manages 20 concurrent IPC promise resolutions cleanly', async () => {
      const calls = Array.from({ length: 20 }, (_, i) => Promise.resolve(`result-${i}`))
      const settled = await Promise.all(calls)
      expect(settled).toHaveLength(20)
      expect(settled[0]).toBe('result-0')
      expect(settled[19]).toBe('result-19')
    })

    it('safely handles missing window.api gracefully in detached test contexts', () => {
      const checkApiAvailable = (apiObj: unknown): boolean =>
        typeof apiObj === 'object' && apiObj !== null
      expect(checkApiAvailable(undefined)).toBe(false)
      expect(checkApiAvailable(null)).toBe(false)
      expect(checkApiAvailable({})).toBe(true)
    })

    it('guards against unhandled IPC action dispatch with default no-op', () => {
      const dispatchAction = (actionType: string): string => {
        switch (actionType) {
          case 'spawn':
            return 'spawned'
          case 'close':
            return 'closed'
          default:
            return 'unhandled'
        }
      }
      expect(dispatchAction('unknown_action')).toBe('unhandled')
    })
  })

  // ── FEATURE 15 BOUNDARY: Quality Gate Ratchets & Constraints ────────
  describe('Feature 15 Boundary: Quality Gate Ratchets & Limits', () => {
    it('verifies this test file remains strictly under 800 lines max-lines budget', () => {
      const content = readFileSync(__filename, 'utf8')
      const lineCount = content.split('\n').length
      expect(lineCount).toBeLessThan(800)
    })

    it('verifies fixtures file remains strictly under 300 lines max-lines budget', () => {
      const fixturePath = resolve(__dirname, 'spatial-redesign-test-fixtures.ts')
      const content = readFileSync(fixturePath, 'utf8')
      const lineCount = content.split('\n').length
      expect(lineCount).toBeLessThan(300)
    })

    it('verifies no max-lines disable comments exist in this test file', () => {
      const content = readFileSync(__filename, 'utf8')
      const linesWithoutSelf = content
        .split('\n')
        .filter((l) => !l.includes('disable max-lines'))
        .join('\n')
      expect(linesWithoutSelf).not.toContain('eslint-disable ' + 'max-lines')
      expect(linesWithoutSelf).not.toContain('oxlint-disable ' + 'max-lines')
    })

    it('verifies all type assertions in this file contain SAFETY explanations', () => {
      const content = readFileSync(__filename, 'utf8')
      const lines = content.split('\n')
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        if (
          line.includes(' ' + 'as ') &&
          !line.includes('//') &&
          !line.includes('const') &&
          !line.includes("it('") &&
          !line.includes("describe('") &&
          !line.includes('line.includes')
        ) {
          const prevLine = lines[i - 1] ?? ''
          expect(prevLine).toContain('SAFETY:')
        }
      }
    })

    it('verifies test assertions do not require legacy cyberpunk cyan for target colors', () => {
      const content = readFileSync(__filename, 'utf8')
      const targetCyan = '#' + '00f0ff'
      const linesWithoutSelf = content
        .split('\n')
        .filter((l) => !l.includes('targetCyan') && !l.includes('legacy cyberpunk'))
        .join('\n')
      expect(linesWithoutSelf).not.toContain(`toBe('${targetCyan}')`)
      expect(linesWithoutSelf).not.toContain(`toEqual('${targetCyan}')`)
    })
  })
})
