import { getProjectMonthProgress, getMonthOverview } from '../project-progress';
import { Project, TimeEntry } from '../../../types';

const project = (monthlyCapacity: number): Project => ({
  id: 'p1',
  name: 'EC開発',
  description: '',
  monthlyCapacity,
  isArchived: false,
  createdAt: '2026-01-01T00:00:00',
  updatedAt: '2026-01-01T00:00:00',
});

const entry = (start: string, hours: number, projectId = 'p1'): TimeEntry => {
  const s = new Date(start);
  const e = new Date(s.getTime() + hours * 3600_000);
  return {
    id: `${projectId}-${start}`,
    projectId,
    startTime: s.toISOString(),
    endTime: e.toISOString(),
    description: '',
    createdAt: s.toISOString(),
    updatedAt: s.toISOString(),
  };
};

// 2026-11-26（木）。11月の残り営業日は 26,27,30 の3日
const NOW = new Date(2026, 10, 26, 12, 0, 0);

describe('getProjectMonthProgress', () => {
  it('設定の基準時間と稼働率から目標時間を計算する', () => {
    const result = getProjectMonthProgress(project(0.4), [], 160, NOW);

    expect(result.targetHours).toBe(64);
  });

  it('今月の記録だけを実績として合計し、他プロジェクトと先月は除く', () => {
    const entries = [
      entry('2026-11-02T09:00:00', 3),
      entry('2026-11-20T09:00:00', 1.5),
      entry('2026-10-30T09:00:00', 5),
      entry('2026-11-20T13:00:00', 2, 'other'),
    ];

    const result = getProjectMonthProgress(project(0.5), entries, 140, NOW);

    expect(result.actualHours).toBe(4.5);
  });

  it('目標を超えた場合は比率を100%で切り捨てず、超過時間と over 状態を返す', () => {
    const entries = [entry('2026-11-02T09:00:00', 34.7)];

    const result = getProjectMonthProgress(project(0.2), entries, 140, NOW);

    expect(result.ratio).toBeCloseTo(34.7 / 28, 5);
    expect(result.overHours).toBe(6.7);
    expect(result.remainingHours).toBe(0);
    expect(result.status).toBe('over');
  });

  it('90%以上100%以下は warning、それ未満は ok', () => {
    const warning = getProjectMonthProgress(
      project(0.1),
      [entry('2026-11-02T09:00:00', 13)],
      140,
      NOW
    );
    const ok = getProjectMonthProgress(
      project(0.1),
      [entry('2026-11-02T09:00:00', 5)],
      140,
      NOW
    );

    expect(warning.status).toBe('warning');
    expect(ok.status).toBe('ok');
  });

  it('残り時間を残り営業日で割った必要ペースを返す', () => {
    const entries = [entry('2026-11-02T09:00:00', 30.6)];

    const result = getProjectMonthProgress(project(0.3), entries, 140, NOW);

    expect(result.remainingHours).toBe(11.4);
    expect(result.requiredDailyHours).toBe(3.8);
  });

  it('稼働率0のプロジェクトは追跡のみとして扱い、比率と目標を持たない', () => {
    const entries = [entry('2026-11-02T09:00:00', 4.5)];

    const result = getProjectMonthProgress(project(0), entries, 140, NOW);

    expect(result.status).toBe('tracking');
    expect(result.isTrackingOnly).toBe(true);
    expect(result.ratio).toBe(0);
    expect(result.actualHours).toBe(4.5);
  });
});

describe('getMonthOverview', () => {
  it('目標のあるプロジェクトの実績と目標を合計し、必要ペースを返す', () => {
    const projects = [
      { ...project(0.4), id: 'a' },
      { ...project(0.3), id: 'b' },
      { ...project(0), id: 'tracking' },
      { ...project(0.2), id: 'archived', isArchived: true },
    ];
    const entries = [
      entry('2026-11-02T09:00:00', 30, 'a'),
      entry('2026-11-03T09:00:00', 10, 'b'),
      entry('2026-11-04T09:00:00', 4, 'tracking'),
    ];

    const result = getMonthOverview(projects, entries, 140, NOW);

    expect(result.targetHours).toBe(98);
    expect(result.actualHours).toBe(40);
    expect(result.totalHours).toBe(44);
    expect(result.ratio).toBeCloseTo(40 / 98, 5);
    expect(result.remainingWorkingDays).toBe(3);
    expect(result.requiredDailyHours).toBe(19.3);
  });
});
