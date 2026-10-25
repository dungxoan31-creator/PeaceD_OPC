import { describe, expect, it } from 'vitest'
import { buildAppFontFamily } from './app-font-family'

describe('buildAppFontFamily', () => {
  it('defaults to the bundled app font', () => {
    expect(buildAppFontFamily('')).toBe(
      '"Be Vietnam Pro", "Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    )
  })

  it('places a custom UI font before the fallback chain', () => {
    expect(buildAppFontFamily('Inter')).toBe(
      '"Inter", "Be Vietnam Pro", "Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    )
  })

  it('does not duplicate the bundled font when selected explicitly', () => {
    expect(buildAppFontFamily('Be Vietnam Pro')).toBe(
      '"Be Vietnam Pro", "Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    )
  })
})
