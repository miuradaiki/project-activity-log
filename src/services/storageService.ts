import { Project, TimeEntry } from '../types';

/**
 * Electron IPC経由でデータの永続化を行うサービス
 */
export const storageService = {
  /**
   * プロジェクト一覧を読み込む
   */
  async loadProjects(): Promise<Project[]> {
    const result = await window.electronAPI.loadProjects();
    return Array.isArray(result) ? result : [];
  },

  /**
   * タイムエントリ一覧を読み込む
   */
  async loadTimeEntries(): Promise<TimeEntry[]> {
    const result = await window.electronAPI.loadTimeEntries();
    return Array.isArray(result) ? result : [];
  },

  /**
   * プロジェクト一覧を保存する
   */
  async saveProjects(projects: Project[]): Promise<void> {
    await window.electronAPI.saveProjects(projects);
  },

  /**
   * タイムエントリ一覧を保存する
   */
  async saveTimeEntries(timeEntries: TimeEntry[]): Promise<void> {
    await window.electronAPI.saveTimeEntries(timeEntries);
  },

  /**
   * プロジェクトとタイムエントリを同時に読み込む
   */
  async loadAll(): Promise<{ projects: Project[]; timeEntries: TimeEntry[] }> {
    const [projects, timeEntries] = await Promise.all([
      this.loadProjects(),
      this.loadTimeEntries(),
    ]);
    return { projects, timeEntries };
  },

  /**
   * プロジェクトとタイムエントリを同時に保存する
   * 存在しないプロジェクトを参照するタイムエントリは除外される
   */
  async saveAll(projects: Project[], timeEntries: TimeEntry[]): Promise<void> {
    const projectIds = new Set(projects.map((p) => p.id));
    const validTimeEntries = timeEntries.filter((entry) =>
      projectIds.has(entry.projectId)
    );

    await Promise.all([
      this.saveProjects(projects),
      this.saveTimeEntries(validTimeEntries),
    ]);
  },
};
