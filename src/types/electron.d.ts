export interface ElectronAPI {
  loadProjects: () => Promise<any>;
  saveProjects: (projects: any) => Promise<void>;
  loadTimeEntries: () => Promise<any>;
  saveTimeEntries: (entries: any) => Promise<void>;
  exportToCSV: () => Promise<any>;
  getUserDataPath: () => Promise<string>;
  createDirectory: (path: string) => Promise<boolean>;
  writeFile: (path: string, content: string) => Promise<boolean>;
  readFile: (path: string, options?: { encoding: string }) => Promise<any>;
  showOpenFileDialog: () => Promise<string | null>;
  
  // タイマー関連API
  timerStart: (projectName: string) => Promise<boolean>;
  timerStop: () => Promise<boolean>;
  timerGetState: () => Promise<{
    isRunning: boolean;
    projectName: string;
    startTime: number | null;
    elapsedTime: number;
  }>;
  onTrayStopTimer: (callback: () => void) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}