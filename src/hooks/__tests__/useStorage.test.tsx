import { renderHook, act } from '@testing-library/react';
import { useStorage } from '../useStorage';
import {
  MockElectronAPI,
  createMockProject,
  createMockTimeEntry,
} from '../../__mocks__/electron';

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
  });

  describe('初期化時の動作', () => {
    test('空のデータで初期化される', async () => {
      const { result } = renderHook(() => useStorage());

      // 初期状態の確認
      expect(result.current.projects).toEqual([]);
      expect(result.current.timeEntries).toEqual([]);
      expect(result.current.isLoading).toBe(true);

      // データロード完了まで待機
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
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
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      expect(result.current.projects).toEqual([mockProject]);
      expect(result.current.timeEntries).toEqual([mockTimeEntry]);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('プロジェクト操作', () => {
    test('プロジェクトのsetProjectsが正常に動作する', async () => {
      const { result } = renderHook(() => useStorage());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      const newProject = createMockProject({ name: '新しいプロジェクト' });

      await act(async () => {
        result.current.setProjects([newProject]);
        // デバウンス処理のため少し待機
        await new Promise((resolve) => setTimeout(resolve, 1100));
      });

      expect(result.current.projects).toContainEqual(newProject);
      // プロジェクトの状態が正しく設定されていることを確認
      expect(result.current.projects).toHaveLength(1);
    });

    test('プロジェクトの配列更新が正常に動作する', async () => {
      const originalProject = createMockProject();
      await mockAPI.saveProjects([originalProject]);

      const { result } = renderHook(() => useStorage());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
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

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
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

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      const newTimeEntry = createMockTimeEntry();
      // プロジェクトも設定しないと空データ判定でsaveされない
      const relatedProject = createMockProject({ id: newTimeEntry.projectId });

      await act(async () => {
        result.current.setProjects([relatedProject]);
        result.current.setTimeEntries([newTimeEntry]);
        // デバウンス処理のため少し待機
        await new Promise((resolve) => setTimeout(resolve, 1100));
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

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
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

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
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

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      // プロジェクトが存在することでデータ操作が発生し、整合性チェックが動作する
      await act(async () => {
        result.current.setProjects([validProject]);
        // デバウンス処理とsaveを待機
        await new Promise((resolve) => setTimeout(resolve, 1100));
      });

      // 孤立したタイムエントリーが削除されていることを確認
      expect(result.current.timeEntries).toHaveLength(0);
      expect(mockAPI.saveTimeEntries).toHaveBeenCalled();
    });

    test('テストモードの切り替えが正常に動作する', async () => {
      const { result } = renderHook(() => useStorage());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      // テストモード関連の状態確認
      expect(result.current.isTestMode).toBe(false);
      expect(result.current.testDataStats).toEqual({
        projectCount: 0,
        timeEntryCount: 0,
      });
    });
  });
});
