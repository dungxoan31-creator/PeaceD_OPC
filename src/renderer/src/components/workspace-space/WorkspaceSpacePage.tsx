import { useEffect } from 'react'
import { ArrowLeft, HardDrive } from 'lucide-react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { WorkspaceSpaceManagerPanel } from '../status-bar/WorkspaceSpaceManagerPanel'
import { useAppStore } from '../../store'
import { hasVisibleOverlay } from '@/lib/visible-overlay'
import { translate } from '@/i18n/i18n'
import { Spatial3DScene } from '../spatial/Spatial3DScene'

export default function WorkspaceSpacePage(): React.JSX.Element {
  const closeSpacePage = useAppStore((state) => state.closeSpacePage)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') {
        return
      }
      // Why: confirmation dialogs own Escape first; page-level Escape should
      // only leave the full Space surface when no modal or popover is active.
      if (hasVisibleOverlay()) {
        return
      }
      const target = event.target as HTMLElement | null
      if (
        target?.matches('input, textarea, select, [contenteditable="true"], [contenteditable=""]')
      ) {
        return
      }
      event.preventDefault()
      closeSpacePage()
    }

    // Why: tooltips can consume Escape before bubble listeners see it. Capture
    // keeps the first Escape reliable while still deferring to real overlays.
    window.addEventListener('keydown', handleKeyDown, { capture: true })
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true })
  }, [closeSpacePage])

  return (
    <div className="relative flex h-full min-h-0 flex-col bg-background overflow-hidden">
      <Spatial3DScene intensity="subtle" showCore={false} particleCount={140} />
      <div className="relative z-10 flex h-full min-h-0 flex-col flex-1 overflow-hidden">
        <div className="spatial-glass flex shrink-0 items-center gap-3 px-5 py-3.5 border-b border-glass-border">
          <Button
            variant="outline"
            size="sm"
            onClick={closeSpacePage}
            className="shrink-0"
          >
            <ArrowLeft className="size-3.5" />
            {translate('auto.components.workspace.space.WorkspaceSpacePage.ecf72fdc3b', 'Back')}
          </Button>
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-glass-border bg-glass-surface/80 glow-gold">
              <HardDrive className="size-4 text-primary" />
            </div>
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <h1 className="truncate text-base font-semibold text-foreground">
                  {translate(
                    'auto.components.workspace.space.WorkspaceSpacePage.45f6302dbc',
                    'Kho đĩa // Disk Space'
                  )}
                </h1>
                <Badge variant="outline">
                  {translate('auto.components.workspace.space.WorkspaceSpacePage.e8d6ba11ab', 'Beta')}
                </Badge>
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {translate(
                  'auto.components.workspace.space.WorkspaceSpacePage.8d0048e1cb',
                  'Workspace disk usage and reclaimable worktree storage.'
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 scrollbar-sleek">
          <div className="mx-auto max-w-7xl">
            <WorkspaceSpaceManagerPanel />
          </div>
        </div>
      </div>
    </div>
  )
}
