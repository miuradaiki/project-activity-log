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

  test('should display the sidebar navigation', async () => {
    for (const page of ['timer', 'projects', 'dashboard', 'settings']) {
      await expect(window.locator(`[data-testid="nav-${page}"]`)).toBeVisible({
        timeout: 10000,
      });
    }
  });

  test('should open the today page with hourly timeline dividers', async () => {
    await window.locator('[data-testid="nav-timer"]').click();
    await expect(window.locator('[data-testid="nav-timer"]')).toHaveAttribute(
      'aria-current',
      'page'
    );
    // 6:00〜21:00 の帯に、7時〜20時の毎時の区切り線
    await expect(
      window.locator('[data-testid="timeline-hour-line"]')
    ).toHaveCount(14, { timeout: 10000 });
  });
});

test.describe('Navigation', () => {
  test('should navigate to the projects page', async () => {
    await window.locator('[data-testid="nav-projects"]').click();
    await expect(
      window.locator('[data-testid="add-project-button"]')
    ).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to the reports page', async () => {
    const reports = window.locator('[data-testid="nav-dashboard"]');
    await reports.click();
    await expect(reports).toHaveAttribute('aria-current', 'page');
    await expect(window.locator('h1')).toBeVisible({ timeout: 10000 });
  });
});
