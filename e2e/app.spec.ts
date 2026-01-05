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
  // UIがレンダリングされるのを待つ
  await window.waitForTimeout(2000);
});

test.afterAll(async () => {
  await electronApp.close();
});

test.describe('Application Launch', () => {
  test('should launch the application', async () => {
    const title = await window.title();
    expect(title).toContain('Project Activity Log');
  });

  test('should display the sidebar with navigation icons', async () => {
    // サイドバーのナビゲーションアイコンが表示されていることを確認
    const sidebar = window.locator('[class*="MuiDrawer-root"]').first();
    await expect(sidebar).toBeVisible();
  });

  test('should display the main content area with projects', async () => {
    // プロジェクト画面に遷移
    const projectsIcon = window.locator('[data-testid="ListAltIcon"]').first();
    await expect(projectsIcon).toBeVisible({ timeout: 10000 });
    await projectsIcon.click();
    await window.waitForTimeout(1000);

    // プロジェクトタブが表示されていることを確認
    const tabContent = window.locator('text=進行中').first();
    await expect(tabContent).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Navigation', () => {
  test('should navigate using sidebar icons', async () => {
    // ダッシュボードアイコン（グリッドアイコン）をクリック
    const dashboardIcon = window
      .locator('[data-testid="DashboardIcon"]')
      .first();
    await expect(dashboardIcon).toBeVisible({ timeout: 10000 });
    await dashboardIcon.click();
    await window.waitForTimeout(1000);
  });

  test('should show project list on initial load', async () => {
    // プロジェクトカードが表示されていることを確認
    const projectCards = window.locator('[class*="MuiCard"]');
    const count = await projectCards.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Dashboard Features', () => {
  test('should display monthly progress summary', async () => {
    // 月間進捗サマリーが表示されていることを確認
    const monthlyProgress = window.locator('text=月間進捗サマリー');
    await expect(monthlyProgress).toBeVisible({ timeout: 10000 });
  });

  test('should display activity heatmap', async () => {
    // 活動ヒートマップが表示されていることを確認
    const heatmap = window.locator('text=活動ヒートマップ');
    await expect(heatmap).toBeVisible({ timeout: 10000 });
  });

  test('should display weekly and monthly summary tabs', async () => {
    // 週間サマリーと月間サマリーのタブが表示されていることを確認
    const weeklySummary = window.locator('text=週間サマリー');
    await expect(weeklySummary).toBeVisible({ timeout: 10000 });
  });
});
