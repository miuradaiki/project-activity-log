const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  loadProjects: () => ipcRenderer.invoke('load-projects'),
  saveProjects: (projects) => ipcRenderer.invoke('save-projects', projects),
  loadTimeEntries: () => ipcRenderer.invoke('load-time-entries'),
  saveTimeEntries: (entries) => ipcRenderer.invoke('save-time-entries', entries),
  exportToCSV: () => ipcRenderer.invoke('export-to-csv')
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