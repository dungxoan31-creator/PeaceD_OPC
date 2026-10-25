import type React from 'react'
import { cn } from '@/lib/utils'

export type CommandLifecycleState =
  | 'idle'
  | 'queued'
  | 'executing'
  | 'streaming'
  | 'completed'
  | 'error'

export type DongSonCommandIndicatorProps = {
  state?: CommandLifecycleState
  exitCode?: number | null
  className?: string
  size?: number
}

const STATE_TITLES: Record<CommandLifecycleState, string> = {
  idle: 'Sẵn sàng // Ready',
  queued: 'Chờ lệnh // Queued',
  executing: 'Đang thi hành // Executing',
  streaming: 'Đang truyền dữ liệu // Streaming Output',
  completed: 'Hoàn tất // Completed',
  error: 'Lỗi thi hành // Execution Error'
}

/** Đông Sơn circular command lifecycle indicator featuring the sacred 14-ray solar star. */
export function DongSonCommandIndicator({
  state = 'idle',
  exitCode = null,
  className,
  size = 14
}: DongSonCommandIndicatorProps): React.JSX.Element {
  const isSpinning = state === 'executing' || state === 'streaming'
  const isError = state === 'error'
  const isCompleted = state === 'completed'
  const isQueued = state === 'queued'

  const titleText = isError && exitCode !== null
    ? `${STATE_TITLES.error} (${exitCode})`
    : STATE_TITLES[state]

  return (
    <span
      role="status"
      title={titleText}
      aria-label={titleText}
      data-command-state={state}
      className={cn(
        'inline-flex items-center justify-center shrink-0 transition-colors',
        isError && 'text-destructive',
        isCompleted && 'text-primary',
        isQueued && 'text-primary animate-pulse motion-reduce:animate-none',
        isSpinning && 'text-primary',
        state === 'idle' && 'text-muted-foreground/60',
        className
      )}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className={cn(
          'select-none',
          isSpinning && 'animate-[spin_3s_linear_infinite] motion-reduce:animate-none'
        )}
        fill="currentColor"
        aria-hidden="true"
      >
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

        {/* Outer concentric relief ring */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeDasharray={isError ? '10, 4' : '3, 4'}
          opacity="0.8"
        />
      </svg>
      <span className="sr-only">{titleText}</span>
    </span>
  )
}

export default DongSonCommandIndicator
