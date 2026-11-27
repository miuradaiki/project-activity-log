import { format } from 'date-fns';
import { Project, TimeEntry } from '../../types';
import { calculateDuration } from '../../utils/analytics/common';

export interface HistoryDayGroup {
  /** ローカル日付 yyyy-MM-dd */
  key: string;
  date: Date;
  totalMs: number;
  entries: TimeEntry[];
}

const byStartDesc = (a: TimeEntry, b: TimeEntry) =>
  new Date(b.startTime).getTime() - new Date(a.startTime).getTime();

/** 作業履歴を開始日（ローカル）ごとにまとめる。新しい日・新しい記録が先 */
export const groupEntriesByDay = (entries: TimeEntry[]): HistoryDayGroup[] => {
  const groups = new Map<string, HistoryDayGroup>();
  [...entries].sort(byStartDesc).forEach((e) => {
    const start = new Date(e.startTime);
    const key = format(start, 'yyyy-MM-dd');
    const group = groups.get(key) ?? {
      key,
      date: new Date(start.getFullYear(), start.getMonth(), start.getDate()),
      totalMs: 0,
      entries: [],
    };
    group.entries.push(e);
    group.totalMs += calculateDuration(e.startTime, e.endTime);
    groups.set(key, group);
  });
  return Array.from(groups.values());
};

export const filterHistory = (
  entries: TimeEntry[],
  projects: Project[],
  query: string,
  projectId: string | null
): TimeEntry[] => {
  const q = query.trim().toLowerCase();
  const names = new Map(projects.map((p) => [p.id, p.name.toLowerCase()]));
  return entries.filter(
    (e) =>
      (!projectId || e.projectId === projectId) &&
      (!q ||
        (names.get(e.projectId) ?? '').includes(q) ||
        e.description.toLowerCase().includes(q))
  );
};
