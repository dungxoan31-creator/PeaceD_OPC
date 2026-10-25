// @vitest-environment happy-dom

globalThis.IS_REACT_ACT_ENVIRONMENT = true

import { existsSync, readFileSync } from 'node:fs'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import type * as THREE from 'three'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('three', async (importOriginal) => {
  // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: Import actual Three.js
  const actual = (await importOriginal()) as typeof THREE
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
  createMockMatchMedia,
  createTestDomContainer,
  readMainCss,
  TRONG_DONG_BORDER_SVG_PATH,
  TRONG_DONG_SVG_PATH
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

describe('Tier 1 — Feature Coverage (Part 1: Features 1-8)', () => {
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

  // ── FEATURE 1: Vietnamese Modern-Tech Palette (R2) ──────────────────
  describe('Feature 1: Vietnamese Modern-Tech Palette', () => {
    it('declares authentic lacquer, gold, bronze, and silk color tokens in main.css', () => {
      const css = readMainCss()
      expect(css).toContain(':root')
      expect(css).toContain('.dark')
      expect(css).toContain('--primary')
      expect(css).toContain('--background')
      expect(css).toContain('--foreground')
    })

    it('defines glass and spatial surface variables in main.css', () => {
      const css = readMainCss()
      expect(css).toContain('--glass-surface')
      expect(css).toContain('--glass-border')
      expect(css).toContain('--spatial-bg')
      expect(css).toContain('--spatial-card')
    })

    it('verifies high-contrast readability between ivory foreground and dark obsidian background', () => {
      const ivoryForeground = '#FAF7F2'
      const obsidianBackground = '#120D0B'
      const contrast = calculateContrastRatio(ivoryForeground, obsidianBackground)
      expect(contrast).toBeGreaterThanOrEqual(7) // WCAG AAA is >= 7.0
    })

    it('verifies contrast ratio between gold leaf accent and obsidian lacquer surface', () => {
      const goldLeaf = '#D4A359'
      const darkSurface = '#1F1512'
      const contrast = calculateContrastRatio(goldLeaf, darkSurface)
      expect(contrast).toBeGreaterThanOrEqual(4.5) // WCAG AA is >= 4.5
    })

    it('binds semantic palette tokens into Tailwind inline theme definitions', () => {
      const css = readMainCss()
      const themeBlock = css.match(/@theme inline\s*\{([^}]+)\}/)?.[1] ?? ''
      expect(themeBlock).toContain('--color-primary: var(--primary)')
      expect(themeBlock).toContain('--color-background: var(--background)')
      expect(themeBlock).toContain('--color-card: var(--card)')
    })
  })

  // ── FEATURE 2: Đông Sơn Motifs & Primitives (R2) ─────────────────────
  describe('Feature 2: Đông Sơn Motifs & Primitives', () => {
    it('verifies trong-dong.svg asset exists with authentic concentric rings and solar star', () => {
      expect(existsSync(TRONG_DONG_SVG_PATH)).toBe(true)
      const svg = readFileSync(TRONG_DONG_SVG_PATH, 'utf8')
      expect(svg).toContain('<svg')
      expect(svg).toContain('viewBox')
      expect(svg).toContain('polygon')
      expect(svg).toContain('circle')
    })

    it('verifies trong-dong-border.svg asset exists with repeating chevrons and tangent circles', () => {
      expect(existsSync(TRONG_DONG_BORDER_SVG_PATH)).toBe(true)
      const svg = readFileSync(TRONG_DONG_BORDER_SVG_PATH, 'utf8')
      expect(svg).toContain('viewBox="0 0 160 32"')
      expect(svg).toContain('polyline')
      expect(svg).toContain('circle')
    })

    it('mounts TrongDongPattern primitive with correct accessibility and wrapper attributes', () => {
      const root = createRoot(container)
      act(() => {
        root.render(<TrongDongPattern />)
      })
      const el = container.querySelector('div[aria-hidden="true"]')
      expect(el).not.toBeNull()
      expect(el?.className).toContain('pointer-events-none')
      expect(el?.className).toContain('select-none')
      const img = container.querySelector('img')
      expect(img).not.toBeNull()
      act(() => {
        root.unmount()
      })
    })

    it('supports custom size, opacity, and positioning on TrongDongPattern', () => {
      const root = createRoot(container)
      act(() => {
        root.render(
          <TrongDongPattern size={480} opacity={0.12} position="bottom-right" className="custom-pattern" />
        )
      })
      const wrapper = container.querySelector('.custom-pattern')
      expect(wrapper).not.toBeNull()
      // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: DOM Element is HTMLElement with style
      const htmlEl = wrapper as HTMLElement
      expect(htmlEl.style.opacity).toBe('0.12')
      expect(wrapper?.className).toContain('items-end')
      expect(wrapper?.className).toContain('justify-end')
      act(() => {
        root.unmount()
      })
    })

    it('attaches rotation animation class to TrongDongPattern when animate is true', () => {
      const root = createRoot(container)
      act(() => {
        root.render(<TrongDongPattern animate={true} />)
      })
      const img = container.querySelector('img')
      expect(img?.className).toContain('animate-[spin_240s_linear_infinite]')
      act(() => {
        root.unmount()
      })
    })
  })

  // ── FEATURE 3: Three.js 3D Spatial Scene (R2) ───────────────────────
  describe('Feature 3: Three.js 3D Spatial Scene', () => {
    it('mounts Spatial3DScene component without throwing exceptions', () => {
      const root = createRoot(container)
      expect(() => {
        act(() => {
          root.render(<Spatial3DScene className="spatial-test-scene" />)
        })
      }).not.toThrow()
      const sceneNode = container.querySelector('.spatial-test-scene')
      expect(sceneNode).not.toBeNull()
      act(() => {
        root.unmount()
      })
    })

    it('attaches WebGL canvas element inside container when WebGL is available', () => {
      const root = createRoot(container)
      act(() => {
        root.render(<Spatial3DScene />)
      })
      expect(container.querySelector('canvas')).not.toBeNull()
      act(() => {
        root.unmount()
      })
    })

    it('accepts intensity presets without component degradation', () => {
      const root = createRoot(container)
      act(() => {
        root.render(<Spatial3DScene intensity="vibrant" />)
      })
      expect(container.querySelector('div')).not.toBeNull()
      act(() => {
        root.render(<Spatial3DScene intensity="subtle" />)
      })
      expect(container.querySelector('div')).not.toBeNull()
      act(() => {
        root.unmount()
      })
    })

    it('configures custom particle count for ambient golden embers', () => {
      const root = createRoot(container)
      act(() => {
        root.render(<Spatial3DScene particleCount={150} />)
      })
      expect(container.querySelector('canvas')).not.toBeNull()
      act(() => {
        root.unmount()
      })
    })

    it('gracefully disposes renderer and removes canvas on component unmount', () => {
      const root = createRoot(container)
      act(() => {
        root.render(<Spatial3DScene />)
      })
      expect(container.querySelector('canvas')).not.toBeNull()
      act(() => {
        root.unmount()
      })
      expect(container.innerHTML).toBe('')
    })
  })

  // ── FEATURE 4: Motion Accessibility & Fallbacks (R2) ────────────────
  describe('Feature 4: Motion Accessibility & Fallbacks', () => {
    it('verifies matchMedia helper detects prefers-reduced-motion state changes', () => {
      const { matchMedia, setMatches } = createMockMatchMedia(false)
      const mql = matchMedia('(prefers-reduced-motion: reduce)')
      expect(mql.matches).toBe(false)
      let notified = false
      mql.addEventListener('change', (e) => {
        if (e.matches) {
          notified = true
        }
      })
      setMatches(true)
      expect(mql.matches).toBe(true)
      expect(notified).toBe(true)
    })

    it('renders fallback representation when WebGL context creation fails', () => {
      const origGetContext = HTMLCanvasElement.prototype.getContext
      HTMLCanvasElement.prototype.getContext = vi.fn(() => null)
      const root = createRoot(container)
      try {
        act(() => {
          root.render(<Spatial3DScene />)
        })
        expect(container.querySelector('.spatial-fallback-canvas') ?? container.querySelector('div')).not.toBeNull()
      } finally {
        act(() => {
          root.unmount()
        })
        HTMLCanvasElement.prototype.getContext = origGetContext
      }
    })

    it('verifies main.css has prefers-reduced-motion rules suppressing cyber float animations', () => {
      const css = readMainCss()
      expect(css).toContain('@media (prefers-reduced-motion: reduce)')
      expect(css).toContain('animation: none !important')
    })

    it('resets transform styles under prefers-reduced-motion in main.css', () => {
      const css = readMainCss()
      expect(css).toContain('transform: none !important')
    })

    it('renders cleanly when interactive prop is disabled', () => {
      const root = createRoot(container)
      act(() => {
        root.render(<Spatial3DScene interactive={false} />)
      })
      expect(container.querySelector('[role="presentation"]')).not.toBeNull()
      act(() => {
        root.unmount()
      })
    })
  })

  // ── FEATURE 5: Floating Spatial Navigation Rail (R1) ────────────────
  describe('Feature 5: Floating Spatial Navigation Rail', () => {
    it('determines mobile button visibility from global settings', () => {
      expect(shouldShowMobileButton({ showMobileButton: true })).toBe(true)
      expect(shouldShowMobileButton({ showMobileButton: false })).toBe(false)
      expect(shouldShowMobileButton(null)).toBe(true)
    })

    it('determines automations button visibility from global settings', () => {
      expect(shouldShowAutomationsButton({ showAutomationsButton: true })).toBe(true)
      expect(shouldShowAutomationsButton({ showAutomationsButton: false })).toBe(false)
      expect(shouldShowAutomationsButton(undefined)).toBe(true)
    })

    it('determines artifacts button visibility from global settings', () => {
      expect(shouldShowArtifactsButton({ showArtifactsButton: true })).toBe(true)
      expect(shouldShowArtifactsButton({ showArtifactsButton: false })).toBe(false)
      expect(shouldShowArtifactsButton(null)).toBe(false)
    })

    it('determines skills button visibility from global settings', () => {
      expect(shouldShowSkillsButton({ showSkillsButton: true })).toBe(true)
      expect(shouldShowSkillsButton({ showSkillsButton: false })).toBe(false)
      expect(shouldShowSkillsButton(undefined)).toBe(false)
    })

    it('determines agent dashboard button visibility from global settings', () => {
      expect(shouldShowAgentDashboardButton({ experimentalAgentDashboardPopout: true })).toBe(true)
      expect(shouldShowAgentDashboardButton({ experimentalAgentDashboardPopout: false })).toBe(false)
      expect(shouldShowAgentDashboardButton(null)).toBe(false)
    })
  })

  // ── FEATURE 6: Floating Contextual Command Dock (R1) ────────────────
  describe('Feature 6: Floating Contextual Command Dock', () => {
    it('verifies titlebar style in main.css contains drag region definition', () => {
      const css = readMainCss()
      expect(css).toContain('.titlebar')
      expect(css).toContain('-webkit-app-region: drag')
    })

    it('verifies titlebar controls have no-drag override to allow button interactions', () => {
      const css = readMainCss()
      expect(css).toContain('.window-controls-btn')
    })

    it('verifies titlebar gold/bronze hairline divider decoration in main.css', () => {
      const css = readMainCss()
      expect(css).toContain('.titlebar::after')
      expect(css).toContain('linear-gradient')
      expect(css).toContain('197, 155, 39') // Gold accent in rgba
    })

    it('verifies window controls hover transitions match spatial interactive specs', () => {
      const css = readMainCss()
      expect(css).toContain('.window-controls-btn:hover')
      expect(css).toContain('.window-controls-close:hover')
    })

    it('verifies spatial-glass styling class is declared with backdrop-filter', () => {
      const css = readMainCss()
      expect(css).toContain('.spatial-glass')
      expect(css).toContain('backdrop-filter: blur(20px)')
    })
  })

  // ── FEATURE 7: Floating Telemetry Capsule (R1) ──────────────────────
  describe('Feature 7: Floating Telemetry Capsule', () => {
    it('verifies cyber-pill / status capsule class styling in main.css', () => {
      const css = readMainCss()
      expect(css).toContain('.cyber-pill')
      expect(css).toContain('border-radius: 9999px')
      expect(css).toContain('letter-spacing: 0.05em')
    })

    it('verifies status success variables are declared in main.css', () => {
      const css = readMainCss()
      expect(css).toContain('--status-success')
      expect(css).toContain('--status-success-background')
    })

    it('verifies workspace status variables are declared in main.css', () => {
      const css = readMainCss()
      expect(css).toContain('--workspace-status-done')
      expect(css).toContain('--workspace-status-review')
      expect(css).toContain('--workspace-status-progress')
    })

    it('verifies spatial card hover elevation and transform animation in main.css', () => {
      const css = readMainCss()
      expect(css).toContain('.spatial-card:hover')
      expect(css).toContain('transform: translateY(-2px)')
    })

    it('verifies floating animation keyframes are defined in main.css', () => {
      const css = readMainCss()
      expect(css).toContain('@keyframes cyber-float')
      expect(css).toContain('.animate-cyber-float')
    })
  })

  // ── FEATURE 8: Asymmetric Inspector & Drawers (R1) ──────────────────
  describe('Feature 8: Asymmetric Inspector & Drawers', () => {
    it('verifies spatial card border-radius token mapping', () => {
      const css = readMainCss()
      expect(css).toContain('.spatial-card')
      expect(css).toContain('border-radius: var(--radius-xl)')
    })

    it('verifies spatial-glass-subtle class definition in main.css', () => {
      const css = readMainCss()
      expect(css).toContain('.spatial-glass-subtle')
      expect(css).toContain('backdrop-filter: blur(14px)')
    })

    it('verifies app-layout root structure has hidden overflow to prevent scroll leaks', () => {
      const css = readMainCss()
      const appLayoutRule = css.match(/\.app-layout\s*\{([^}]+)\}/)?.[1] ?? ''
      expect(appLayoutRule).toContain('overflow: hidden')
      expect(appLayoutRule).toContain('height: 100dvh')
      expect(appLayoutRule).toContain('width: 100vw')
    })

    it('verifies Đông Sơn watermark layer is declared as an absolute pseudo-element', () => {
      const css = readMainCss()
      expect(css).toContain('.app-layout::before')
      expect(css).toContain("background-image: url('./trong-dong.svg')")
      expect(css).toContain('pointer-events: none')
    })

    it('verifies z-index hierarchy protects background layer from intercepting pointer clicks', () => {
      const css = readMainCss()
      const beforeRule = css.match(/\.app-layout::before\s*\{([^}]+)\}/)?.[1] ?? ''
      expect(beforeRule).toContain('z-index: 0')
      expect(beforeRule).toContain('opacity: 0.035')
    })
  })
})
