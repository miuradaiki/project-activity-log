import { renderHook, act, waitFor } from '@testing-library/react';
import { useStorage } from '../useStorage';
import {
  MockElectronAPI,
  createMockProject,
  createMockTimeEntry,
} from '../../__mocks__/electron';
import { isTestDataEnabled } from '../../utils/env';
import { generateTestData } from '../../utils/testDataGenerator';

jest.mock('../../utils/testDataGenerator', () => ({
  generateTestData: jest.fn(() => ({
    projects: [
      {
        id: 'generated-project',
        name: 'Generated Project',
        description: 'generated',
        monthlyCapacity: 0.5,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
        isArchived: false,
      },
    ],
    timeEntries: [
      {
        id: 'generated-entry',
        projectId: 'generated-project',
        startTime: '2025-01-01T09:00:00.000Z',
        endTime: '2025-01-01T10:00:00.000Z',
        description: 'generated',
        createdAt: '2025-01-01T10:00:00.000Z',
        updatedAt: '2025-01-01T10:00:00.000Z',
      },
    ],
  })),
}));

const mockIsTestDataEnabled = isTestDataEnabled as jest.MockedFunction<
  typeof isTestDataEnabled
>;
const mockGenerateTestData = generateTestData as jest.MockedFunction<
  typeof generateTestData
>;

