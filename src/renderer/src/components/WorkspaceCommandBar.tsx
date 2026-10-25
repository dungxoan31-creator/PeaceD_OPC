import React from 'react'
import { Building2, ChevronRight, GitBranch, ListTodo, TerminalSquare, Zap } from 'lucide-react'
import { useAppStore } from '@/store'
import { cn } from '@/lib/utils'

export function WorkspaceCommandBar({ worktreeId }: { worktreeId: string | null }): React.JSX.Element | null {
  const activeView = useAppStore((s) => s.activeView)
  const setActiveView = useAppStore((s) => s.setActiveView)
  const openOrgPage = useAppStore((s) => s.openOrgPage)
  const openTaskPage = useAppStore((s) => s.openTaskPage)
  const openAutomationsPage = useAppStore((s) => s.openAutomationsPage)
  const worktreesByRepo = useAppStore((s) => s.worktreesByRepo)
  const repos = useAppStore((s) => s.repos)

  if (!worktreeId) {
    return null
  }

  // Find the worktree object
  let currentWorktree: { displayName?: string; branch?: string; repoId?: string } | undefined
  for (const repoWorktrees of Object.values(worktreesByRepo)) {
    const found = repoWorktrees.find((w) => w.id === worktreeId)
    if (found) {
      currentWorktree = found
      break
    }
  }

  const currentRepo = currentWorktree?.repoId
    ? repos.find((r) => r.id === currentWorktree?.repoId)
    : undefined

  const projectName = currentWorktree?.displayName || currentRepo?.displayName || 'Workspace'
  const branchName = (currentWorktree as { branch?: string })?.branch || 'master'

  return (
    <div className="flex h-9 items-center justify-between border-b border-border/50 bg-card/60 px-3 select-none backdrop-blur-xs shrink-0 text-xs">
      {/* Left: Project & Branch breadcrumb */}
      <div className="flex items-center gap-2 min-w-0">
        <div className="flex items-center gap-1.5 font-semibold text-foreground truncate">
          <div className="flex size-4 items-center justify-center rounded bg-amber-500/20 text-amber-500 text-[10px] font-black">
            O
          </div>
          <span className="truncate">{projectName}</span>
        </div>
        <ChevronRight className="size-3 text-muted-foreground/50 shrink-0" />
        <div className="flex items-center gap-1 rounded bg-muted/60 px-1.5 py-0.5 text-muted-foreground shrink-0 text-[11px]">
          <GitBranch className="size-3 text-muted-foreground/70" />
          <span className="truncate max-w-[120px]">{branchName}</span>
        </div>
      </div>

      {/* Center: Fast View Mode Switcher */}
      <div className="flex items-center gap-1 bg-background/80 p-0.5 rounded-lg border border-border/40 shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveView('terminal')}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all',
            activeView === 'terminal'
              ? 'bg-card text-foreground shadow-xs font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <TerminalSquare className="size-3.5 text-blue-500" />
          <span>Console</span>
        </button>
        <button
          type="button"
          onClick={openOrgPage}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all',
            activeView === 'org'
              ? 'bg-amber-500/15 text-amber-500 shadow-xs font-semibold'
              : 'text-muted-foreground hover:text-amber-500'
          )}
        >
          <Building2 className="size-3.5 text-amber-500" />
          <span>Org Studio</span>
        </button>
        <button
          type="button"
          onClick={() => openTaskPage()}
          className={cn(
            'flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium transition-all',
            activeView === 'tasks'
              ? 'bg-card text-foreground shadow-xs font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <ListTodo className="size-3.5 text-purple-500" />
          <span>Tasks</span>
        </button>
        <button
          type="button"
          onClick={openAutomationsPage}
          className={cn(
            'flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium transition-all',
            activeView === 'automations'
              ? 'bg-card text-foreground shadow-xs font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Zap className="size-3.5 text-emerald-500" />
          <span>Automations</span>
        </button>
      </div>

      {/* Right: Agent Fleet Status chip */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[11px] font-medium text-emerald-500">
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Fleet Active</span>
        </div>
      </div>
    </div>
  )
}
