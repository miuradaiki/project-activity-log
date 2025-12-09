import { renderHook, act, waitFor } from '@testing-library/react';
import { useTimerController } from '../useTimerController';
import { Project } from '../../types';

const mockProject: Project = {
  id: 'project-1',
  name: 'Test Project',
  description: 'Test Description',
  monthlyCapacity: 0.5,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  isArchived: false,
};

const mockProjects: Project[] = [mockProject];

// setupTests.tsで定義されたlocalStorageモックを取得
const localStorageMock = window.localStorage as jest.Mocked<
  typeof window.localStorage
>;

describe('useTimerController', () => {
  let localStorageStore: Record<string, string> = {};

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageStore = {};

    // localStorageモックの実装を設定
    localStorageMock.getItem.mockImplementation(
      (key: string) => localStorageStore[key] || null
    );
    localStorageMock.setItem.mockImplementation(
      (key: string, value: string) => {
        localStorageStore[key] = value;
      }
    );
    localStorageMock.removeItem.mockImplementation((key: string) => {
      delete localStorageStore[key];
    });

    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('初期状態', () => {
    it('タイマーは停止状態で開始する', () => {
      const { result } = renderHook(() => useTimerController(mockProjects));

      expect(result.current.isRunning).toBe(false);
      expect(result.current.activeProject).toBeNull();
      expect(result.current.startTime).toBeNull();
    });
  });

  describe('タイマー開始', () => {
    it('startでタイマーを開始できる', async () => {
      const { result } = renderHook(() => useTimerController(mockProjects));

      await act(async () => {
        await result.current.start(mockProject);
      });

      expect(result.current.isRunning).toBe(true);
      expect(result.current.activeProject).toEqual(mockProject);
      expect(result.current.startTime).not.toBeNull();
    });

    it('開始時にelectronAPIのtimerStartを呼ぶ', async () => {
      const { result } = renderHook(() => useTimerController(mockProjects));

      await act(async () => {
        await result.current.start(mockProject);
      });

      expect(window.electronAPI.timerStart).toHaveBeenCalledWith(
        mockProject.name
      );
    });

    it('開始時にlocalStorageに状態を保存する', async () => {
      jest.useRealTimers();
      const { result } = renderHook(() => useTimerController(mockProjects));

      // 初期化を待つ
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      localStorageMock.setItem.mockClear();

      await act(async () => {
        await result.current.start(mockProject);
      });

      // start後にuseEffectによる保存を待つ
      await waitFor(
        () => {
          expect(result.current.isRunning).toBe(true);
          expect(localStorageMock.setItem).toHaveBeenCalled();
        },
        { timeout: 3000 }
      );
    });
  });

  describe('タイマー停止', () => {
    it('stopでタイマーを停止できる', async () => {
      const onTimeEntriesCreated = jest.fn();
      const { result } = renderHook(() =>
        useTimerController(mockProjects, onTimeEntriesCreated)
      );

      await act(async () => {
        await result.current.start(mockProject);
      });

      // 2分経過させる
      act(() => {
        jest.advanceTimersByTime(2 * 60 * 1000);
      });

      await act(async () => {
        await result.current.stop();
      });

      expect(result.current.isRunning).toBe(false);
      expect(result.current.activeProject).toBeNull();
      expect(result.current.startTime).toBeNull();
    });

    it('停止時にelectronAPIのtimerStopを呼ぶ', async () => {
      const { result } = renderHook(() => useTimerController(mockProjects));

      await act(async () => {
        await result.current.start(mockProject);
      });

      act(() => {
        jest.advanceTimersByTime(2 * 60 * 1000);
      });

      await act(async () => {
        await result.current.stop();
      });

      expect(window.electronAPI.timerStop).toHaveBeenCalled();
    });

    it('1分以上経過した場合、TimeEntryが作成される', async () => {
      const onTimeEntriesCreated = jest.fn();
      const { result } = renderHook(() =>
        useTimerController(mockProjects, onTimeEntriesCreated)
      );

      await act(async () => {
        await result.current.start(mockProject);
      });

      act(() => {
        jest.advanceTimersByTime(2 * 60 * 1000);
      });

      await act(async () => {
        await result.current.stop();
      });

      expect(onTimeEntriesCreated).toHaveBeenCalled();
      const entries = onTimeEntriesCreated.mock.calls[0][0];
      expect(entries.length).toBeGreaterThan(0);
      expect(entries[0].projectId).toBe(mockProject.id);
    });

    it('1分未満の場合、TimeEntryは作成されない', async () => {
      const onTimeEntriesCreated = jest.fn();
      // alert mockを追加
      const alertMock = jest
        .spyOn(window, 'alert')
        .mockImplementation(() => {});

      const { result } = renderHook(() =>
        useTimerController(mockProjects, onTimeEntriesCreated)
      );

      await act(async () => {
        await result.current.start(mockProject);
      });

      // 30秒だけ経過
      act(() => {
        jest.advanceTimersByTime(30 * 1000);
      });

      await act(async () => {
        await result.current.stop();
      });

      expect(onTimeEntriesCreated).not.toHaveBeenCalled();
      expect(alertMock).toHaveBeenCalled();

      alertMock.mockRestore();
    });

    it('タイマーが動いていない場合、stopは何もしない', async () => {
      const onTimeEntriesCreated = jest.fn();
      const { result } = renderHook(() =>
        useTimerController(mockProjects, onTimeEntriesCreated)
      );

      await act(async () => {
        await result.current.stop();
      });

      expect(onTimeEntriesCreated).not.toHaveBeenCalled();
      expect(window.electronAPI.timerStop).not.toHaveBeenCalled();
    });
  });

  describe('タイマートグル', () => {
    it('停止中にtoggleを呼ぶとタイマーが開始する', async () => {
      const { result } = renderHook(() => useTimerController(mockProjects));

      await act(async () => {
        await result.current.toggle(mockProject);
      });

      expect(result.current.isRunning).toBe(true);
    });

    it('実行中にtoggleを呼ぶとタイマーが停止する', async () => {
      const { result } = renderHook(() => useTimerController(mockProjects));

      await act(async () => {
        await result.current.start(mockProject);
      });

      act(() => {
        jest.advanceTimersByTime(2 * 60 * 1000);
      });

      await act(async () => {
        await result.current.toggle();
      });

      expect(result.current.isRunning).toBe(false);
    });
  });

  describe('状態復元', () => {
    it('localStorageから状態を復元する', async () => {
      jest.useRealTimers();
      const startTime = new Date().toISOString();
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'project_activity_log_timer_state') {
          return JSON.stringify({
            projectId: mockProject.id,
            isRunning: true,
            startTime,
          });
        }
        return null;
      });

      const { result } = renderHook(() => useTimerController(mockProjects));

      // 復元は非同期で行われるため、waitForを使う
      await waitFor(
        () => {
          expect(result.current.isRunning).toBe(true);
          expect(result.current.activeProject).toEqual(mockProject);
        },
        { timeout: 3000 }
      );
    });

    it('8時間以上前の状態は復元しない', async () => {
      jest.useRealTimers();
      const oldStartTime = new Date(
        Date.now() - 9 * 60 * 60 * 1000
      ).toISOString();
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'project_activity_log_timer_state') {
          return JSON.stringify({
            projectId: mockProject.id,
            isRunning: true,
            startTime: oldStartTime,
          });
        }
        return null;
      });

      const { result } = renderHook(() => useTimerController(mockProjects));

      // 初期化を待つ
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      expect(result.current.isRunning).toBe(false);
    });

    it('アーカイブされたプロジェクトの状態は復元しない', async () => {
      jest.useRealTimers();
      const archivedProject = { ...mockProject, isArchived: true };
      const startTime = new Date().toISOString();
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'project_activity_log_timer_state') {
          return JSON.stringify({
            projectId: archivedProject.id,
            isRunning: true,
            startTime,
          });
        }
        return null;
      });

      const { result } = renderHook(() =>
        useTimerController([archivedProject])
      );

      // 初期化を待つ
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      expect(result.current.isRunning).toBe(false);
    });
  });

  describe('ヘルパープロパティ', () => {
    it('canStartはタイマーが停止中にtrueを返す', () => {
      const { result } = renderHook(() => useTimerController(mockProjects));

      expect(result.current.canStart).toBe(true);
    });

    it('canStopはタイマーが実行中にtrueを返す', async () => {
      const { result } = renderHook(() => useTimerController(mockProjects));

      expect(result.current.canStop).toBe(false);

      await act(async () => {
        await result.current.start(mockProject);
      });

      expect(result.current.canStop).toBe(true);
    });
  });
});
