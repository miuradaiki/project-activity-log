import { Project, TimeEntry } from '../types';
import { AppSettings } from '../types/settings';

export interface ElectronAPI {
  loadProjects: () => Promise<Project[]>;
  saveProjects: (projects: Project[]) => Promise<void>;
  loadTimeEntries: () => Promise<TimeEntry[]>;
  saveTimeEntries: (entries: TimeEntry[]) => Promise<void>;
  loadSettings: () => Promise<AppSettings>;
  saveSettings: (settings: AppSettings) => Promise<void>;
  exportCSV: (entries: TimeEntry[], projects: Project[]) => Promise<void>;
  importCSV: (filePath: string) => Promise<Array<Record<string, string>>>;
  showOpenDialog: () => Promise<{ canceled: boolean; filePaths: string[] }>;
  showNotification: (title: string, body: string) => void;
  onTimerStop: (callback: () => void) => void;
  removeAllTimerStopListeners: () => void;
  updateTrayTimer: (minutes: number, seconds: number) => void;
  clearTrayTimer: () => void;
  removeFile: (path: string) => Promise<boolean>;
  deleteData: (dataType: string) => Promise<void>;

  getUserDataPath: () => Promise<string>;
  createDirectory: (path: string) => Promise<boolean>;
  writeFile: (path: string, content: string) => Promise<boolean>;
  readFile: (path: string, options?: { encoding: string }) => Promise<string>;
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
