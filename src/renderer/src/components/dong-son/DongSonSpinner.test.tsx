// @vitest-environment happy-dom

import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { DongSonSpinner } from './DongSonSpinner'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

describe('DongSonSpinner', () => {
  it('renders with role="status" and default accessible label', () => {
    const markup = renderToStaticMarkup(React.createElement(DongSonSpinner))

    expect(markup).toContain('role="status"')
    expect(markup).toContain('Đang tải // Loading...')
    expect(markup).toContain('sr-only')
  })

  it('renders custom accessible label', () => {
    const markup = renderToStaticMarkup(
      React.createElement(DongSonSpinner, { label: 'Đang khởi tạo trạm lệnh...' })
    )

    expect(markup).toContain('Đang khởi tạo trạm lệnh...')
  })

  it('renders 14 solar rays for the Đông Sơn motif', () => {
    const markup = renderToStaticMarkup(React.createElement(DongSonSpinner))

    const polygonMatches = markup.match(/<polygon/g)
    expect(polygonMatches?.length).toBe(14)
  })

  it('includes motion-reduce:animate-none for accessibility', () => {
    const markup = renderToStaticMarkup(React.createElement(DongSonSpinner))

    expect(markup).toContain('motion-reduce:animate-none')
  })

  it('supports size presets and custom numeric sizes', () => {
    const markupSm = renderToStaticMarkup(React.createElement(DongSonSpinner, { size: 'sm' }))
    expect(markupSm).toContain('width="18"')
    expect(markupSm).toContain('height="18"')

    const markupLg = renderToStaticMarkup(React.createElement(DongSonSpinner, { size: 'lg' }))
    expect(markupLg).toContain('width="36"')
    expect(markupLg).toContain('height="36"')

    const markupCustom = renderToStaticMarkup(React.createElement(DongSonSpinner, { size: 52 }))
    expect(markupCustom).toContain('width="52"')
    expect(markupCustom).toContain('height="52"')
  })

  it('supports speed presets', () => {
    const markupFast = renderToStaticMarkup(React.createElement(DongSonSpinner, { speed: 'fast' }))
    expect(markupFast).toContain('animate-[spin_2.5s_linear_infinite]')

    const markupSlow = renderToStaticMarkup(React.createElement(DongSonSpinner, { speed: 'slow' }))
    expect(markupSlow).toContain('animate-[spin_8s_linear_infinite]')
  })

  it('supports variant="star"', () => {
    const markupStar = renderToStaticMarkup(React.createElement(DongSonSpinner, { variant: 'star' }))
    expect(markupStar).toContain('role="status"')
    expect(markupStar).toContain('polygon')
  })

  it('mounts into DOM cleanly without exceptions', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    try {
      await act(async () => {
        root.render(<DongSonSpinner className="custom-spinner-class" size="md" />)
      })
      const spinner = container.querySelector('[role="status"]')
      expect(spinner).not.toBeNull()
      expect(spinner?.className).toContain('custom-spinner-class')
      expect(container.querySelector('svg')).not.toBeNull()
    } finally {
      act(() => root.unmount())
      container.remove()
    }
  })
})
