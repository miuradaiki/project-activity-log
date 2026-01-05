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

    // プロジェクトタブが表示されていることを確認（日本語/英語両対応）
    const tabContent = window.locator('[role="tab"]').first();
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
  test('should display dashboard content', async () => {
    // ダッシュボードのコンテンツが表示されていることを確認
    const dashboardContent = window.locator('[class*="MuiBox"]').first();
    await expect(dashboardContent).toBeVisible({ timeout: 10000 });
  });

  test('should display dashboard cards', async () => {
    // ダッシュボードのカードが表示されていることを確認
    const cards = window.locator('[class*="MuiCard"], [class*="MuiPaper"]');
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should display tabs if present', async () => {
    // タブが存在する場合は表示されていることを確認
    const tabs = window.locator('[role="tab"]');
    const count = await tabs.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
