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

  // プロジェクト画面（ListAltアイコン）に遷移
  const projectsIcon = window.locator('[data-testid="ListAltIcon"]').first();
  if (await projectsIcon.isVisible()) {
    await projectsIcon.click();
    await window.waitForTimeout(500);
  }
});

test.afterAll(async () => {
  await electronApp.close();
});

test.describe('Timer Functionality', () => {
  test('should have play button on project card', async () => {
    const playButton = window.locator('[data-testid="PlayArrowIcon"]').first();
    await expect(playButton).toBeVisible();
  });
});
