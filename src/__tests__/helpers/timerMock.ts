export interface FakeTimerHelper {
  cleanup: () => void;
  advance: (ms: number) => void;
  setSystemTime: (date: string | Date) => void;
}

/**
 * フェイクタイマーをセットアップする
 */
export const setupFakeTimers = (
  fixedDate: string = '2025-01-15T12:00:00Z'
): FakeTimerHelper => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date(fixedDate));

  return {
    cleanup: () => jest.useRealTimers(),
    advance: (ms: number) => jest.advanceTimersByTime(ms),
    setSystemTime: (date: string | Date) => {
      jest.setSystemTime(typeof date === 'string' ? new Date(date) : date);
    },
  };
};
