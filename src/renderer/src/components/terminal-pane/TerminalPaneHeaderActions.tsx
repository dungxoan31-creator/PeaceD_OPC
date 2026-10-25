import type React from 'react'
import {
  MessageSquare,
  MessageSquarePlus,
  SquareSplitVertical,
  SquareTerminal,
  X
} from 'lucide-react'
import type { ManagedPane } from '@/lib/pane-manager/pane-manager'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { translate } from '@/i18n/i18n'

export type TerminalPaneHeaderActionsProps = {
  pane: ManagedPane
  isActivePane: boolean
  title?: string
  paneCount: number
  showAlwaysOnHeaders: boolean
  showSplitButton: boolean
  splitRightLabel: string
  canContinueAgentSessionInNewSession?: boolean
  onContinueAgentSessionInNewSession?: (pane: ManagedPane) => void
  canToggleNativeChat?: boolean
  isChatViewMode?: boolean
  onToggleNativeChat?: () => void
  onSplitPane: (pane: ManagedPane, direction: 'vertical' | 'horizontal') => void
  onRemoveTitle: (paneId: number) => void
  onClosePane: (paneId: number) => void
}

/** Action buttons rendered on the right side of a terminal pane header. */
export function TerminalPaneHeaderActions({
  pane,
  isActivePane,
  title,
  paneCount,
  showAlwaysOnHeaders,
  showSplitButton,
  splitRightLabel,
  canContinueAgentSessionInNewSession,
  onContinueAgentSessionInNewSession,
  canToggleNativeChat,
  isChatViewMode,
  onToggleNativeChat,
  onSplitPane,
  onRemoveTitle,
  onClosePane
}: TerminalPaneHeaderActionsProps): React.JSX.Element {
  return (
    <div className="pane-title-actions ml-auto flex shrink-0 items-center gap-0">
      {canContinueAgentSessionInNewSession && isActivePane ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="pane-title-split-trigger inline-flex size-6 shrink-0 items-center justify-center rounded-md cursor-pointer transition-colors hover:bg-accent hover:text-accent-foreground outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
              aria-label={translate(
                'components.agentSessionContinuation.continueInNewSession',
                'Continue in New Session…'
              )}
              onClick={(event) => {
                event.stopPropagation()
                onContinueAgentSessionInNewSession?.(pane)
              }}
            >
              <MessageSquarePlus className="size-3" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={4}>
            {translate(
              'components.agentSessionContinuation.continueInNewSession',
              'Continue in New Session…'
            )}
          </TooltipContent>
        </Tooltip>
      ) : null}
      {canToggleNativeChat && isActivePane ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              // Same class as split so it shares the hover/active reveal
              // and sits as a peer in the [chat][split][×] cluster.
              className="pane-title-split-trigger inline-flex size-6 shrink-0 items-center justify-center rounded-md cursor-pointer transition-colors hover:bg-accent hover:text-accent-foreground outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
              aria-label={
                isChatViewMode
                  ? translate(
                      'components.native-chat.toggle.showTerminal',
                      'Show terminal'
                    )
                  : translate(
                      'components.native-chat.toggle.showChat',
                      'Show chat view'
                    )
              }
              aria-pressed={isChatViewMode}
              onClick={(event) => {
                event.stopPropagation()
                onToggleNativeChat?.()
              }}
            >
              {isChatViewMode ? (
                <SquareTerminal className="size-3" />
              ) : (
                <MessageSquare className="size-3" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={4}>
            {isChatViewMode
              ? translate('components.native-chat.toggle.showTerminal', 'Show terminal')
              : translate('components.native-chat.toggle.showChat', 'Show chat view')}
          </TooltipContent>
        </Tooltip>
      ) : null}
      {showAlwaysOnHeaders && showSplitButton ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="pane-title-split-trigger inline-flex size-6 shrink-0 items-center justify-center rounded-md cursor-pointer transition-colors hover:bg-accent hover:text-accent-foreground outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
              data-contextual-tour-target={
                isActivePane ? 'terminal-pane-split-target' : undefined
              }
              aria-label={splitRightLabel}
              onClick={(event) => {
                event.stopPropagation()
                onSplitPane(pane, 'vertical')
              }}
            >
              <SquareSplitVertical className="size-3" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={4}>
            {splitRightLabel}
          </TooltipContent>
        </Tooltip>
      ) : null}
      {title ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="pane-title-close inline-flex size-6 shrink-0 items-center justify-center rounded-md cursor-pointer transition-colors hover:bg-accent hover:text-accent-foreground outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
              onClick={(event) => {
                event.stopPropagation()
                onRemoveTitle(pane.id)
              }}
              aria-label={translate(
                'auto.components.terminal.pane.TerminalPane.f984ab2a30',
                'Remove pane title: {{value0}}',
                { value0: title }
              )}
            >
              <X className="size-3" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={4}>
            {translate(
              'auto.components.terminal.pane.TerminalPane.ac112e9036',
              'Remove title'
            )}
          </TooltipContent>
        </Tooltip>
      ) : paneCount > 1 && showAlwaysOnHeaders ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="pane-title-close inline-flex size-6 shrink-0 items-center justify-center rounded-md cursor-pointer transition-colors hover:bg-accent hover:text-accent-foreground outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
              onClick={(event) => {
                event.stopPropagation()
                onClosePane(pane.id)
              }}
              aria-label={translate(
                'auto.components.terminal.pane.TerminalContextMenu.8c17d6786d',
                'Close Pane'
              )}
            >
              <X className="size-3" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={4}>
            {translate(
              'auto.components.terminal.pane.TerminalContextMenu.8c17d6786d',
              'Close Pane'
            )}
          </TooltipContent>
        </Tooltip>
      ) : null}
    </div>
  )
}
