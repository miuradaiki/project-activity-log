/**
 * useTimer フック テスト
 *
 * このテストファイルはタイマーの低レベル機能に焦点を当てています：
 * - タイマーの基本動作（開始/停止、状態管理）
 * - ブラウザAPI（localStorage）との連携
 * - 状態の永続化と復元
 *
 * 高レベルのプロジェクト連携やTimeEntry生成のテストは
 * useTimerController.test.ts を参照してください。
 */
import { renderHook, act } from '@testing-library/react';
import { useTimer } from '../useTimer';

// window.electron のモック
const mockSaveTimeEntry = jest.fn().mockResolvedValue(undefined);
Object.defineProperty(window, 'electron', {
  value: {
    saveTimeEntry: mockSaveTimeEntry,
  },
  writable: true,
});

const TIMER_STORAGE_KEY = 'project-activity-timer-state';

// setupTests.ts で定義された localStorage モックを参照
const localStorageMock = window.localStorage as jest.Mocked<
  typeof window.localStorage
>;

describe('useTimer フック', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-15T10:00:00.000Z'));
    // localStorageのデフォルト値をリセット
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('初期化', () => {
    test('localStorageにデータがない場合、初期状態で開始される', () => {
      const { result } = renderHook(() => useTimer());

      expect(result.current.timerState).toEqual({
        projectId: null,
        isRunning: false,
        startTime: null,
      });
    });

    test('localStorageに有効なデータがある場合、復元される', () => {
      const savedState = {
        projectId: 'project-1',
        isRunning: true,
        startTime: new Date('2025-01-15T09:00:00.000Z').toISOString(),
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedState));

      const { result } = renderHook(() => useTimer());

      expect(result.current.timerState).toEqual(savedState);
    });

    test('8時間以上前の開始時刻はリセットされる', () => {
      const oldState = {
        projectId: 'project-1',
        isRunning: true,
        startTime: new Date('2025-01-15T01:00:00.000Z').toISOString(), // 9時間前
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(oldState));

      const { result } = renderHook(() => useTimer());

      expect(result.current.timerState).toEqual({
        projectId: null,
        isRunning: false,
        startTime: null,
      });
    });

    test('8時間未満の開始時刻は維持される', () => {
      const recentState = {
        projectId: 'project-1',
        isRunning: true,
        startTime: new Date('2025-01-15T03:00:00.000Z').toISOString(), // 7時間前
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(recentState));

      const { result } = renderHook(() => useTimer());

      expect(result.current.timerState).toEqual(recentState);
    });
  });

  describe('startTimer', () => {
    test('タイマーを開始できる', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.startTimer('project-1');
      });

      expect(result.current.timerState.projectId).toBe('project-1');
      expect(result.current.timerState.isRunning).toBe(true);
      expect(result.current.timerState.startTime).toBe(
        '2025-01-15T10:00:00.000Z'
      );
    });

    test('タイマー開始後、localStorageに保存される', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.startTimer('project-1');
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        TIMER_STORAGE_KEY,
        expect.any(String)
      );

      const setItemCalls = localStorageMock.setItem.mock.calls.filter(
        (call) => call[0] === TIMER_STORAGE_KEY
      );
      const savedData = JSON.parse(setItemCalls[setItemCalls.length - 1][1]);
      expect(savedData.projectId).toBe('project-1');
      expect(savedData.isRunning).toBe(true);
    });
  });

  describe('stopTimer', () => {
    test('実行中のタイマーを停止できる', async () => {
      const startTime = new Date('2025-01-15T09:00:00.000Z').toISOString();
      const savedState = {
        projectId: 'project-1',
        isRunning: true,
        startTime,
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedState));

      const { result } = renderHook(() => useTimer());

      await act(async () => {
        await result.current.stopTimer();
      });

      expect(result.current.timerState).toEqual({
        projectId: null,
        isRunning: false,
        startTime: null,
      });
    });

    test('stopTimer時にsaveTimeEntryが呼ばれる', async () => {
      const startTime = new Date('2025-01-15T09:00:00.000Z').toISOString();
      const savedState = {
        projectId: 'project-1',
        isRunning: true,
        startTime,
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedState));

      const { result } = renderHook(() => useTimer());

      await act(async () => {
        await result.current.stopTimer();
      });

      expect(mockSaveTimeEntry).toHaveBeenCalledWith({
        projectId: 'project-1',
        startTime,
        endTime: '2025-01-15T10:00:00.000Z',
        duration: 3600000, // 1時間 = 3600000ミリ秒
      });
    });

    test('startTimeがnullの場合、saveTimeEntryは呼ばれない', async () => {
      localStorageMock.getItem.mockReturnValue(null);
      mockSaveTimeEntry.mockClear();

      const { result } = renderHook(() => useTimer());

      await act(async () => {
        await result.current.stopTimer();
      });

      expect(mockSaveTimeEntry).not.toHaveBeenCalled();
    });

    test('saveTimeEntryでエラーが発生してもタイマーは停止する', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const startTime = new Date('2025-01-15T09:00:00.000Z').toISOString();
      const savedState = {
        projectId: 'project-1',
        isRunning: true,
        startTime,
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedState));

      const { result } = renderHook(() => useTimer());

      // stopTimer呼び出し時にエラーを発生させる
      mockSaveTimeEntry.mockRejectedValueOnce(new Error('Save failed'));

      await act(async () => {
        await result.current.stopTimer();
      });

      expect(result.current.timerState).toEqual({
        projectId: null,
        isRunning: false,
        startTime: null,
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to save time entry:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('状態永続化', () => {
    test('timerState変更時にlocalStorageが更新される', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.startTimer('project-2');
      });

      const setItemCalls = localStorageMock.setItem.mock.calls.filter(
        (call) => call[0] === TIMER_STORAGE_KEY
      );
      expect(setItemCalls.length).toBeGreaterThan(0);

      const lastSavedState = JSON.parse(
        setItemCalls[setItemCalls.length - 1][1]
      );
      expect(lastSavedState.projectId).toBe('project-2');
    });
  });
});
