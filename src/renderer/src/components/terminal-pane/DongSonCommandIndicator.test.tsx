// @vitest-environment happy-dom

import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { DongSonCommandIndicator } from './DongSonCommandIndicator'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

describe('DongSonCommandIndicator', () => {
  it('renders default idle state with role="status"', () => {
    const markup = renderToStaticMarkup(React.createElement(DongSonCommandIndicator))
    expect(markup).toContain('role="status"')
    expect(markup).toContain('data-command-state="idle"')
    expect(markup).toContain('Sẵn sàng // Ready')
  })

  it('renders all 6 command lifecycle states with correct labels', () => {
    const states = [
      { state: 'idle', label: 'Sẵn sàng // Ready' },
      { state: 'queued', label: 'Chờ lệnh // Queued' },
      { state: 'executing', label: 'Đang thi hành // Executing' },
      { state: 'streaming', label: 'Đang truyền dữ liệu // Streaming Output' },
      { state: 'completed', label: 'Hoàn tất // Completed' },
      { state: 'error', label: 'Lỗi thi hành // Execution Error' }
    ] as const

    for (const { state, label } of states) {
      const markup = renderToStaticMarkup(
        React.createElement(DongSonCommandIndicator, { state })
      )
      expect(markup).toContain(`data-command-state="${state}"`)
      expect(markup).toContain(label)
    }
  })

  it('formats non-zero exit codes in error state label', () => {
    const markup = renderToStaticMarkup(
      React.createElement(DongSonCommandIndicator, { state: 'error', exitCode: 127 })
    )
    expect(markup).toContain('Lỗi thi hành // Execution Error (127)')
  })

  it('applies animation classes for active execution states and respects reduced motion', () => {
    const markupExecuting = renderToStaticMarkup(
      React.createElement(DongSonCommandIndicator, { state: 'executing' })
    )
    expect(markupExecuting).toContain('animate-[spin_3s_linear_infinite]')
    expect(markupExecuting).toContain('motion-reduce:animate-none')

    const markupStreaming = renderToStaticMarkup(
      React.createElement(DongSonCommandIndicator, { state: 'streaming' })
    )
    expect(markupStreaming).toContain('animate-[spin_3s_linear_infinite]')
  })

  it('renders 14 solar ray polygons', () => {
    const markup = renderToStaticMarkup(React.createElement(DongSonCommandIndicator))
    const polygonCount = markup.match(/<polygon/g)?.length ?? 0
    expect(polygonCount).toBe(14)
  })

  it('mounts into DOM cleanly without exceptions', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    try {
      await act(async () => {
        root.render(<DongSonCommandIndicator state="executing" size={16} />)
      })
      const indicator = container.querySelector('[role="status"]')
      expect(indicator).not.toBeNull()
      expect(indicator?.getAttribute('data-command-state')).toBe('executing')
    } finally {
      act(() => root.unmount())
      container.remove()
    }
  })
})
