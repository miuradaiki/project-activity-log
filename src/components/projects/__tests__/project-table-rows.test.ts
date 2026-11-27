import {
  buildProjectRows,
  filterProjectRows,
  sortProjectRows,
} from '../project-table-rows';
import { Project, TimeEntry } from '../../../types';

const p = (
  id: string,
  name: string,
  monthlyCapacity: number,
  isArchived = false
): Project => ({
  id,
  name,
  description: '',
  monthlyCapacity,
  isArchived,
  createdAt: '',
  updatedAt: '',
});

const e = (projectId: string, hours: number): TimeEntry => {
  const s = new Date(2026, 10, 2, 9);
  return {
    id: `${projectId}`,
    projectId,
    startTime: s.toISOString(),
    endTime: new Date(s.getTime() + hours * 3600_000).toISOString(),
    description: '',
    createdAt: '',
    updatedAt: '',
  };
};

const NOW = new Date(2026, 10, 26, 12);
const projects = [
  p('ec', 'EC開発', 0.4), // 31.8 / 56
  p('inv', '在庫管理', 0.3), // 30.6 / 42
  p('crm', '顧客管理基盤', 0.2), // 34.7 / 28 超過
  p('study', '社内勉強会', 0), // 追跡のみ
  p('old', '旧案件', 0.1, true),
];
const entries = [
  e('ec', 31.8),
  e('inv', 30.6),
  e('crm', 34.7),
  e('study', 4.5),
];
const rows = buildProjectRows(projects, entries, 140, NOW);

describe('project table rows', () => {
  it('アーカイブ済みを分けて行を作る', () => {
    expect(rows.active.map((r) => r.project.id)).toEqual([
      'ec',
      'inv',
      'crm',
      'study',
    ]);
    expect(rows.archived.map((r) => r.project.id)).toEqual(['old']);
  });

  it('フィルタ: 進行中は目標内、超過は目標超え、追跡のみは目標なし', () => {
    const ids = (f: Parameters<typeof filterProjectRows>[1]) =>
      filterProjectRows(rows.active, f, '').map((r) => r.project.id);

    expect(ids('all')).toEqual(['ec', 'inv', 'crm', 'study']);
    expect(ids('active')).toEqual(['ec', 'inv']);
    expect(ids('over')).toEqual(['crm']);
    expect(ids('tracking')).toEqual(['study']);
  });

  it('検索語は名前の部分一致（大文字小文字を区別しない）', () => {
    expect(
      filterProjectRows(rows.active, 'all', '管理').map((r) => r.project.id)
    ).toEqual(['inv', 'crm']);
  });

  it('進捗順は比率の高い順、追跡のみは最後', () => {
    expect(
      sortProjectRows(rows.active, 'progress').map((r) => r.project.id)
    ).toEqual(['crm', 'inv', 'ec', 'study']);
  });

  it('残り時間順は残りの多い順', () => {
    expect(
      sortProjectRows(rows.active, 'remaining').map((r) => r.project.id)
    ).toEqual(['ec', 'inv', 'crm', 'study']);
  });
});
