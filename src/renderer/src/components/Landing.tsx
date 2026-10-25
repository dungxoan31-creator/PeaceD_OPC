import { Suspense, useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  Cpu,
  ExternalLink,
  FolderPlus,
  GitBranchPlus,
  Radio,
  ShieldCheck,
  Sparkles,
  Zap,
  X
} from 'lucide-react'
import { useAppStore } from '../store'
import { isGitRepoKind } from '../../../shared/repo-kind'
import type { Repo } from '../../../shared/repo-types'
import {
  dismissPreflightIssue,
  githubProjectKeys,
  isPreflightIssueDismissed
} from './landing-preflight-dismissal'
import { ShortcutKeyCombo } from './ShortcutKeyCombo'
import { useShortcutKeyDetails, type ShortcutKeyComboDetails } from '@/hooks/useShortcutLabel'
import logo from '../../../../resources/logo.svg'
import { translate } from '@/i18n/i18n'
import type { PreflightIssue } from './landing-preflight-issues'
import { useLandingPreflightRuntime } from './landing-preflight-runtime'
import { TrongDongPattern } from './TrongDongPattern'
import { lazyWithRetry as lazy } from '@/lib/lazy-with-retry'

const Spatial3DScene = lazy(() =>
  import('./spatial/Spatial3DScene').then((module) => ({ default: module.Spatial3DScene }))
)

type ShortcutItem = {
  id: string
  shortcut: ShortcutKeyComboDetails
  action: string
}

