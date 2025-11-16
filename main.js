import {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  Tray,
  Menu,
  nativeImage,
} from 'electron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import {
  initStorage,
  loadProjects,
  saveProjects,
  loadTimeEntries,
  saveTimeEntries,
  exportToCSV,
} from './storageUtils.js';

// グローバル変数
let mainWindow = null;
let tray = null;
let timerState = {
  isRunning: false,
  projectName: '',
  startTime: null,
  elapsedTime: 0,
};

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900, // 最小幅を設定
    minHeight: 650, // 最小高さを設定
    title: 'Project Activity Log',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5175');
    // mainWindow.webContents.openDevTools(); // 開発ツールを自動で開かない
  } else {
    mainWindow.loadFile('dist/index.html');
  }

  // ウィンドウが閉じられたときの処理
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Tray機能を初期化
function createTray() {
  // シンプルな16x16のアイコンを作成
  const icon = nativeImage.createEmpty();

  // macOS用のテンプレートアイコンを作成
  if (process.platform === 'darwin') {
    // シンプルな円形のアイコンを作成
    const iconBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAALRJREFUOI2lk7ENwzAMBM+xgQzgEbKBR3AJj+AR3EEaF26sIt9fJCVIvycfSeDu+M8QEYgIRARmhojAzHBOcc5xzvE8D2aGc465LmPvPSIC7z1SSog57r1jZhARiAhEBGutmOcp51xIa4WZYWa49x4RgdYKZoZzCmttmFkppZBSau+9RwQqpWBVy1olIpCmaIxRay20tVpbBTNDRGBmqLUOInTOBRFaa6XOOXRIa0N3BwA+8gEvWHqh1/MAAAAASUVORK5CYII=',
      'base64'
    );

    icon.addRepresentation({
      scaleFactor: 1.0,
      width: 16,
      height: 16,
      buffer: iconBuffer,
    });

    icon.setTemplateImage(true);
  } else {
    // Windows/Linux用のアイコン
    const iconBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAALRJREFUOI2lk7ENwzAMBM+xgQzgEbKBR3AJj+AR3EEaF26sIt9fJCVIvycfSeDu+M8QEYgIRARmhojAzHBOcc5xzvE8D2aGc465LmPvPSIC7z1SSog57r1jZhARiAhEBGutmOcp51xIa4WZYWa49x4RgdYKZoZzCmttmFkppZBSau+9RwQqpWBVy1olIpCmaIxRay20tVpbBTNDRGBmqLUOInTOBRFaa6XOOXRIa0N3BwA+8gEvWHqh1/MAAAAASUVORK5CYII=',
      'base64'
    );

    icon.addRepresentation({
      scaleFactor: 1.0,
      width: 16,
      height: 16,
      buffer: iconBuffer,
    });
  }

  tray = new Tray(icon);

  // 初期状態でのトレイタイトルを設定
  updateTrayTitle();

  // トレイメニューを作成
  updateTrayMenu();

  // トレイアイコンクリック時の動作
  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    } else {
      createWindow();
    }
  });
}

// トレイのタイトルを更新
function updateTrayTitle() {
  if (!tray) return;

  if (timerState.isRunning) {
    const elapsed = Math.floor((Date.now() - timerState.startTime) / 1000);
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;

    const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    tray.setTitle(`▶️ ${timeStr} - ${timerState.projectName}`);
  } else {
    tray.setTitle('⏸️ Project Timer');
  }
}

// トレイメニューを更新
function updateTrayMenu() {
  if (!tray) return;

  const template = [
    {
      label: timerState.isRunning
        ? `停止: ${timerState.projectName}`
        : 'タイマー停止中',
      enabled: timerState.isRunning,
      click: () => {
        if (mainWindow) {
          mainWindow.webContents.send('tray-stop-timer');
        }
      },
    },
    { type: 'separator' },
    {
      label: 'アプリを表示',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        } else {
          createWindow();
        }
      },
    },
    {
      label: '終了',
      click: () => {
        app.quit();
      },
    },
  ];

  const contextMenu = Menu.buildFromTemplate(template);
  tray.setContextMenu(contextMenu);
}