describe('useStorage フックの特性テスト', () => {
  let mockAPI: MockElectronAPI;

  beforeEach(() => {
    mockAPI = MockElectronAPI.getInstance();
    // テストモードを無効にする（プロダクションモードでテスト）
    const localStorageMock = {
      getItem: jest.fn().mockReturnValue(null),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };

    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    mockIsTestDataEnabled.mockReturnValue(false);
    mockGenerateTestData.mockClear();
  });

  describe('初期化時の動作', () => {
    test('空のデータで初期化される', async () => {
      const { result } = renderHook(() => useStorage());

      // 初期状態の確認
      expect(result.current.projects).toEqual([]);
      expect(result.current.timeEntries).toEqual([]);
      expect(result.current.isLoading).toBe(true);

      // データロード完了まで待機
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isLoading).toBe(false);
    });

    test('既存データがある場合は正しくロードされる', async () => {
      const mockProject = createMockProject();
      const mockTimeEntry = createMockTimeEntry();

      // モックにデータを設定
      await mockAPI.saveProjects([mockProject]);
      await mockAPI.saveTimeEntries([mockTimeEntry]);

      const { result } = renderHook(() => useStorage());

      // データロード完了まで待機
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.projects).toEqual([mockProject]);
      expect(result.current.timeEntries).toEqual([mockTimeEntry]);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('プロジェクト操作', () => {
    test('プロジェクトのsetProjectsが正常に動作する', async () => {
      const { result } = renderHook(() => useStorage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const newProject = createMockProject({ name: '新しいプロジェクト' });

      await act(async () => {
        result.current.setProjects([newProject]);
      });

      expect(result.current.projects).toContainEqual(newProject);
      // プロジェクトの状態が正しく設定されていることを確認
      expect(result.current.projects).toHaveLength(1);
    });

    test('プロジェクトの配列更新が正常に動作する', async () => {
      const originalProject = createMockProject();
      await mockAPI.saveProjects([originalProject]);

      const { result } = renderHook(() => useStorage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const updatedProject = {
        ...originalProject,
        name: '更新されたプロジェクト',
      };

      await act(async () => {
        result.current.setProjects([updatedProject]);
      });

      expect(result.current.projects[0].name).toBe('更新されたプロジェクト');
      expect(mockAPI.saveProjects).toHaveBeenCalled();
    });

    test('プロジェクトの削除が正常に動作する', async () => {
      const project = createMockProject();
      await mockAPI.saveProjects([project]);

      const { result } = renderHook(() => useStorage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        result.current.setProjects([]);
      });

      expect(result.current.projects).toHaveLength(0);
      expect(mockAPI.saveProjects).toHaveBeenCalled();
    });
  });

  describe('タイムエントリー操作', () => {
    test('タイムエントリーのsetTimeEntriesが正常に動作する', async () => {
      const { result } = renderHook(() => useStorage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const newTimeEntry = createMockTimeEntry();
      // プロジェクトも設定しないと空データ判定でsaveされない
      const relatedProject = createMockProject({ id: newTimeEntry.projectId });

      await act(async () => {
        result.current.setProjects([relatedProject]);
        result.current.setTimeEntries([newTimeEntry]);
      });

      expect(result.current.timeEntries).toContainEqual(newTimeEntry);
      // タイムエントリーとプロジェクトの状態確認
      expect(result.current.timeEntries).toHaveLength(1);
      expect(result.current.projects).toHaveLength(1);
    });

    test('タイムエントリーの配列更新が正常に動作する', async () => {
      const originalTimeEntry = createMockTimeEntry();
      await mockAPI.saveTimeEntries([originalTimeEntry]);

      const { result } = renderHook(() => useStorage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const updatedTimeEntry = {
        ...originalTimeEntry,
        description: '更新された作業',
      };

      await act(async () => {
        result.current.setTimeEntries([updatedTimeEntry]);
      });

      expect(result.current.timeEntries[0].description).toBe('更新された作業');
      expect(mockAPI.saveTimeEntries).toHaveBeenCalled();
    });

    test('タイムエントリーの削除が正常に動作する', async () => {
      const timeEntry = createMockTimeEntry();
      await mockAPI.saveTimeEntries([timeEntry]);

      const { result } = renderHook(() => useStorage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        result.current.setTimeEntries([]);
      });

      expect(result.current.timeEntries).toHaveLength(0);
      expect(mockAPI.saveTimeEntries).toHaveBeenCalled();
    });
  });

  describe('データの整合性チェック', () => {
    test('存在しないプロジェクトに関連するタイムエントリーが削除される', async () => {
      // 有効なプロジェクトと無効なタイムエントリーを作成
      const validProject = createMockProject({ id: 'valid-project' });
      const orphanTimeEntry = createMockTimeEntry({
        projectId: 'non-existent-project',
      });

      await mockAPI.saveProjects([validProject]);
      await mockAPI.saveTimeEntries([orphanTimeEntry]);

      const { result } = renderHook(() => useStorage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // プロジェクトが存在することでデータ操作が発生し、整合性チェックが動作する
      jest.useFakeTimers();
      await act(async () => {
        result.current.setProjects([validProject]);
      });
      await act(async () => {
        jest.advanceTimersByTime(1200);
      });
      jest.useRealTimers();

      // 孤立したタイムエントリーが削除されていることを確認
      expect(result.current.timeEntries).toHaveLength(0);
      expect(mockAPI.saveTimeEntries).toHaveBeenCalled();
    });

    test('テストモードの切り替えが正常に動作する', async () => {
      const { result } = renderHook(() => useStorage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // テストモード関連の状態確認
      expect(result.current.isTestMode).toBe(false);
      expect(result.current.testDataStats).toEqual({
        projectCount: 0,
        timeEntryCount: 0,
      });
    });

    test('テストモードを有効化するとテストデータが生成される', async () => {
      mockIsTestDataEnabled.mockReturnValue(true);
      const dispatchSpy = jest.spyOn(window, 'dispatchEvent');
      const { result } = renderHook(() => useStorage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.toggleTestMode(true);
      });

      expect(result.current.isTestMode).toBe(true);
      expect(mockGenerateTestData).toHaveBeenCalled();
      expect(dispatchSpy).toHaveBeenCalledWith(expect.any(Event));
      expect(result.current.projects[0].name).toBe('Generated Project');
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        'project_activity_log_test_mode',
        'true'
      );

      dispatchSpy.mockRestore();
    });
  });

  describe('永続化処理', () => {
    test('空のデータは保存されない', async () => {
      const { result } = renderHook(() => useStorage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      mockAPI.saveProjects.mockClear();
      mockAPI.saveTimeEntries.mockClear();

      jest.useFakeTimers();
      await act(async () => {
        result.current.setProjects([]);
        result.current.setTimeEntries([]);
      });
      await act(async () => {
        jest.advanceTimersByTime(1200);
      });
      jest.useRealTimers();

      expect(mockAPI.saveProjects).not.toHaveBeenCalled();
      expect(mockAPI.saveTimeEntries).not.toHaveBeenCalled();
    });
  });
});
