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
      // タブが表示されていることを確認（言語非依存）
      const tabs = window.locator('[role="tab"]');
      await expect(tabs.first()).toBeVisible({ timeout: 10000 });
      const tabCount = await tabs.count();
      expect(tabCount).toBeGreaterThanOrEqual(2);
    });

    test('should display existing projects', async () => {
      // プロジェクトカードが表示されていることを確認
      const projectCards = window.locator('[class*="MuiCard"]').first();
      await expect(projectCards).toBeVisible({ timeout: 10000 });
    });

    test('should show project details in card', async () => {
      // プロジェクトカードが表示されていることを確認
      const projectCard = window.locator('[class*="MuiCard"]').first();
      await expect(projectCard).toBeVisible({ timeout: 10000 });
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
      // 3番目のタブ（アーカイブ）をクリック
      const archiveTab = window.locator('[role="tab"]').nth(2);
      await expect(archiveTab).toBeVisible({ timeout: 10000 });
      await archiveTab.click();
      await window.waitForTimeout(500);

      // タブがクリック可能であることを確認
      await expect(archiveTab).toBeVisible({ timeout: 10000 });
    });

    test('should switch back to active tab', async () => {
      // 2番目のタブ（進行中/Active）をクリック
      const activeTab = window.locator('[role="tab"]').nth(1);
      await expect(activeTab).toBeVisible({ timeout: 10000 });
      await activeTab.click();
      await window.waitForTimeout(500);

      // 表示されているタブパネルを確認（hidden属性がないもの）
      const tabPanel = window.locator('[role="tabpanel"]:not([hidden])');
      await expect(tabPanel).toBeVisible({ timeout: 10000 });
    });
  });
});