// デバッグ用：ファイルの内容を確認
const checkStorageFiles = async () => {
  const USER_DATA_PATH = app.getPath('userData');
  const STORAGE_PATH = path.join(USER_DATA_PATH, 'data');

  const projectsPath = path.join(STORAGE_PATH, 'projects.json');
  const timeEntriesPath = path.join(STORAGE_PATH, 'timeEntries.json');

  try {
    if (fs.existsSync(projectsPath)) {
      const projectsData = await fs.promises.readFile(projectsPath, 'utf-8');
    } else {
    }

    if (fs.existsSync(timeEntriesPath)) {
      const timeEntriesData = await fs.promises.readFile(
        timeEntriesPath,
        'utf-8'
      );
    } else {
    }
  } catch (error) {
    console.error('Error checking storage files:', error);
  }
};

// ストレージの初期化
app.whenReady().then(async () => {
  initStorage();
  await checkStorageFiles();

  // IPCハンドラーの設定
  ipcMain.handle('load-projects', async () => {
    return await loadProjects();
  });

  ipcMain.handle('save-projects', async (_, projects) => {
    await saveProjects(projects);
  });

  ipcMain.handle('load-time-entries', async () => {
    return await loadTimeEntries();
  });

  ipcMain.handle('save-time-entries', async (_, timeEntries) => {
    await saveTimeEntries(timeEntries);
  });

  ipcMain.handle('export-to-csv', async () => {
    try {
      const timeEntries = await loadTimeEntries();
      const projects = await loadProjects();
      const result = await exportToCSV(timeEntries, projects);
      return { success: result };
    } catch (error) {
      console.error('Error in export-to-csv handler:', error);
      return { success: false, error: error.message };
    }
  });

  // 新しいIPCハンドラー
  ipcMain.handle('get-user-data-path', () => {
    return app.getPath('userData');
  });

  ipcMain.handle('create-directory', async (_, dirPath) => {
    await fs.promises.mkdir(dirPath, { recursive: true });
    return true;
  });

  ipcMain.handle('write-file', async (_, filePath, content) => {
    await fs.promises.writeFile(filePath, content);
    return true;
  });

  ipcMain.handle('read-file', async (_, filePath, options) => {
    return await fs.promises.readFile(filePath, options);
  });

  ipcMain.handle('remove-file', async (_, filePath) => {
    const userDataPath = app.getPath('userData');
    const resolvedPath = path.resolve(userDataPath, filePath);

    // パス検証 - ユーザーデータディレクトリ外のファイルアクセスを防止
    if (!resolvedPath.startsWith(userDataPath)) {
      throw new Error(
        'Invalid file path: Access denied outside user data directory'
      );
    }

    if (fs.existsSync(resolvedPath)) {
      await fs.promises.unlink(resolvedPath);
      return true;
    }
    return false;
  });

  ipcMain.handle('show-open-file-dialog', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'CSV Files', extensions: ['csv'] }],
    });
    if (!result.canceled) {
      return result.filePaths[0];
    }
    return null;
  });

  // タイマー関連のIPCハンドラー
  ipcMain.handle('timer-start', async (_, projectName) => {
    timerState.isRunning = true;
    timerState.projectName = projectName;
    timerState.startTime = Date.now();
    updateTrayTitle();
    updateTrayMenu();
    return true;
  });

  ipcMain.handle('timer-stop', async () => {
    if (timerState.isRunning) {
      timerState.isRunning = false;
      timerState.projectName = '';
      timerState.startTime = null;
      updateTrayTitle();
      updateTrayMenu();
      return true;
    }
    return false;
  });

  ipcMain.handle('timer-get-state', async () => {
    return timerState;
  });

  createWindow();
  createTray();

  // タイマー表示を定期的に更新（1秒ごと）
  setInterval(() => {
    if (timerState.isRunning) {
      updateTrayTitle();
    }
  }, 1000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
