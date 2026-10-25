import type { TaskPageComposerActionsModel } from '../use-task-page-composer-actions'
import { TaskPageFrame } from './Frame'
import { TaskPageGitHubIssueDialog } from './github/IssueDialog'
import { TaskPageLinearProjectDialog } from './linear/ProjectDialog'
import { TaskPageLinearIssueDialog } from './linear/IssueDialog'
import { TaskPageJiraIssueDialog } from './jira/IssueDialog'
import { TaskPageGitLabDialog } from './gitlab/Dialog'
import { TaskPageLinearConnectDialog } from './linear/ConnectDialog'
import { TaskPageJiraConnectDialog } from './jira/ConnectDialog'
import { Spatial3DScene } from '../spatial/Spatial3DScene'

export function TaskPageSurface({
  model
}: {
  model: TaskPageComposerActionsModel
}): React.JSX.Element {
  return (
    <div className="relative flex h-full min-h-0 flex-1 overflow-hidden bg-background text-foreground">
      <Spatial3DScene intensity="subtle" showCore={false} particleCount={150} />
      <div className="relative z-10 flex h-full min-h-0 flex-1 flex-col overflow-hidden">
        <TaskPageFrame model={model} />
      </div>

      <TaskPageGitHubIssueDialog model={model} />

      <TaskPageLinearProjectDialog model={model} />

      <TaskPageLinearIssueDialog model={model} />

      <TaskPageJiraIssueDialog model={model} />

      <TaskPageGitLabDialog model={model} />

      <TaskPageLinearConnectDialog model={model} />

      <TaskPageJiraConnectDialog model={model} />
    </div>
  )
}
