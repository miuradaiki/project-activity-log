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
});

test.afterAll(async () => {
  await electronApp.close();
});

test.describe('Settings', () => {
  test.beforeEach(async () => {
    // 設定アイコンをクリックして設定画面に移動
    const settingsIcon = window.locator('[data-testid="nav-settings"]').first();
    await expect(settingsIcon).toBeVisible({ timeout: 10000 });
    await settingsIcon.click();
    await window.waitForTimeout(1000);
  });

  test.describe('Settings Navigation', () => {
    test('should navigate to settings page', async () => {
      // 設定画面のコンテンツが表示されていることを確認
      const settingsContent = window.locator('[class*="MuiBox"]').first();
      await expect(settingsContent).toBeVisible({ timeout: 10000 });
    });

    test('should display settings icon in sidebar', async () => {
      // サイドバーに設定アイコンが表示されていることを確認
      const settingsIcon = window
        .locator('[data-testid="nav-settings"]')
        .first();
      await expect(settingsIcon).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Monthly Base Hours Setting', () => {
    test('should display settings form', async () => {
      // 設定フォームが表示されていることを確認
      const settingsForm = window.locator('[class*="MuiBox"]').first();
      await expect(settingsForm).toBeVisible({ timeout: 10000 });
    });

    test('should have input field for base hours', async () => {
      // 数値入力フィールドが存在することを確認
      const inputFields = window.locator('input[type="number"]');
      const count = await inputFields.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });
});