function PreflightBanner({
  issues,
  repos
}: {
  issues: PreflightIssue[]
  repos: readonly Repo[]
}): React.JSX.Element | null {
  const githubKey = githubProjectKeys(repos).join('|')
  const [dismissed, setDismissed] = useState<Set<string>>(
    () =>
      new Set(
        issues
          .filter((issue) => issue.dismissible && isPreflightIssueDismissed(issue.id, repos))
          .map((issue) => issue.id)
      )
  )

  useEffect(() => {
    setDismissed(
      new Set(
        issues
          .filter((issue) => issue.dismissible && isPreflightIssueDismissed(issue.id, repos))
          .map((issue) => issue.id)
      )
    )
  }, [githubKey, issues, repos])

  const visibleIssues = issues.filter((issue) => !dismissed.has(issue.id))
  if (visibleIssues.length === 0) {
    return null
  }

  const dismiss = (issue: PreflightIssue): void => {
    dismissPreflightIssue(issue.id, repos)
    setDismissed((prev) => new Set(prev).add(issue.id))
  }

  return (
    <div className="w-full max-w-xl space-y-2 rounded-2xl border border-glass-border bg-glass-surface/80 p-4 mb-4 backdrop-blur-xl spatial-glass">
      {visibleIssues.map((issue) => (
        <div
          key={issue.id}
          className="flex items-start gap-3 rounded-xl p-2.5 bg-background/40 border border-glass-border/40"
        >
          <div className="size-8 rounded-lg bg-neon-amber/15 border border-neon-amber/30 flex items-center justify-center shrink-0 text-neon-amber">
            <AlertTriangle className="size-4" />
          </div>
          <div className="min-w-0 flex-1 space-y-0.5">
            <p className="text-[13px] font-semibold leading-snug text-foreground">{issue.title}</p>
            <p className="text-xs leading-snug text-muted-foreground">{issue.description}</p>
            <button
              type="button"
              className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer"
              onClick={() => window.api.shell.openUrl(issue.fixUrl)}
            >
              <span>{issue.fixLabel}</span>
              <ExternalLink className="size-3" />
            </button>
          </div>
          {issue.dismissible && (
            <button
              type="button"
              className="shrink-0 rounded-lg p-1.5 text-muted-foreground/70 transition-colors hover:bg-glass-surface hover:text-foreground cursor-pointer"
              onClick={() => dismiss(issue)}
              aria-label={translate('auto.components.Landing.preflightDismiss', 'Dismiss')}
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

export default function Landing(): React.JSX.Element {
  const repos = useAppStore((s) => s.repos)
  const openModal = useAppStore((s) => s.openModal)
  const openOrgPage = useAppStore((s) => s.openOrgPage)

  const createTargetLabel =
    repos.length > 0 && repos.every((repo) => isGitRepoKind(repo)) ? 'Worktree' : 'Workspace'

  const { preflightIssues } = useLandingPreflightRuntime()

  const createWorktreeShortcut = useShortcutKeyDetails('workspace.create')
  const previousWorktreeShortcut = useShortcutKeyDetails('worktree.navigateUp')
  const nextWorktreeShortcut = useShortcutKeyDetails('worktree.navigateDown')
  const shortcuts = useMemo<ShortcutItem[]>(() => {
    return [
      {
        id: 'create',
        shortcut: createWorktreeShortcut,
        action: `Create ${createTargetLabel.toLowerCase()}`
      },
      { id: 'up', shortcut: previousWorktreeShortcut, action: 'Move up workspace' },
      { id: 'down', shortcut: nextWorktreeShortcut, action: 'Move down workspace' }
    ]
  }, [createTargetLabel, createWorktreeShortcut, nextWorktreeShortcut, previousWorktreeShortcut])

  const [shouldMount3DScene, setShouldMount3DScene] = useState(false)

  useEffect(() => {
    // Why: defer 3D WebGL scene until after initial paint and window is visible.
    let timer: ReturnType<typeof setTimeout> | null = null
    const tryMount = (): void => {
      if (document.visibilityState === 'hidden') {
        return
      }
      setShouldMount3DScene(true)
    }

    if (document.visibilityState !== 'hidden') {
      timer = setTimeout(tryMount, 300)
    }

    const onVisibilityChange = (): void => {
      if (document.visibilityState !== 'hidden') {
        tryMount()
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      if (timer) {
        clearTimeout(timer)
      }
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  return (
    <div className="relative inset-0 flex flex-col items-center justify-center bg-spatial-bg p-6 overflow-y-auto scrollbar-sleek">
      {/* 3D Spatial Scene with interactive gyro-core, floating particles and mouse parallax */}
      {shouldMount3DScene ? (
        <Suspense fallback={null}>
          <Spatial3DScene intensity="vibrant" showCore={true} particleCount={320} />
        </Suspense>
      ) : null}

      {/* Background Vietnamese bronze drum cultural motif harmonized with cybernetics */}
      <TrongDongPattern size={880} opacity={0.06} animate={true} />

      {/* Ambient background glows */}
      <div className="pointer-events-none absolute top-12 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-primary/10 blur-[130px] rounded-full" />
      <div className="pointer-events-none absolute bottom-8 right-12 w-[450px] h-[300px] bg-ai-action-accent/10 blur-[120px] rounded-full" />

      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center gap-7 py-8">
        {/* Holographic Brand Hero */}
        <div className="flex flex-col items-center text-center gap-4">
          <div className="relative flex items-center justify-center size-24 rounded-3xl border border-glass-border bg-glass-surface spatial-glass backdrop-blur-2xl group transition-transform hover:scale-105">
            <div className="absolute inset-0 rounded-3xl bg-radial-[ellipse_at_center] from-primary/20 via-transparent to-transparent animate-cyber-glow" />
            <img
              src={logo}
              alt="PeaceD OPC"
              className="size-14 relative z-10 drop-shadow-[0_0_12px_rgba(212,163,89,0.4)]"
            />
            <div className="absolute -top-2 -right-2 px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest glow-gold">
              OPC
            </div>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-glass-surface/80 border border-glass-border shadow-xs backdrop-blur-md">
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full size-2 bg-primary" />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-widest text-primary">
                SPATIAL ORCHESTRATION PLATFORM
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight flex items-center justify-center gap-3">
              PeaceD OPC
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground font-medium max-w-lg leading-relaxed">
              One Person Company — Autonomous Agent Fleet &amp; Multi-Agent Studio
            </p>
          </div>

          {/* System Telemetry HUD Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/50 border border-glass-border text-[11px] font-medium text-muted-foreground">
              <Radio className="size-3 text-primary animate-pulse" />
              <span>Engine: Online</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/50 border border-glass-border text-[11px] font-medium text-muted-foreground">
              <ShieldCheck className="size-3 text-neon-emerald" />
              <span>Worktrees: Isolated</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/50 border border-glass-border text-[11px] font-medium text-muted-foreground">
              <Cpu className="size-3 text-ai-action-accent" />
              <span>Fleet: Autonomous</span>
            </div>
          </div>
        </div>

        {preflightIssues.length > 0 && <PreflightBanner issues={preflightIssues} repos={repos} />}

        {/* Feature Cards: 3D Layered Spatial Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full">
          {/* Card 1: Org Studio (Flagship) */}
          <div
            onClick={openOrgPage}
            className="spatial-card group flex flex-col justify-between p-6 cursor-pointer overflow-hidden border-primary/30 hover:border-primary/70"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all pointer-events-none" />
            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <div className="size-12 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-xs">
                  <Building2 className="size-6" />
                </div>
                <span className="cyber-pill bg-primary/15 border-primary/30 text-primary">
                  FLAGSHIP
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="font-bold text-base text-foreground tracking-tight">Organization Studio</h2>
                  <Sparkles className="size-4 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Architect agent hierarchies, assign specialized roles, and orchestrate automated delegation.
                </p>
              </div>
            </div>
            <div className="mt-5 pt-3.5 border-t border-glass-border/60 flex items-center justify-between text-xs font-bold text-primary group-hover:text-primary transition-colors">
              <span>Launch Studio</span>
              <ArrowRight className="size-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

          {/* Card 2: Workspace Creation */}
          <div
            onClick={() => openModal('new-workspace-composer', { telemetrySource: 'unknown' })}
            className="spatial-card group flex flex-col justify-between p-6 cursor-pointer overflow-hidden border-ai-action-accent/30 hover:border-ai-action-accent/70"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-ai-action-accent/10 rounded-full blur-2xl group-hover:bg-ai-action-accent/20 transition-all pointer-events-none" />
            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <div className="size-12 rounded-2xl bg-ai-action-accent/15 border border-ai-action-accent/30 flex items-center justify-center text-ai-action-accent group-hover:scale-110 transition-transform shadow-xs">
                  <GitBranchPlus className="size-6" />
                </div>
                <span className="cyber-pill bg-ai-action-accent/15 border-ai-action-accent/30 text-ai-action-accent">
                  ACTIVE
                </span>
              </div>
              <div>
                <h2 className="font-bold text-base text-foreground tracking-tight">Agent Workspaces</h2>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Spin up zero-conflict git worktrees and multi-agent paired development environments.
                </p>
              </div>
            </div>
            <div className="mt-5 pt-3.5 border-t border-glass-border/60 flex items-center justify-between text-xs font-bold text-ai-action-accent group-hover:text-ai-action-accent transition-colors">
              <span>Deploy {createTargetLabel}</span>
              <ArrowRight className="size-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

          {/* Card 3: Project Hub */}
          <div
            onClick={() => openModal('add-repo')}
            className="spatial-card group flex flex-col justify-between p-6 cursor-pointer overflow-hidden border-antique-bronze/30 hover:border-antique-bronze/70"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-antique-bronze/10 rounded-full blur-2xl group-hover:bg-antique-bronze/20 transition-all pointer-events-none" />
            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <div className="size-12 rounded-2xl bg-antique-bronze/15 border border-antique-bronze/30 flex items-center justify-center text-antique-bronze group-hover:scale-110 transition-transform shadow-xs">
                  <FolderPlus className="size-6" />
                </div>
                <span className="cyber-pill bg-antique-bronze/15 border-antique-bronze/30 text-antique-bronze">
                  SOURCE
                </span>
              </div>
              <div>
                <h2 className="font-bold text-base text-foreground tracking-tight">Project Repositories</h2>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Mount local codebases, remote repositories, and monorepos to your OPC neural fleet.
                </p>
              </div>
            </div>
            <div className="mt-5 pt-3.5 border-t border-glass-border/60 flex items-center justify-between text-xs font-bold text-antique-bronze group-hover:text-antique-bronze transition-colors">
              <span>Attach Project</span>
              <ArrowRight className="size-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>
        </div>

        {/* Spatial HUD Shortcuts Matrix */}
        <div className="w-full max-w-md pt-2">
          <div className="rounded-2xl border border-glass-border bg-glass-surface/80 p-3.5 backdrop-blur-xl spatial-glass space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <Zap className="size-3 text-primary" />
                <span>Command Shortcuts</span>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground/60 uppercase">SPATIAL HUD</span>
            </div>
            <div className="space-y-1.5">
              {shortcuts.map((shortcut) => (
                <div
                  key={shortcut.id}
                  className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-background/40 border border-glass-border/30 hover:border-glass-border/70 transition-colors"
                >
                  <span className="text-xs text-muted-foreground font-medium">{shortcut.action}</span>
                  <ShortcutKeyCombo
                    keys={shortcut.shortcut.keys}
                    doubleTap={shortcut.shortcut.doubleTap}
                    separatorClassName="mx-0.5 text-[10px] text-muted-foreground"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
