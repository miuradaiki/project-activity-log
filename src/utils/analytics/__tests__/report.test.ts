import { getWeekdayBreakdown } from '../report';
import { TimeEntry } from '../../../types';

const e = (projectId: string, start: string, hours: number): TimeEntry => {
  const s = new Date(start);
  return {
    id: `${projectId}-${start}`,
    projectId,
    startTime: s.toISOString(),
    endTime: new Date(s.getTime() + hours * 3600_000).toISOString(),
    description: '',
    createdAt: '',
    updatedAt: '',
  };
};

describe('getWeekdayBreakdown', () => {
  // 2026年11月: 1日(日)〜30日(月)。平日は 2日(月) から
  const entries = [
    e('a', '2026-11-02T09:00:00', 3),
    e('b', '2026-11-02T13:00:00', 2),
    e('a', '2026-11-07T09:00:00', 4), // 土曜は除外
    e('a', '2026-10-30T09:00:00', 5), // 先月は除外
  ];
  const weeks = getWeekdayBreakdown(
    entries,
    2026,
    10,
    new Date(2026, 10, 26, 12)
  );

  it('月内の平日を月曜始まりの週にまとめる', () => {
    expect(weeks.map((w) => w.label)).toEqual([
      '11/2',
      '11/9',
      '11/16',
      '11/23',
      '11/30',
    ]);
    expect(weeks[0].days).toHaveLength(5);
    expect(weeks[4].days).toHaveLength(1);
  });

  it('日ごとにプロジェクト別の時間を持ち、週の合計を返す', () => {
    expect(weeks[0].days[0].byProject).toEqual({ a: 3, b: 2 });
    expect(weeks[0].total).toBe(5);
  });

  it('今日と未来の日を区別する', () => {
    const thursday = weeks[3].days[3];
    expect(thursday.isToday).toBe(true);
    expect(weeks[3].days[4].isFuture).toBe(true);
    expect(thursday.isFuture).toBe(false);
  });
});
