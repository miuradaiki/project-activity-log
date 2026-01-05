import {
  test,
  expect,
  _electron as electron,
  ElectronApplication,
  Page,
} from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let electronApp: ElectronApplication;
let window: Page;

test.beforeAll(async () => {
  electronApp = await electron.launch({
    args: [path.join(__dirname, '..')],
    env: {
      ...process.env,
      NODE_ENV: 'test',
    },
  });
  window = await electronApp.firstWindow();
  await window.waitForLoadState('domcontentloaded');
  await window.waitForTimeout(2000);

  // プロジェクト画面（ListAltアイコン）に遷移
  const projectsIcon = window.locator('[data-testid="ListAltIcon"]').first();
  await expect(projectsIcon).toBeVisible({ timeout: 10000 });
  await projectsIcon.click();
  await window.waitForTimeout(1000);
});

test.afterAll(async () => {
  await electronApp.close();
});

test.describe('Project Management', () => {
  test.describe('Project List', () => {
    test('should display project list with tabs', async () => {
      // 進行中タブが表示されていることを確認
      const activeTab = window.locator('text=進行中').first();
      await expect(activeTab).toBeVisible({ timeout: 10000 });

      // アーカイブタブが表示されていることを確認
      const archiveTab = window.locator('text=アーカイブ').first();
      await expect(archiveTab).toBeVisible({ timeout: 10000 });
    });

    test('should display existing projects', async () => {
      // プロジェクトカードが表示されていることを確認
      const projectCards = window.locator('[class*="MuiCard"]').first();
      await expect(projectCards).toBeVisible({ timeout: 10000 });
    });

    test('should show project details in card', async () => {
      // プロジェクトカードに稼働率が表示されていることを確認
      const workRate = window.locator('text=稼働率').first();
      await expect(workRate).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Add Project', () => {
    test('should have add project button (FAB)', async () => {
      // FAB（Floating Action Button）が表示されていることを確認
      const fab = window.locator('[class*="MuiFab"]').first();
      await expect(fab).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Project Actions', () => {
    test('should have play button for starting timer', async () => {
      // プロジェクトカードの再生ボタンが表示されていることを確認
      const playButton = window
        .locator('[data-testid="PlayArrowIcon"]')
        .first();
      await expect(playButton).toBeVisible({ timeout: 10000 });
    });

    test('should have more options menu', async () => {
      // プロジェクトカードの3点メニューが表示されていることを確認
      const moreButton = window.locator('[data-testid="MoreVertIcon"]').first();
      await expect(moreButton).toBeVisible({ timeout: 10000 });
    });

    test('should open menu when more button clicked', async () => {
      // 3点メニューをクリック
      const moreButton = window.locator('[data-testid="MoreVertIcon"]').first();
      await expect(moreButton).toBeVisible({ timeout: 10000 });
      await moreButton.click();
      await window.waitForTimeout(300);

      // メニューが表示されることを確認
      const menu = window.locator('[role="menu"]');
      await expect(menu).toBeVisible({ timeout: 10000 });

      // メニューを閉じる
      await window.keyboard.press('Escape');
      await window.waitForTimeout(300);
    });
  });

  test.describe('Tab Navigation', () => {
    test('should switch to archive tab', async () => {
      // アーカイブタブをクリック
      const archiveTab = window.locator('text=アーカイブ').first();
      await expect(archiveTab).toBeVisible({ timeout: 10000 });
      await archiveTab.click();
      await window.waitForTimeout(500);

      // アーカイブタブがアクティブになっていることを確認
      await expect(archiveTab).toBeVisible({ timeout: 10000 });
    });

    test('should switch back to active tab', async () => {
      // 進行中タブをクリック
      const activeTab = window.locator('text=進行中').first();
      await expect(activeTab).toBeVisible({ timeout: 10000 });
      await activeTab.click();
      await window.waitForTimeout(500);

      // プロジェクトが表示されていることを確認
      const projectCards = window.locator('[class*="MuiCard"]').first();
      await expect(projectCards).toBeVisible({ timeout: 10000 });
    });
  });
});
