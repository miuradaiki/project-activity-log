const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const {
  initStorage,
  loadProjects,
  saveProjects,
  loadTimeEntries,
  saveTimeEntries,
  exportToCSV
} = require('./storageUtils');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,  // 最小幅を設定
    minHeight: 650, // 最小高さを設定
    title: 'Project Activity Log',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    win.loadFile('dist/index.html');
  }
}

// デバッグ用：ファイルの内容を確認
const checkStorageFiles = async () => {
  const USER_DATA_PATH = app.getPath('userData');
  const STORAGE_PATH = path.join(USER_DATA_PATH, 'data');
  console.log('Storage Path:', STORAGE_PATH);

  const projectsPath = path.join(STORAGE_PATH, 'projects.json');
  const timeEntriesPath = path.join(STORAGE_PATH, 'timeEntries.json');

  try {
    if (fs.existsSync(projectsPath)) {
      const projectsData = await fs.promises.readFile(projectsPath, 'utf-8');
      console.log('Projects file content:', projectsData);
    } else {
      console.log('Projects file does not exist');
    }

    if (fs.existsSync(timeEntriesPath)) {
      const timeEntriesData = await fs.promises.readFile(timeEntriesPath, 'utf-8');
      console.log('Time entries file exists');
    } else {
      console.log('Time entries file does not exist');
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
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      return true;
    }
    return false;
  });

  ipcMain.handle('show-open-file-dialog', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'CSV Files', extensions: ['csv'] }]
    });
    if (!result.canceled) {
      return result.filePaths[0];
    }
    return null;
  });

  createWindow();

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
