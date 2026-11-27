// JST 0〜9時（UTC と日付が食い違う時間帯）を再現する。TZ は jest.global-setup.cjs で JST に固定している
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

  it('日付が変わってから新規入力を開くと、開いた日の日付が入る', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-11-26T23:50:00+09:00'));
    const { result, rerender } = renderHook(
      ({ open }) =>
        useTimeEntryForm({ open, onSave: jest.fn(), onClose: jest.fn() }),
      { initialProps: { open: false } }
    );

    jest.setSystemTime(new Date('2026-11-27T09:00:00+09:00'));
    rerender({ open: true });

    expect(result.current.formState.startDate).toBe('2026-11-27');
  });

  it('日付が不正なまま送信しても例外を出さず、保存しない', () => {
    const onSave = jest.fn();
    const { result } = renderHook(() =>
      useTimeEntryForm({ onSave, onClose: jest.fn() })
    );
    act(() => {
      result.current.setProjectId('p1');
      result.current.setStartDate('');
    });

    expect(() =>
      act(() =>
        result.current.handleSubmit({ preventDefault: () => {} } as never)
      )
    ).not.toThrow();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('日をまたぐ古い記録を編集するとき、終了日は記録の終了日になり、エラーにならない', () => {
    const entry = entryAt(
      '2026-11-26T23:00:00+09:00',
      '2026-11-27T01:00:00+09:00'
    );

    const { result } = renderHook(() =>
      useTimeEntryForm({
        timeEntry: entry,
        onSave: jest.fn(),
        onClose: jest.fn(),
      })
    );

    expect(result.current.formState.startDate).toBe('2026-11-26');
    expect(result.current.formState.endDate).toBe('2026-11-27');
    expect(result.current.validationError).toBeNull();
  });

  it('日をまたぐ記録を編集して保存すると、日ごとに分割し、最初の分は元の記録を引き継ぐ', () => {
    const onSave = jest.fn();
    const entry = {
      ...entryAt('2026-11-26T23:00:00+09:00', '2026-11-27T01:00:00+09:00'),
      createdAt: '2026-11-26T00:00:00.000Z',
    };
    const { result } = renderHook(() =>
      useTimeEntryForm({ timeEntry: entry, onSave, onClose: jest.fn() })
    );

    act(() =>
      result.current.handleSubmit({ preventDefault: () => {} } as never)
    );

    expect(onSave).toHaveBeenCalledTimes(2);
    const [first, second] = onSave.mock.calls.map((c) => c[0] as TimeEntry);
    expect(first.id).toBe('e1');
    expect(first.createdAt).toBe('2026-11-26T00:00:00.000Z');
    expect(new Date(first.startTime).toISOString()).toBe(
      new Date('2026-11-26T23:00:00+09:00').toISOString()
    );
    expect(second.id).not.toBe('e1');
    expect(second.endTime).toBe(
      new Date('2026-11-27T01:00:00+09:00').toISOString()
    );
  });

  // 重なりは厳密に気にしない運用のため、重なる記録も保存できる
  it('他の記録と時間が重なっていても、保存を止めない', () => {
    const onSave = jest.fn();
    const entry = entryAt(
      '2026-11-27T10:30:00+09:00',
      '2026-11-27T11:30:00+09:00'
    );
    const { result } = renderHook(() =>
      useTimeEntryForm({
        timeEntry: entry,
        onSave,
        onClose: jest.fn(),
      })
    );

    expect(result.current.validationError).toBeNull();
    act(() =>
      result.current.handleSubmit({ preventDefault: () => {} } as never)
    );
    expect(onSave).toHaveBeenCalledTimes(1);
  });
});
