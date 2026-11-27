// UTC と日付が食い違う時間帯（JST 0〜9時）を再現するため、タイムゾーンを固定する
process.env.TZ = 'Asia/Tokyo';

import { renderHook, act } from '@testing-library/react';
import { useTimeEntryForm } from '../useTimeEntryForm';
import { TimeEntry } from '../../../../types';

const entryAt = (start: string, end: string): TimeEntry => ({
  id: 'e1',
  projectId: 'p1',
  startTime: new Date(start).toISOString(),
  endTime: new Date(end).toISOString(),
  description: '',
  createdAt: '',
  updatedAt: '',
});

describe('useTimeEntryForm の日付（ローカル時刻基準）', () => {
  afterEach(() => jest.useRealTimers());

  it('朝8時の記録を編集するとき、日付が前日にならない', () => {
    const entry = entryAt(
      '2026-11-27T08:00:00+09:00',
      '2026-11-27T08:30:00+09:00'
    );

    const { result } = renderHook(() =>
      useTimeEntryForm({
        timeEntry: entry,
        onSave: jest.fn(),
        onClose: jest.fn(),
      })
    );

    expect(result.current.formState.startDate).toBe('2026-11-27');
    expect(result.current.formState.endDate).toBe('2026-11-27');
  });

  it('朝8時に新規入力を開くと、今日の日付が入る', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-11-27T08:00:00+09:00'));

    const { result } = renderHook(() =>
      useTimeEntryForm({ onSave: jest.fn(), onClose: jest.fn() })
    );

    expect(result.current.formState.startDate).toBe('2026-11-27');
  });

  it('朝8時に「今」を押すと、今日の日付が入る', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-11-27T08:05:00+09:00'));
    const { result } = renderHook(() =>
      useTimeEntryForm({ onSave: jest.fn(), onClose: jest.fn() })
    );

    act(() => result.current.handleSetCurrentTime('end'));

    expect(result.current.formState.endDate).toBe('2026-11-27');
    expect(result.current.formState.endTime).toBe('08:05');
  });

  it('朝8時の記録を編集して保存しても、同じ日の記録のまま', () => {
    const onSave = jest.fn();
    const entry = entryAt(
      '2026-11-27T08:00:00+09:00',
      '2026-11-27T08:30:00+09:00'
    );
    const { result } = renderHook(() =>
      useTimeEntryForm({ timeEntry: entry, onSave, onClose: jest.fn() })
    );

    act(() =>
      result.current.handleSubmit({ preventDefault: () => {} } as never)
    );

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        startTime: entry.startTime,
        endTime: entry.endTime,
      })
    );
  });
});
