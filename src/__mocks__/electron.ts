import { Project, TimeEntry, AppSettings } from '../types/types';

export class MockElectronAPI {
  private static instance: MockElectronAPI;
  private projects: Project[] = [];
  private timeEntries: TimeEntry[] = [];
  private settings: AppSettings = {
    workHours: {
      baseMonthlyHours: 140
    }
  };

  static getInstance(): MockElectronAPI {
    if (!MockElectronAPI.instance) {
      MockElectronAPI.instance = new MockElectronAPI();
    }
    return MockElectronAPI.instance;
  }

  // データをリセット（テスト間でデータをクリア）
  reset(): void {
    this.projects = [];
    this.timeEntries = [];
    this.settings = {
      workHours: {
        baseMonthlyHours: 140
      }
    };
  }

  // プロジェクト関連のモック
  loadProjects = jest.fn().mockImplementation(async (): Promise<Project[]> => {
    return [...this.projects];
  });

  saveProjects = jest.fn().mockImplementation(async (projects: Project[]): Promise<void> => {
    this.projects = [...projects];
  });

  // タイムエントリー関連のモック
  loadTimeEntries = jest.fn().mockImplementation(async (): Promise<TimeEntry[]> => {
    return [...this.timeEntries];
  });

  saveTimeEntries = jest.fn().mockImplementation(async (timeEntries: TimeEntry[]): Promise<void> => {
    this.timeEntries = [...timeEntries];
  });

  // 設定関連のモック
  loadSettings = jest.fn().mockImplementation(async (): Promise<AppSettings> => {
    return { ...this.settings };
  });

  saveSettings = jest.fn().mockImplementation(async (settings: AppSettings): Promise<void> => {
    this.settings = { ...settings };
  });

  // ファイル関連のモック
  exportCSV = jest.fn().mockResolvedValue(undefined);
  
  importCSV = jest.fn().mockImplementation(async (filePath: string): Promise<any[]> => {
    // デフォルトではCSVデータを返す
    return [
      {
        date: '2024-01-01',
        start_time: '09:00:00',
        end_time: '10:00:00',
        duration_minutes: 60,
        project_name: 'テストプロジェクト',
        project_description: 'テスト用プロジェクト',
        notes: 'テストメモ'
      }
    ];
  });

  showOpenDialog = jest.fn().mockImplementation(async (): Promise<{ canceled: boolean; filePaths: string[] }> => {
    return { canceled: true, filePaths: [] };
  });

  // タイマー関連のモック
  onTimerStop = jest.fn();
  removeAllTimerStopListeners = jest.fn();
  updateTrayTimer = jest.fn();
  clearTrayTimer = jest.fn();

  // 通知関連のモック
  showNotification = jest.fn();
}

// テスト用のヘルパー関数
export const createMockProject = (overrides: Partial<Project> = {}): Project => ({
  id: 'test-project-1',
  name: 'テストプロジェクト',
  description: 'テスト用のプロジェクトです',
  monthlyCapacity: 0.5,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  isArchived: false,
  ...overrides,
});

export const createMockTimeEntry = (overrides: Partial<TimeEntry> = {}): TimeEntry => ({
  id: 'test-time-entry-1',
  projectId: 'test-project-1',
  startTime: '2024-01-01T09:00:00.000Z',
  endTime: '2024-01-01T10:00:00.000Z',
  description: 'テスト作業',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

export const createMockSettings = (overrides: Partial<AppSettings> = {}): AppSettings => ({
  workHours: {
    baseMonthlyHours: 140,
  },
  ...overrides,
});