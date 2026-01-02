import { Project, TimeEntry } from '../types';
import { AppSettings } from '../types/settings';

export class MockElectronAPI {
  private static instance: MockElectronAPI;
  private projects: Project[] = [];
  private timeEntries: TimeEntry[] = [];
  private settings: AppSettings = {
    workHours: {
      baseMonthlyHours: 140,
    },
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
        baseMonthlyHours: 140,
      },
    };
  }

  // プロジェクト関連のモック
  loadProjects = jest.fn().mockImplementation(async (): Promise<Project[]> => {
    return [...this.projects];
  });

  saveProjects = jest
    .fn()
    .mockImplementation(async (projects: Project[]): Promise<void> => {
      this.projects = [...projects];
    });

  // タイムエントリー関連のモック
  loadTimeEntries = jest
    .fn()
    .mockImplementation(async (): Promise<TimeEntry[]> => {
      return [...this.timeEntries];
    });

  saveTimeEntries = jest
    .fn()
    .mockImplementation(async (timeEntries: TimeEntry[]): Promise<void> => {
      this.timeEntries = [...timeEntries];
    });

  // 設定関連のモック
  loadSettings = jest
    .fn()
    .mockImplementation(async (): Promise<AppSettings> => {
      return { ...this.settings };
    });

  saveSettings = jest
    .fn()
    .mockImplementation(async (settings: AppSettings): Promise<void> => {
      this.settings = { ...settings };
    });

  // ファイル関連のモック
  exportCSV = jest.fn().mockResolvedValue(undefined);

  showOpenDialog = jest
    .fn()
    .mockImplementation(
      async (): Promise<{ canceled: boolean; filePaths: string[] }> => {
        return { canceled: true, filePaths: [] };
      }
    );

  // タイマー関連のモック
  timerStart = jest.fn();
  timerStop = jest.fn();
  onTrayStopTimer = jest.fn();
  onTimerStop = jest.fn();
  removeAllTimerStopListeners = jest.fn();
  updateTrayTimer = jest.fn();
  clearTrayTimer = jest.fn();

  // 通知関連のモック
  showNotification = jest.fn();
}

// テスト用のヘルパー関数を共通ヘルパーから再エクスポート
export {
  createMockProject,
  createMockTimeEntry,
} from '../__tests__/helpers/testFactories';

export const createMockSettings = (
  overrides: Partial<AppSettings> = {}
): AppSettings => ({
  workHours: {
    baseMonthlyHours: 140,
  },
  ...overrides,
});
