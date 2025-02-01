import { Project, TimeEntry } from '../types';

declare global {
  interface Window {
    electronAPI: {
      loadProjects: () => Promise<Project[]>;
      saveProjects: (projects: Project[]) => Promise<void>;
      loadTimeEntries: () => Promise<TimeEntry[]>;
      saveTimeEntries: (entries: TimeEntry[]) => Promise<void>;
    }
  }
}

// データストレージの型定義
export interface StorageData {
  projects: Project[];
  timeEntries: TimeEntry[];
}

// プロジェクトデータの保存
export const saveProjects = async (projects: Project[]): Promise<void> => {
  await window.electronAPI.saveProjects(projects);
};

// プロジェクトデータの読み込み
export const loadProjects = async (): Promise<Project[]> => {
  return await window.electronAPI.loadProjects();
};

// 時間記録データの保存
export const saveTimeEntries = async (timeEntries: TimeEntry[]): Promise<void> => {
  await window.electronAPI.saveTimeEntries(timeEntries);
};

// 時間記録データの読み込み
export const loadTimeEntries = async (): Promise<TimeEntry[]> => {
  return await window.electronAPI.loadTimeEntries();
};