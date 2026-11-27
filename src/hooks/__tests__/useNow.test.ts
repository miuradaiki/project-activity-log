import { renderHook, act } from '@testing-library/react';
import { useNow } from '../useNow';

describe('useNow', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('指定間隔ごとに現在時刻を更新する', () => {
    jest.setSystemTime(new Date(2026, 10, 26, 10, 0, 0));
    const { result } = renderHook(() => useNow(60_000));
    const first = result.current;

    act(() => {
      jest.advanceTimersByTime(60_000);
    });

    expect(result.current - first).toBe(60_000);
  });

  it('無効なときは更新しない', () => {
    const { result } = renderHook(() => useNow(1000, false));
    const first = result.current;

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(result.current).toBe(first);
  });
});
