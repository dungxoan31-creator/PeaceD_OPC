import type React from 'react'
import { cn } from '@/lib/utils'

export type DongSonSpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number

export type DongSonSpinnerProps = {
  className?: string
  size?: DongSonSpinnerSize
  variant?: 'drum' | 'star'
  speed?: 'normal' | 'slow' | 'fast'
  label?: string
}

const SIZE_MAP: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', number> = {
  xs: 14,
  sm: 18,
  md: 24,
  lg: 36,
  xl: 48
}

const SPEED_MAP: Record<'normal' | 'slow' | 'fast', string> = {
  fast: 'animate-[spin_2.5s_linear_infinite]',
  normal: 'animate-[spin_5s_linear_infinite]',
  slow: 'animate-[spin_8s_linear_infinite]'
}

/**
 * Concentric bronze drum spinner for loading and streaming states,
 * featuring an authentic 14-pointed solar star and concentric relief rings.
 */
export function DongSonSpinner({
  className,
  size = 'md',
  variant = 'drum',
  speed = 'normal',
  label = 'Đang tải // Loading...'
}: DongSonSpinnerProps): React.JSX.Element {
  const pixelSize = typeof size === 'number' ? size : SIZE_MAP[size] ?? 24
  const animationClass = SPEED_MAP[speed] ?? SPEED_MAP.normal

  return (
    <span
      role="status"
      className={cn('inline-flex items-center justify-center shrink-0 text-primary', className)}
    >
      <svg
        width={pixelSize}
        height={pixelSize}
        viewBox="0 0 100 100"
        className={cn(animationClass, 'motion-reduce:animate-none select-none')}
        fill="currentColor"
        aria-hidden="true"
      >
        {/* Central Drum Core Disc */}
        <circle cx="50" cy="50" r="9" fill="currentColor" opacity="0.95" />

        {/* 14 Sacred Solar Rays */}
        {Array.from({ length: 14 }).map((_, i) => {
          const angle = (i * 360) / 14
          return (
            <polygon
              key={i}
              points="50,15 45.5,37 54.5,37"
              transform={`rotate(${angle} 50 50)`}
              fill="currentColor"
              opacity="0.9"
            />
          )
        })}

        {/* Concentric Relief Band 1: Beaded circle */}
        <circle
          cx="50"
          cy="50"
          r="38"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeDasharray="2.5, 4"
          opacity="0.6"
        />

        {variant === 'drum' && (
          <>
            {/* Concentric Relief Band 2: Tangent dots */}
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = (i * 360) / 8
              return (
                <circle
                  key={i}
                  cx="50"
                  cy="7"
                  r="1.8"
                  transform={`rotate(${angle} 50 50)`}
                  fill="currentColor"
                  opacity="0.75"
                />
              )
            })}

            {/* Concentric Relief Band 3: Outer Drum Rim */}
            <circle
              cx="50"
              cy="50"
              r="46.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="14, 5"
              opacity="0.85"
            />
          </>
        )}
      </svg>
      <span className="sr-only">{label}</span>
    </span>
  )
}

export default DongSonSpinner
