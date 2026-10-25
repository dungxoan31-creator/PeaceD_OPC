// @vitest-environment happy-dom

import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { DongSonDivider } from './DongSonDivider'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

describe('DongSonDivider', () => {
  it('renders default horizontal motif divider with separator role', () => {
    const markup = renderToStaticMarkup(React.createElement(DongSonDivider))

    expect(markup).toContain('role="separator"')
    expect(markup).toContain('aria-orientation="horizontal"')
    expect(markup).toContain('svg')
    expect(markup).toContain('text-primary')
  })

  it('renders vertical divider when orientation is vertical', () => {
    const markup = renderToStaticMarkup(
      React.createElement(DongSonDivider, { orientation: 'vertical' })
    )

    expect(markup).toContain('role="separator"')
    expect(markup).toContain('aria-orientation="vertical"')
    expect(markup).toContain('flex-col')
  })

  it('renders pattern variant with border svg background', () => {
    const markup = renderToStaticMarkup(
      React.createElement(DongSonDivider, { variant: 'pattern' })
    )

    expect(markup).toContain('role="separator"')
    expect(markup).toContain('background-image:url(')
    expect(markup).toContain('bg-repeat-x')
  })

  it('renders vertical pattern variant with rotated background', () => {
    const markup = renderToStaticMarkup(
      React.createElement(DongSonDivider, { orientation: 'vertical', variant: 'pattern' })
    )

    expect(markup).toContain('role="separator"')
    expect(markup).toContain('aria-orientation="vertical"')
    expect(markup).toContain('bg-repeat-y')
  })

  it('renders solid hairline variant', () => {
    const markup = renderToStaticMarkup(
      React.createElement(DongSonDivider, { variant: 'solid' })
    )

    expect(markup).toContain('role="separator"')
    expect(markup).toContain('bg-gradient-to-r')
  })

  it('renders chevron motif variant', () => {
    const markup = renderToStaticMarkup(
      React.createElement(DongSonDivider, { motif: 'chevron' })
    )

    expect(markup).toContain('role="separator"')
    expect(markup).toContain('polyline')
  })

  it('renders children label centered in the divider', () => {
    const markup = renderToStaticMarkup(
      React.createElement(DongSonDivider, null, 'Cộng đồng // Community')
    )

    expect(markup).toContain('Cộng đồng // Community')
  })

  it('mounts into DOM cleanly without exceptions', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    try {
      await act(async () => {
        root.render(<DongSonDivider className="custom-test-divider">Tiêu đề // Title</DongSonDivider>)
      })
      const divider = container.querySelector('[role="separator"]')
      expect(divider).not.toBeNull()
      expect(divider?.className).toContain('custom-test-divider')
      expect(container.textContent).toContain('Tiêu đề // Title')
    } finally {
      act(() => root.unmount())
      container.remove()
    }
  })
})
