import { Building2, Minimize2, PanelRight, TerminalSquare } from 'lucide-react'
import { translate } from '@/i18n/i18n'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { TOGGLE_TERMINAL_PANE_EXPAND_EVENT } from '@/constants/terminal'
import { ActivityTitlebarControls } from '../components/activity/ActivityTitlebarControls'
import { useShortcutLabel } from '../hooks/useShortcutLabel'
import { useAppStore } from '../store'
import { hasCustomTitleBar } from './app-window-chrome'
import { cn } from '@/lib/utils'
import type { AppChromeLayout } from './use-app-chrome-layout'

export function WorkspaceStudioModeToggle(): React.JSX.Element {
  const activeView = useAppStore((s) => s.activeView)
  const setActiveView = useAppStore((s) => s.setActiveView)
  const openOrgPage = useAppStore((s) => s.openOrgPage)

  return (
    <div className="flex items-center gap-1 mx-2 select-none shrink-0 bg-glass-surface/60 backdrop-blur-md p-1 rounded-full border border-glass-border shadow-xs">
      <button
        type="button"
        onClick={() => setActiveView('terminal')}
        aria-label="Terminal"
        className={cn(
          'flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer',
          activeView === 'terminal'
            ? 'bg-primary/20 text-primary border border-primary/40 shadow-xs'
            : 'text-muted-foreground hover:text-foreground hover:bg-glass-surface/40'
        )}
      >
        <TerminalSquare className="size-3" />
        <span>Terminal</span>
      </button>
      <button
        type="button"
        onClick={openOrgPage}
        aria-label="Org Studio"
        className={cn(
          'flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer',
          activeView === 'org'
            ? 'bg-ai-action-accent/20 text-ai-action-accent border border-ai-action-accent/40 shadow-xs'
            : 'text-muted-foreground hover:text-ai-action-accent hover:bg-glass-surface/40'
        )}
      >
        <Building2 className="size-3" />
        <span>Org Studio</span>
      </button>
    </div>
  )
}

export function RightSidebarToggle(): React.JSX.Element {
  const toggleRightSidebar = useAppStore((s) => s.toggleRightSidebar)
  const rightSidebarShortcutLabel = useShortcutLabel('sidebar.right.toggle')
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          className="sidebar-toggle mr-2"
          onClick={toggleRightSidebar}
          aria-label={translate('auto.App.9e0b441a91', 'Toggle right sidebar')}
        >
          <PanelRight size={16} />
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={6}>
        {translate('auto.App.c184e056de', 'Inspector ({{value0}})', {
          value0: rightSidebarShortcutLabel
        })}
      </TooltipContent>
    </Tooltip>
  )
}

/** The titlebar's center/right strip: the tab-strip portal slot and the trailing chrome buttons. */
export function TitlebarMainStrip({ layout }: { layout: AppChromeLayout }): React.JSX.Element {
  const handleToggleExpand = (): void => {
    if (!layout.effectiveActiveTabId) {
      return
    }
    window.dispatchEvent(
      new CustomEvent(TOGGLE_TERMINAL_PANE_EXPAND_EVENT, {
        detail: { tabId: layout.effectiveActiveTabId }
      })
    )
  }

  return (
    <>
      {layout.activeView === 'activity' ? (
        <ActivityTitlebarControls />
      ) : layout.creationLayoutActive ? null : (
        <div
          data-command-bar="Command Bar"
          className="flex flex-1 min-w-0 items-center self-stretch"
        >
          <div
            id="titlebar-tabs"
            className={`flex flex-1 min-w-0 self-stretch${!layout.workspaceChromeActive ? ' invisible pointer-events-none' : ''}`}
          />
          {layout.workspaceChromeActive && <WorkspaceStudioModeToggle />}
        </div>
      )}
      {layout.showTitlebarExpandButton && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="titlebar-icon-button"
              onClick={handleToggleExpand}
              aria-label={translate('auto.App.c1cf0b0e4a', 'Collapse pane')}
              disabled={!layout.activeTabCanExpand}
            >
              <Minimize2 size={14} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={6}>
            {translate('auto.App.c1cf0b0e4a', 'Collapse pane')}
          </TooltipContent>
        </Tooltip>
      )}
      {/* Why: the open right sidebar's header renders its own close button, so hide this duplicate. */}
      {layout.showRightSidebarControls && !layout.rightSidebarOpen ? <RightSidebarToggle /> : null}
      {/* Why: reserve space so the Windows/Linux window-controls overlay doesn't obscure content. */}
      {hasCustomTitleBar && <div className="window-controls-titlebar-spacer" />}
    </>
  )
}
