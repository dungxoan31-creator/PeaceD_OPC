import path from 'node:path'
import { test, expect } from './helpers/orca-app'
import { ensureTerminalVisible, waitForActiveWorktree, waitForSessionReady } from './helpers/store'
import { openSidebarProjectDialog } from './helpers/sidebar-project-dialog'
import {
  cleanupGoldenWorktree,
  createGoldenWorktree,
  openGoldenSourceControl,
  seedGoldenSourceEdit
} from './helpers/golden-source-control'

const SCREENSHOT_DIR = path.join(process.cwd(), 'docs', 'screenshots', 'e2e-flow')

test.describe('E2E Documentation Capture: Full Core Features', () => {
  test('Capture Complete Orca User Journey @doc-capture', async ({
    orcaPage,
    testRepoPath,
    registerPostElectronShutdownCleanup
  }) => {
    await waitForSessionReady(orcaPage)
    await waitForActiveWorktree(orcaPage)
    await ensureTerminalVisible(orcaPage)
    await orcaPage.waitForTimeout(1500)

    // 1. Toàn cảnh Workspace chính (Main Workspace overview)
    await orcaPage.screenshot({
      path: path.join(SCREENSHOT_DIR, '04-main-workspace-overview.png')
    })

    // 2. Hộp thoại Thêm dự án / Thêm repository (Add Project dialog)
    try {
      await openSidebarProjectDialog(orcaPage)
      await orcaPage.waitForTimeout(600)
      await orcaPage.screenshot({
        path: path.join(SCREENSHOT_DIR, '05-add-project-dialog.png')
      })
      await orcaPage.keyboard.press('Escape')
      await orcaPage.waitForTimeout(400)
    } catch {
      // Bỏ qua nếu nút trên sidebar chưa sẵn sàng
    }

    // 3. Menu tạo Tab mới / Chọn Agent (Agent picker & New tab menu)
    try {
      const newTabBtn = orcaPage.getByRole('button', { name: 'New tab' }).first()
      if (await newTabBtn.isVisible()) {
        await newTabBtn.click({ force: true })
        await orcaPage.waitForTimeout(600)
        await orcaPage.screenshot({
          path: path.join(SCREENSHOT_DIR, '06-new-tab-agent-menu.png')
        })
        await orcaPage.keyboard.press('Escape')
        await orcaPage.waitForTimeout(400)
      }
    } catch {
      // Bỏ qua nếu không mở được menu tab
    }

    // 4. Terminal đang hoạt động
    await orcaPage.screenshot({
      path: path.join(SCREENSHOT_DIR, '07-terminal-running.png')
    })

    // 5. Mở Right Sidebar - File Explorer
    await orcaPage.evaluate(() => {
      const store = window.__store
      if (store) {
        const state = store.getState()
        state.setRightSidebarTab('explorer')
        state.setRightSidebarOpen(true)
      }
    })
    await orcaPage.waitForTimeout(800)
    await orcaPage.screenshot({
      path: path.join(SCREENSHOT_DIR, '08-right-sidebar-file-explorer.png')
    })

    // 6. Source Control & Monaco Diff Editor
    const fixture = createGoldenWorktree(testRepoPath, 'doc-journey')
    registerPostElectronShutdownCleanup(async () => cleanupGoldenWorktree(testRepoPath, fixture))
    seedGoldenSourceEdit(fixture.worktreePath)

    await openGoldenSourceControl(orcaPage, testRepoPath, fixture)
    await orcaPage.waitForTimeout(1200)

    // Bảng Source Control hiển thị file thay đổi
    await orcaPage.screenshot({
      path: path.join(SCREENSHOT_DIR, '09-source-control-panel.png')
    })

    // Mở Diff editor
    const changedFile = orcaPage.locator('[data-testid="source-control-entry"]').first()
    await expect(changedFile).toBeVisible({ timeout: 15_000 })
    await changedFile.click()

    await expect(orcaPage.locator('.monaco-diff-editor')).toBeVisible({ timeout: 20_000 })
    await orcaPage.waitForTimeout(1000)

    // Chụp Monaco Diff Editor
    await orcaPage.screenshot({
      path: path.join(SCREENSHOT_DIR, '10-monaco-diff-editor.png')
    })

    // 7. Cài đặt hệ thống (Settings Dialog)
    await orcaPage.evaluate(() => {
      const store = window.__store
      if (store) {
        store.getState().openSettingsPage()
      }
    })
    await orcaPage.waitForTimeout(1200)

    // Chụp cửa sổ Settings
    await orcaPage.screenshot({
      path: path.join(SCREENSHOT_DIR, '11-settings-modal.png')
    })
  })
})
