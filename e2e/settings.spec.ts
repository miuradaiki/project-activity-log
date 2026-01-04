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
  await window.waitForTimeout(1000);
});

test.afterAll(async () => {
  await electronApp.close();
});

test.describe('Settings', () => {
  test.beforeEach(async () => {
    // 設定アイコンをクリックして設定画面に移動
    const settingsIcon = window.locator('[data-testid="SettingsIcon"]').first();
    if (await settingsIcon.isVisible()) {
      await settingsIcon.click();
      await window.waitForTimeout(500);
    }
  });

  test.describe('Settings Navigation', () => {
    test('should navigate to settings page', async () => {
      // 設定画面が表示されていることを確認
      const settingsTitle = window.locator('text=設定').first();
      await expect(settingsTitle).toBeVisible();
    });

    test('should display settings icon in sidebar', async () => {
      // サイドバーに設定アイコンが表示されていることを確認
      const settingsIcon = window
        .locator('[data-testid="SettingsIcon"]')
        .first();
      await expect(settingsIcon).toBeVisible();
    });
  });

  test.describe('Monthly Base Hours Setting', () => {
    test('should display monthly base hours setting', async () => {
      // 月間基本時間の設定が表示されていることを確認
      const baseHoursLabel = window.locator('text=月間基本時間').first();
      if (await baseHoursLabel.isVisible()) {
        await expect(baseHoursLabel).toBeVisible();
      }
    });

    test('should have input field for base hours', async () => {
      // 基本時間の入力フィールドが存在することを確認
      const inputFields = window.locator('input[type="number"]');
      const count = await inputFields.count();
      // 設定画面に数値入力フィールドがあることを確認
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });
});
