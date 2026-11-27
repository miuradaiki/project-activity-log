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

  // プロジェクト画面に遷移
  const projectsIcon = window.locator('[data-testid="nav-projects"]').first();
  await expect(projectsIcon).toBeVisible({ timeout: 10000 });
  await projectsIcon.click();
  await window.waitForTimeout(1000);
});

test.afterAll(async () => {
  await electronApp.close();
});

test.describe('Project Management', () => {
  test.describe('Project List', () => {
    test('should list active projects as rows', async () => {
      // global-setup で作る進行中プロジェクトは2件
      await expect(
        window.locator('[data-testid="project-play-button"]')
      ).toHaveCount(2, { timeout: 10000 });
    });

    test('should keep archived projects collapsed until opened', async () => {
      const archivedName = window.getByText('アーカイブ済みプロジェクト');
      await expect(archivedName).toHaveCount(0);

      await window.locator('[data-testid="archived-toggle"]').click();
      await expect(archivedName).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Add Project', () => {
    test('should open the project dialog from the add button', async () => {
      await window.locator('[data-testid="add-project-button"]').click();
      await expect(window.locator('[role="dialog"]')).toBeVisible({
        timeout: 10000,
      });
      await window.keyboard.press('Escape');
      await expect(window.locator('[role="dialog"]')).toHaveCount(0, {
        timeout: 10000,
      });
    });
  });

  test.describe('Project Actions', () => {
    test('should open menu when more button clicked', async () => {
      await window
        .locator('[data-testid="project-more-button"]')
        .first()
        .click();
      await expect(window.locator('[role="menu"]')).toBeVisible({
        timeout: 10000,
      });
      await window.keyboard.press('Escape');
    });
  });
});
