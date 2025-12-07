import { renderHook, act, waitFor } from '@testing-library/react';
import { useTimerController } from '../useTimerController';
import { Project } from '../../types';

// localStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// electronAPI mock
const electronAPIMock = {
  timerStart: jest.fn(),
  timerStop: jest.fn(),
  onTrayStopTimer: jest.fn(),
};
Object.defineProperty(window, 'electronAPI', { value: electronAPIMock });

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

describe('useTimerController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
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

      expect(electronAPIMock.timerStart).toHaveBeenCalledWith(mockProject.name);
    });

    it('開始時にlocalStorageに状態を保存する', async () => {
      const { result } = renderHook(() => useTimerController(mockProjects));

      await act(async () => {
        await result.current.start(mockProject);
      });

      expect(localStorageMock.setItem).toHaveBeenCalled();
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

      expect(electronAPIMock.timerStop).toHaveBeenCalled();
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
      expect(electronAPIMock.timerStop).not.toHaveBeenCalled();
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
      const startTime = new Date().toISOString();
      localStorageMock.getItem.mockReturnValueOnce(
        JSON.stringify({
          projectId: mockProject.id,
          isRunning: true,
          startTime,
        })
      );

      const { result } = renderHook(() => useTimerController(mockProjects));

      // 復元は非同期で行われるため、waitForを使う
      await waitFor(() => {
        expect(result.current.isRunning).toBe(true);
        expect(result.current.activeProject).toEqual(mockProject);
      });
    });

    it('8時間以上前の状態は復元しない', () => {
      const oldStartTime = new Date(
        Date.now() - 9 * 60 * 60 * 1000
      ).toISOString();
      localStorageMock.getItem.mockReturnValueOnce(
        JSON.stringify({
          projectId: mockProject.id,
          isRunning: true,
          startTime: oldStartTime,
        })
      );

      const { result } = renderHook(() => useTimerController(mockProjects));

      expect(result.current.isRunning).toBe(false);
    });

    it('アーカイブされたプロジェクトの状態は復元しない', () => {
      const archivedProject = { ...mockProject, isArchived: true };
      const startTime = new Date().toISOString();
      localStorageMock.getItem.mockReturnValueOnce(
        JSON.stringify({
          projectId: archivedProject.id,
          isRunning: true,
          startTime,
        })
      );

      const { result } = renderHook(() =>
        useTimerController([archivedProject])
      );

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
