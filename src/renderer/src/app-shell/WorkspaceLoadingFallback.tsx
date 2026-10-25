import { translate } from '@/i18n/i18n'

/**
 * Lightweight, token-compliant loading skeleton displayed during workspace and page transitions.
 * Eliminates blank voids and layout shifts while lazy modules or sessions are in flight.
 */
export function WorkspaceLoadingFallback(): React.JSX.Element {
  return (
    <div
      className="flex flex-1 flex-col h-full w-full bg-background select-none overflow-hidden"
      data-testid="workspace-loading-fallback"
    >
      {/* Faux tab strip shimmer */}
      <div className="flex h-9 items-center border-b border-border/50 px-3 gap-2 bg-muted/20 shrink-0">
        <div className="h-5 w-24 rounded-md bg-muted/50 animate-pulse" />
        <div className="h-5 w-32 rounded-md bg-muted/30 animate-pulse" />
      </div>

      {/* Main pane skeleton */}
      <div className="flex flex-1 flex-col items-center justify-center p-6 space-y-4">
        <div className="relative flex items-center justify-center size-12 rounded-2xl bg-primary/10 border border-primary/20">
          <div className="size-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        </div>
        <div className="space-y-1.5 text-center">
          <p className="text-xs font-medium text-foreground/80 tracking-wide">
            {translate('app.startup.loadingWorkspace', 'Loading workspace...')}
          </p>
          <p className="text-[11px] text-muted-foreground/60">
            {translate('app.startup.restoringSession', 'Restoring environment and session state')}
          </p>
        </div>
      </div>
    </div>
  )
}
