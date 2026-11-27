import { groupEntriesByDay, filterHistory } from '../history-groups';
import { Project, TimeEntry } from '../../../types';

const entry = (
  id: string,
  start: string,
  end: string,
  projectId = 'p1',
  description = ''
): TimeEntry => ({
  id,
  projectId,
  startTime: new Date(start).toISOString(),
  endTime: new Date(end).toISOString(),
  description,
  createdAt: '',
  updatedAt: '',
});

describe('groupEntriesByDay', () => {
  it('ローカル日付ごとにまとめ、新しい日・新しい記録の順に並べ、日の合計を出す', () => {
    const entries = [
      entry('a', '2026-11-26T09:00:00', '2026-11-26T10:00:00'),
      entry('b', '2026-11-27T08:00:00', '2026-11-27T08:30:00'),
      entry('c', '2026-11-27T13:00:00', '2026-11-27T15:00:00'),
    ];

    const groups = groupEntriesByDay(entries);

    expect(groups.map((g) => g.key)).toEqual(['2026-11-27', '2026-11-26']);
    expect(groups[0].entries.map((e) => e.id)).toEqual(['c', 'b']);
    expect(groups[0].totalMs).toBe(2.5 * 3600_000);
    expect(groups[1].totalMs).toBe(3600_000);
  });
});

describe('filterHistory', () => {
  const projects = [
    { id: 'p1', name: 'モバイルアプリ刷新' },
    { id: 'p2', name: '採用サイト' },
  ] as Project[];
  const entries = [
    entry(
      'a',
      '2026-11-27T09:00:00',
      '2026-11-27T10:00:00',
      'p1',
      'レビュー対応'
    ),
    entry(
      'b',
      '2026-11-27T10:00:00',
      '2026-11-27T11:00:00',
      'p2',
      'コピー差し替え'
    ),
  ];

  it('プロジェクト名かメモに検索語を含む記録だけを残す（大文字小文字は無視）', () => {
    expect(
      filterHistory(entries, projects, 'モバイル', null).map((e) => e.id)
    ).toEqual(['a']);
    expect(
      filterHistory(entries, projects, 'コピー', null).map((e) => e.id)
    ).toEqual(['b']);
  });

  it('プロジェクトで絞り込める', () => {
    expect(filterHistory(entries, projects, '', 'p2').map((e) => e.id)).toEqual(
      ['b']
    );
  });
});
