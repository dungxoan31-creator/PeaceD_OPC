import type React from 'react'
import trongDongBorderSvg from '@/assets/trong-dong-border.svg'
import { cn } from '@/lib/utils'

export type DongSonDividerProps = {
  className?: string
  orientation?: 'horizontal' | 'vertical'
  variant?: 'motif' | 'pattern' | 'solid'
  motif?: 'star' | 'chevron'
  children?: React.ReactNode
}

/**
 * An authentic Đông Sơn cultural divider featuring bronze solar star
 * or chevron motifs, or procedural repeating drum border patterns.
 */
export function DongSonDivider({
  className,
  orientation = 'horizontal',
  variant = 'motif',
  motif = 'star',
  children
}: DongSonDividerProps): React.JSX.Element {
  const isVertical = orientation === 'vertical'

  if (variant === 'pattern') {
    if (isVertical) {
      return (
        <div
          role="separator"
          aria-orientation="vertical"
          className={cn(
            'w-3 self-stretch opacity-35 bg-repeat-y bg-contain select-none',
            className
          )}
          style={{ backgroundImage: `url(${trongDongBorderSvg})`, transform: 'rotate(90deg)' }}
          aria-hidden="true"
        />
      )
    }

    return (
      <div
        role="separator"
        aria-orientation="horizontal"
        className={cn(
          'h-3 w-full opacity-35 overflow-hidden bg-repeat-x bg-contain select-none',
          className
        )}
        style={{ backgroundImage: `url(${trongDongBorderSvg})` }}
        aria-hidden="true"
      />
    )
  }

  if (variant === 'solid') {
    if (isVertical) {
      return (
        <div
          role="separator"
          aria-orientation="vertical"
          className={cn(
            'w-px self-stretch bg-gradient-to-b from-transparent via-border to-transparent',
            className
          )}
          aria-hidden="true"
        />
      )
    }

    return (
      <div
        role="separator"
        aria-orientation="horizontal"
        className={cn(
          'h-px w-full bg-gradient-to-r from-transparent via-border to-transparent',
          className
        )}
        aria-hidden="true"
      />
    )
  }

  // Variant: 'motif' (default)
  if (isVertical) {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={cn('flex flex-col items-center justify-center self-stretch py-2', className)}
      >
        <div className="w-px flex-1 bg-gradient-to-b from-transparent via-border to-border" />
        <div className="my-2 flex flex-col items-center justify-center text-primary">
          {motif === 'star' ? <DongSonSolarStarOrnament /> : <DongSonChevronOrnament isVertical />}
          {children && (
            <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground select-none">
              {children}
            </span>
          )}
        </div>
        <div className="w-px flex-1 bg-gradient-to-t from-transparent via-border to-border" />
      </div>
    )
  }

  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={cn('flex items-center justify-center w-full px-2', className)}
    >
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-border" />
      <div className="mx-3 flex items-center gap-2 text-primary">
        {motif === 'star' ? <DongSonSolarStarOrnament /> : <DongSonChevronOrnament />}
        {children && (
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground select-none">
            {children}
          </span>
        )}
        {children && (
          motif === 'star' ? <DongSonSolarStarOrnament /> : <DongSonChevronOrnament />
        )}
      </div>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent via-border to-border" />
    </div>
  )
}

/**
 * High-precision 14-pointed Đông Sơn solar star emblem.
 */
function DongSonSolarStarOrnament(): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 40 40"
      className="size-4 shrink-0 transition-transform group-hover:rotate-12 duration-500"
      fill="currentColor"
      aria-hidden="true"
    >
      {/* Central drum tympanum disc */}
      <circle cx="20" cy="20" r="4.2" fill="currentColor" />
      {/* 14 Sacred Solar Rays */}
      {Array.from({ length: 14 }).map((_, i) => {
        const angle = (i * 360) / 14
        return (
          <polygon
            key={i}
            points="20,6 18,15 22,15"
            transform={`rotate(${angle} 20 20)`}
            fill="currentColor"
            opacity="0.9"
          />
        )
      })}
      {/* Beaded concentric orbit */}
      <circle
        cx="20"
        cy="20"
        r="17.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.45"
        strokeDasharray="2, 2.5"
      />
    </svg>
  )
}

/**
 * Geometric chevron motif inspired by Đông Sơn bronze drum relief bands.
 */
function DongSonChevronOrnament({ isVertical = false }: { isVertical?: boolean }): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 32 16"
      className={cn('h-2.5 w-5 shrink-0 opacity-80', isVertical && 'rotate-90')}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="4,11 10,5 16,11" />
      <polyline points="16,11 22,5 28,11" />
    </svg>
  )
}

export default DongSonDivider
