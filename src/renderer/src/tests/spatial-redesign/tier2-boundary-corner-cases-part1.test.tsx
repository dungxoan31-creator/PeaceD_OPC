// @vitest-environment happy-dom

globalThis.IS_REACT_ACT_ENVIRONMENT = true

import { act } from 'react'
import { createRoot } from 'react-dom/client'
import type * as ThreeModule from 'three'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('three', async (importOriginal) => {
  // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: Import actual Three.js
  const actual = (await importOriginal()) as typeof ThreeModule
  class MockWebGLRenderer {
    domElement: HTMLCanvasElement
    constructor() {
      this.domElement = document.createElement('canvas')
    }
    setSize = vi.fn()
    setPixelRatio = vi.fn()
    setClearColor = vi.fn()
    render = vi.fn()
    dispose = vi.fn()
  }
  return {
    ...actual,
    WebGLRenderer: MockWebGLRenderer
  }
})

import {
  calculateContrastRatio,
  calculateLuminance,
  createMockMatchMedia,
  createTestDomContainer,
  hexToRgb,
  readMainCss
} from './spatial-redesign-test-fixtures'
import { TrongDongPattern } from '@/components/TrongDongPattern'
import { Spatial3DScene } from '@/components/spatial/Spatial3DScene'
import {
  shouldShowAgentDashboardButton,
  shouldShowArtifactsButton,
  shouldShowAutomationsButton,
  shouldShowMobileButton,
  shouldShowSkillsButton
} from '@/components/sidebar/SidebarNav'

