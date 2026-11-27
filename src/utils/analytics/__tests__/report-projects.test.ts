import { getMonthProjectRows, summarizeProjectRows } from '../report-projects';
import { Project, TimeEntry } from '../../../types';

const project = (
  id: string,
  monthlyCapacity: number,
  isArchived = false
): Project => ({
  id,
  name: id,
  description: '',
  monthlyCapacity,
  isArchived,
  createdAt: '',
  updatedAt: '',
});

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

// 基準 100h → 配分 30% = 30h、10% = 10h
const BASE = 100;

describe('getMonthProjectRows', () => {
  const projects = [
    project('low', 0.3),
    project('over', 0.1),
    project('track-small', 0),
    project('track-big', 0),
    project('idle', 0.3),
    project('track-idle', 0),
    project('archived', 0.2, true),
  ];
  const entries = [
    e('low', '2026-11-02T09:00:00', 6),
    e('over', '2026-11-03T09:00:00', 12),
    e('track-small', '2026-11-04T09:00:00', 1),
    e('track-big', '2026-11-04T11:00:00', 5),
    e('archived', '2026-11-05T09:00:00', 2),
    e('low', '2026-10-30T09:00:00', 20), // 先月は含めない
  ];
  const rows = getMonthProjectRows(projects, entries, BASE, 2026, 10);

  it('配分のあるプロジェクトを割合の高い順に並べ、追跡のみは後ろに時間の多い順で並べる', () => {
    expect(rows.map((r) => r.projectId)).toEqual([
      'over', // 12 / 10h
      'low', // 6 / 30h
      'archived', // 2 / 20h（アーカイブ済みでも今月の作業があれば出す）
      'idle', // 0 / 30h
      'track-big',
      'track-small',
    ]);
  });

  it('配分に対する実績と割合を返す。超過は割合を切り捨てない', () => {
    const over = rows.find((r) => r.projectId === 'over')!;
    expect(over).toMatchObject({
      actualHours: 12,
      targetHours: 10,
      status: 'over',
      isTrackingOnly: false,
    });
    expect(over.ratio).toBeCloseTo(1.2);
  });

  it('作業のない追跡のみのプロジェクトは出さないが、配分のあるプロジェクトは0hでも出す', () => {
    expect(rows.find((r) => r.projectId === 'track-idle')).toBeUndefined();
    expect(rows.find((r) => r.projectId === 'idle')).toMatchObject({
      actualHours: 0,
      targetHours: 30,
    });
  });
});

describe('summarizeProjectRows', () => {
  it('配分のある合計と、超過・90%以上の件数、追跡のみの時間を返す', () => {
    const projects = [
      project('a', 0.1),
      project('b', 0.1),
      project('c', 0.3),
      project('t', 0),
    ];
    const entries = [
      e('a', '2026-11-02T09:00:00', 11),
      e('b', '2026-11-02T09:00:00', 9.5),
      e('c', '2026-11-02T09:00:00', 3),
      e('t', '2026-11-02T09:00:00', 4),
    ];
    const rows = getMonthProjectRows(projects, entries, BASE, 2026, 10);

    expect(summarizeProjectRows(rows)).toEqual({
      actualHours: 23.5,
      targetHours: 50,
      ratio: 0.47,
      overCount: 1,
      warningCount: 1,
      trackingHours: 4,
    });
  });
});
