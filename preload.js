const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  loadProjects: () => ipcRenderer.invoke('load-projects'),
  saveProjects: (projects) => ipcRenderer.invoke('save-projects', projects),
  loadTimeEntries: () => ipcRenderer.invoke('load-time-entries'),
  saveTimeEntries: (entries) => ipcRenderer.invoke('save-time-entries', entries),
  exportToCSV: () => ipcRenderer.invoke('export-to-csv')
});