import type React from 'react'
import trongDongSvg from '@/assets/trong-dong.svg'

type TrongDongPatternProps = {
  className?: string
  size?: number | string
  opacity?: number
  animate?: boolean
  position?: 'center' | 'bottom-right' | 'top-right' | 'bottom-left'
}

export function TrongDongPattern({
  className = '',
  size = 650,
  opacity = 0.05,
  animate = false,
  position = 'center'
}: TrongDongPatternProps): React.JSX.Element {
  const positionClass =
    position === 'bottom-right'
      ? 'items-end justify-end -bottom-24 -right-24'
      : position === 'top-right'
        ? 'items-start justify-end -top-24 -right-24'
        : position === 'bottom-left'
          ? 'items-end justify-start -bottom-24 -left-24'
          : 'items-center justify-center'

  return (
    <div
      className={`pointer-events-none absolute inset-0 flex overflow-hidden select-none z-0 text-primary ${positionClass} ${className}`}
      aria-hidden="true"
      style={{ opacity }}
    >
      <img
        src={trongDongSvg}
        alt=""
        style={{
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
          maxWidth: 'none'
        }}
        className={animate ? 'animate-[spin_240s_linear_infinite]' : ''}
      />
    </div>
  )
}

export default TrongDongPattern
