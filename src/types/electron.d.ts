import { Project, TimeEntry } from '../types';

export interface ElectronAPI {
  loadProjects: () => Promise<Project[]>;
  saveProjects: (projects: Project[]) => Promise<void>;
  loadTimeEntries: () => Promise<TimeEntry[]>;
  saveTimeEntries: (entries: TimeEntry[]) => Promise<void>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}