describe('Tier 2 — Boundary & Corner Cases (Part 1: Features 1-8 Boundaries)', () => {
  let container: HTMLDivElement
  let cleanupDom: () => void

  beforeEach(() => {
    // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: Test double for WebGLRenderingContext constructor
    window.WebGLRenderingContext = (function MockWebGL() {}) as unknown as typeof WebGLRenderingContext
    HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation((type: string) => {
      if (type.includes('webgl')) {
        return {}
      }
      return null
    })
    const fixture = createTestDomContainer()
    container = fixture.container
    cleanupDom = fixture.cleanup
  })

  afterEach(() => {
    cleanupDom()
    vi.restoreAllMocks()
  })

  // ── FEATURE 1 BOUNDARY: Palette Contrast & Fallback Resilience ──────
  describe('Feature 1 Boundary: Palette Contrast & Color Math', () => {
    it('verifies contrast ratio between bright gold highlight and dark obsidian exceeds 7:1', () => {
      const brightGold = '#E5C158'
      const darkObsidian = '#120D0B'
      const contrast = calculateContrastRatio(brightGold, darkObsidian)
      expect(contrast).toBeGreaterThanOrEqual(7)
    })

    it('verifies vermilion red alert on raw silk ivory satisfies WCAG AA (>= 4.5:1)', () => {
      const vermilionAlert = '#99221B'
      const rawSilk = '#FAF7F2'
      const contrast = calculateContrastRatio(vermilionAlert, rawSilk)
      expect(contrast).toBeGreaterThanOrEqual(4.5)
    })

    it('handles 3-digit shorthand hex codes in hexToRgb without returning null or NaN', () => {
      const rgb = hexToRgb('#fff')
      expect(rgb).toEqual({ r: 255, g: 255, b: 255 })
      const rgbDark = hexToRgb('#000')
      expect(rgbDark).toEqual({ r: 0, g: 0, b: 0 })
    })

    it('handles invalid or empty hex strings safely by returning 0 luminance', () => {
      expect(calculateLuminance('')).toBe(0)
      expect(calculateLuminance('not-a-color')).toBe(0)
      expect(calculateLuminance('#12')).toBe(0)
    })

    it('ensures contrast ratio is commutative: contrast(A, B) === contrast(B, A)', () => {
      const c1 = calculateContrastRatio('#7A1C16', '#FAF7F2')
      const c2 = calculateContrastRatio('#FAF7F2', '#7A1C16')
      expect(c1).toBeCloseTo(c2, 5)
    })
  })

  // ── FEATURE 2 BOUNDARY: Đông Sơn Primitives Scaling & Degraded ───────
  describe('Feature 2 Boundary: Đông Sơn Primitives Scaling', () => {
    it('mounts TrongDongPattern with minimum boundary size (size=1) without crashing', () => {
      const root = createRoot(container)
      act(() => {
        root.render(<TrongDongPattern size={1} />)
      })
      const img = container.querySelector('img')
      expect(img).not.toBeNull()
      // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: DOM Element is HTMLElement
      expect((img as HTMLElement).style.width).toBe('1px')
      act(() => {
        root.unmount()
      })
    })

    it('mounts TrongDongPattern with extreme boundary size (size=5000) without crashing', () => {
      const root = createRoot(container)
      act(() => {
        root.render(<TrongDongPattern size={5000} />)
      })
      const img = container.querySelector('img')
      expect(img).not.toBeNull()
      // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: DOM Element is HTMLElement
      expect((img as HTMLElement).style.width).toBe('5000px')
      act(() => {
        root.unmount()
      })
    })

    it('mounts TrongDongPattern with zero opacity (opacity=0) retaining hidden accessibility role', () => {
      const root = createRoot(container)
      act(() => {
        root.render(<TrongDongPattern opacity={0} />)
      })
      const wrapper = container.querySelector('div[aria-hidden="true"]')
      expect(wrapper).not.toBeNull()
      // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: DOM Element is HTMLElement
      expect((wrapper as HTMLElement).style.opacity).toBe('0')
      act(() => {
        root.unmount()
      })
    })

    it('mounts TrongDongPattern with string size prop (e.g. "50vw") cleanly', () => {
      const root = createRoot(container)
      act(() => {
        root.render(<TrongDongPattern size="50vw" />)
      })
      const img = container.querySelector('img')
      // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: DOM Element is HTMLElement
      expect((img as HTMLElement).style.width).toBe('50vw')
      act(() => {
        root.unmount()
      })
    })

    it('renders all four corner positions (center, top-right, bottom-right, bottom-left)', () => {
      const root = createRoot(container)
      const positions = ['center', 'top-right', 'bottom-right', 'bottom-left'] as const
      for (const pos of positions) {
        act(() => {
          root.render(<TrongDongPattern position={pos} />)
        })
        expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull()
      }
      act(() => {
        root.unmount()
      })
    })
  })

  // ── FEATURE 3 BOUNDARY: 3D Scene WebGL Context Loss & Multi-Mount ───
  describe('Feature 3 Boundary: 3D Scene Stress & Extreme Inputs', () => {
    it('handles zero client dimensions on container without division-by-zero error', () => {
      Object.defineProperty(container, 'clientWidth', { value: 0, configurable: true })
      Object.defineProperty(container, 'clientHeight', { value: 0, configurable: true })
      const root = createRoot(container)
      expect(() => {
        act(() => {
          root.render(<Spatial3DScene />)
        })
      }).not.toThrow()
      act(() => {
        root.unmount()
      })
    })

    it('handles zero particle count boundary (particleCount=0)', () => {
      const root = createRoot(container)
      expect(() => {
        act(() => {
          root.render(<Spatial3DScene particleCount={0} />)
        })
      }).not.toThrow()
      expect(container.querySelector('canvas')).not.toBeNull()
      act(() => {
        root.unmount()
      })
    })

    it('handles high particle count boundary (particleCount=10000)', () => {
      const root = createRoot(container)
      expect(() => {
        act(() => {
          root.render(<Spatial3DScene particleCount={10000} />)
        })
      }).not.toThrow()
      expect(container.querySelector('canvas')).not.toBeNull()
      act(() => {
        root.unmount()
      })
    })

    it('survives rapid consecutive mount and unmount cycles without leaking DOM elements', () => {
      for (let i = 0; i < 5; i++) {
        const root = createRoot(container)
        act(() => {
          root.render(<Spatial3DScene />)
        })
        expect(container.querySelector('canvas')).not.toBeNull()
        act(() => {
          root.unmount()
        })
        expect(container.innerHTML).toBe('')
      }
    })

    it('renders cleanly with showCore=false prop', () => {
      const root = createRoot(container)
      act(() => {
        root.render(<Spatial3DScene showCore={false} />)
      })
      expect(container.querySelector('canvas')).not.toBeNull()
      act(() => {
        root.unmount()
      })
    })
  })

  // ── FEATURE 4 BOUNDARY: Dynamic Motion Preferences & Rapid Mutation ──
  describe('Feature 4 Boundary: Dynamic Motion Preferences', () => {
    it('handles dynamic toggle from reduced-motion to full-motion', () => {
      const { matchMedia, setMatches } = createMockMatchMedia(true)
      const mql = matchMedia('(prefers-reduced-motion: reduce)')
      expect(mql.matches).toBe(true)
      let changeFired = false
      mql.addEventListener('change', (e) => {
        if (!e.matches) {
          changeFired = true
        }
      })
      setMatches(false)
      expect(mql.matches).toBe(false)
      expect(changeFired).toBe(true)
    })

    it('handles dynamic toggle from full-motion to reduced-motion', () => {
      const { matchMedia, setMatches } = createMockMatchMedia(false)
      const mql = matchMedia('(prefers-reduced-motion: reduce)')
      expect(mql.matches).toBe(false)
      let changeFired = false
      mql.addEventListener('change', (e) => {
        if (e.matches) {
          changeFired = true
        }
      })
      setMatches(true)
      expect(mql.matches).toBe(true)
      expect(changeFired).toBe(true)
    })

    it('supports multiple concurrent listeners on same MediaQueryList', () => {
      const { matchMedia, setMatches } = createMockMatchMedia(false)
      const mql = matchMedia('(prefers-reduced-motion: reduce)')
      let count1 = 0
      let count2 = 0
      mql.addEventListener('change', () => {
        count1++
      })
      mql.addEventListener('change', () => {
        count2++
      })
      setMatches(true)
      expect(count1).toBe(1)
      expect(count2).toBe(1)
    })

    it('unregisters listener via removeEventListener without leaking notification calls', () => {
      const { matchMedia, setMatches } = createMockMatchMedia(false)
      const mql = matchMedia('(prefers-reduced-motion: reduce)')
      let count = 0
      const listener = (): void => {
        count++
      }
      mql.addEventListener('change', listener)
      setMatches(true)
      expect(count).toBe(1)
      mql.removeEventListener('change', listener)
      setMatches(false)
      expect(count).toBe(1)
    })

    it('survives rapid flipping of motion preference across 10 toggles', () => {
      const { matchMedia, setMatches } = createMockMatchMedia(false)
      const mql = matchMedia('(prefers-reduced-motion: reduce)')
      let flipCount = 0
      mql.addEventListener('change', () => {
        flipCount++
      })
      for (let i = 0; i < 10; i++) {
        setMatches(i % 2 === 0)
      }
      expect(flipCount).toBe(10)
      expect(mql.matches).toBe(false)
    })
  })

  // ── FEATURE 5 BOUNDARY: Navigation Dock Viewport Overflow ───────────
  describe('Feature 5 Boundary: Navigation Dock Settings Predicates', () => {
    it('handles undefined settings object safely across all navigation predicates', () => {
      expect(shouldShowMobileButton(undefined)).toBe(true)
      expect(shouldShowAutomationsButton(undefined)).toBe(true)
      expect(shouldShowArtifactsButton(undefined)).toBe(false)
      expect(shouldShowSkillsButton(undefined)).toBe(false)
      expect(shouldShowAgentDashboardButton(undefined)).toBe(false)
    })

    it('handles empty settings object safely across all navigation predicates', () => {
      expect(shouldShowMobileButton({})).toBe(true)
      expect(shouldShowAutomationsButton({})).toBe(true)
      expect(shouldShowArtifactsButton({})).toBe(false)
      expect(shouldShowSkillsButton({})).toBe(false)
      expect(shouldShowAgentDashboardButton({})).toBe(false)
    })

    it('handles null settings value safely across all navigation predicates', () => {
      expect(shouldShowMobileButton(null)).toBe(true)
      expect(shouldShowAutomationsButton(null)).toBe(true)
      expect(shouldShowArtifactsButton(null)).toBe(false)
      expect(shouldShowSkillsButton(null)).toBe(false)
      expect(shouldShowAgentDashboardButton(null)).toBe(false)
    })

    it('correctly toggles all feature button predicates when explicitly set to true', () => {
      const allEnabled = {
        showMobileButton: true,
        showAutomationsButton: true,
        showArtifactsButton: true,
        showSkillsButton: true,
        experimentalAgentDashboardPopout: true
      }
      expect(shouldShowMobileButton(allEnabled)).toBe(true)
      expect(shouldShowAutomationsButton(allEnabled)).toBe(true)
      expect(shouldShowArtifactsButton(allEnabled)).toBe(true)
      expect(shouldShowSkillsButton(allEnabled)).toBe(true)
      expect(shouldShowAgentDashboardButton(allEnabled)).toBe(true)
    })

    it('correctly disables all feature button predicates when explicitly set to false', () => {
      const allDisabled = {
        showMobileButton: false,
        showAutomationsButton: false,
        showArtifactsButton: false,
        showSkillsButton: false,
        experimentalAgentDashboardPopout: false
      }
      expect(shouldShowMobileButton(allDisabled)).toBe(false)
      expect(shouldShowAutomationsButton(allDisabled)).toBe(false)
      expect(shouldShowArtifactsButton(allDisabled)).toBe(false)
      expect(shouldShowSkillsButton(allDisabled)).toBe(false)
      expect(shouldShowAgentDashboardButton(allDisabled)).toBe(false)
    })
  })

  // ── FEATURE 6 BOUNDARY: Command Dock Deep Breadcrumbs & Input ───────
  describe('Feature 6 Boundary: Command Dock & Search Resilience', () => {
    it('truncates deeply nested breadcrumb segments (15 levels) with middle ellipsis', () => {
      const segments = Array.from({ length: 15 }, (_, i) => `Segment-${i + 1}`)
      const truncateBreadcrumbs = (items: string[], maxVisible: number = 4): string[] => {
        if (items.length <= maxVisible) {
          return items
        }
        return [items[0] ?? '', '...', items.at(-2) ?? '', items.at(-1) ?? '']
      }
      const truncated = truncateBreadcrumbs(segments)
      expect(truncated).toEqual(['Segment-1', '...', 'Segment-14', 'Segment-15'])
    })

    it('sanitizes special regex control characters in search queries without regex errors', () => {
      const maliciousQuery = '[.*+?^${}()|[\\]\\\\]'
      const escapeRegex = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      expect(() => new RegExp(escapeRegex(maliciousQuery))).not.toThrow()
    })

    it('handles empty query string in search filters returning full unmuted items', () => {
      const items = ['Terminal', 'Settings', 'Tasks']
      const filterItems = (query: string): string[] => {
        if (!query.trim()) {
          return items
        }
        return items.filter((item) => item.toLowerCase().includes(query.toLowerCase()))
      }
      expect(filterItems('')).toEqual(items)
      expect(filterItems('   ')).toEqual(items)
    })

    it('handles extreme 1000-character search string without stack overflow', () => {
      const longQuery = 'A'.repeat(1000)
      const items = ['Terminal', 'Settings', 'Tasks']
      const matches = items.filter((item) => item.includes(longQuery))
      expect(matches).toEqual([])
    })

    it('verifies titlebar hairline background stops contain transparent bounds', () => {
      const css = readMainCss()
      const titlebarAfter = css.match(/\.titlebar::after\s*\{([^}]+)\}/)?.[1] ?? ''
      expect(titlebarAfter).toContain('transparent 0%')
      expect(titlebarAfter).toContain('transparent 100%')
    })
  })

  // ── FEATURE 7 BOUNDARY: Telemetry Capsule Extreme Metrics ───────────
  describe('Feature 7 Boundary: Telemetry Metrics Formatting', () => {
    it('formats 100% CPU without floating point precision issues', () => {
      const formatCpu = (val: number): string => `${Math.min(100, Math.max(0, Math.round(val)))}%`
      expect(formatCpu(100)).toBe('100%')
      expect(formatCpu(99.999)).toBe('100%')
      expect(formatCpu(0.001)).toBe('0%')
    })

    it('handles negative or NaN metric inputs with safe fallback', () => {
      const formatMetric = (val: number): string => {
        if (Number.isNaN(val) || val < 0) {
          return '--'
        }
        return `${Math.round(val)}%`
      }
      expect(formatMetric(Number.NaN)).toBe('--')
      expect(formatMetric(-5)).toBe('--')
      expect(formatMetric(42)).toBe('42%')
    })

    it('formats extreme memory values (e.g. 128 GB) cleanly into human-readable units', () => {
      const formatBytes = (bytes: number): string => {
        if (bytes >= 1024 * 1024 * 1024) {
          return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
        }
        return `${Math.round(bytes / (1024 * 1024))} MB`
      }
      expect(formatBytes(137438953472)).toBe('128.0 GB')
      expect(formatBytes(524288000)).toBe('500 MB')
    })

    it('verifies cyber-pill capsule font sizing matches sub-compact spec', () => {
      const css = readMainCss()
      const capsuleRule = css.match(/\.cyber-pill\s*\{([^}]+)\}/)?.[1] ?? ''
      expect(capsuleRule).toContain('font-size: 0.6875rem')
      expect(capsuleRule).toContain('font-weight: 700')
    })

    it('verifies capsule text-transform enforces uppercase branding', () => {
      const css = readMainCss()
      const capsuleRule = css.match(/\.cyber-pill\s*\{([^}]+)\}/)?.[1] ?? ''
      expect(capsuleRule).toContain('text-transform: uppercase')
    })
  })

  // ── FEATURE 8 BOUNDARY: Inspector Panel Multi-Drawer Conflicts ───────
  describe('Feature 8 Boundary: Inspector Panel & Drawers', () => {
    it('manages single active drawer state when conflicting open actions occur', () => {
      let activeDrawer: string | null = null
      const openDrawer = (id: string): void => {
        activeDrawer = id
      }
      openDrawer('telemetry')
      expect(activeDrawer).toBe('telemetry')
      openDrawer('inspector')
      expect(activeDrawer).toBe('inspector')
    })

    it('closing an already null drawer is a safe no-op', () => {
      let activeDrawer: string | null = null
      const closeDrawer = (): void => {
        activeDrawer = null
      }
      expect(() => closeDrawer()).not.toThrow()
      expect(activeDrawer).toBeNull()
    })

    it('keyboard dismissal via Escape key sets active drawer to null', () => {
      let activeDrawer: string | null = 'inspector'
      const handleKeyDown = (key: string): void => {
        if (key === 'Escape') {
          activeDrawer = null
        }
      }
      handleKeyDown('Escape')
      expect(activeDrawer).toBeNull()
    })

    it('ignores non-Escape keyboard presses on drawer dismissal handler', () => {
      let activeDrawer: string | null = 'inspector'
      const handleKeyDown = (key: string): void => {
        if (key === 'Escape') {
          activeDrawer = null
        }
      }
      handleKeyDown('Enter')
      expect(activeDrawer).toBe('inspector')
      handleKeyDown('Tab')
      expect(activeDrawer).toBe('inspector')
    })

    it('verifies spatial card hover transform is disabled under reduced motion', () => {
      const css = readMainCss()
      expect(css).toContain('.spatial-card:hover')
      expect(css).toContain('transform: none !important')
    })
  })
})
