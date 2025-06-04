const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  loadProjects: () => ipcRenderer.invoke('load-projects'),
  saveProjects: (projects) => ipcRenderer.invoke('save-projects', projects),
  loadTimeEntries: () => ipcRenderer.invoke('load-time-entries'),
  saveTimeEntries: (entries) => ipcRenderer.invoke('save-time-entries', entries),
  exportToCSV: () => ipcRenderer.invoke('export-to-csv'),
  getUserDataPath: () => ipcRenderer.invoke('get-user-data-path'),
  createDirectory: (path) => ipcRenderer.invoke('create-directory', path),
  writeFile: (path, content) => ipcRenderer.invoke('write-file', path, content),
  readFile: (path, options) => ipcRenderer.invoke('read-file', path, options),
  removeFile: (path) => ipcRenderer.invoke('remove-file', path),
  showOpenFileDialog: () => ipcRenderer.invoke('show-open-file-dialog'),
  
  // タイマー関連API
  timerStart: (projectName) => ipcRenderer.invoke('timer-start', projectName),
  timerStop: () => ipcRenderer.invoke('timer-stop'),
  timerGetState: () => ipcRenderer.invoke('timer-get-state'),
  onTrayStopTimer: (callback) => ipcRenderer.on('tray-stop-timer', callback)
});

// 通知機能の追加
contextBridge.exposeInMainWorld('notification', {
  requestPermission: async () => {
    return await Notification.requestPermission();
  }
});

// アプリケーション起動時に通知の許可を要求
window.addEventListener('DOMContentLoaded', () => {
  if (Notification.permission !== 'granted') {
    Notification.requestPermission();
  }
});