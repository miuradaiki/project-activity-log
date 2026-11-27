import { Project, TimeEntry } from '../../types';
import { calculateDuration } from './common';

const HOUR = 3600_000;

export interface TimelineSegment {
  id: string;
  projectId: string;
  /** 帯の左端からの位置（%） */
  left: number;
  /** 帯に対する幅（%） */
  width: number;
}

const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

const isSameDay = (iso: string, day: Date) =>
  startOfDay(new Date(iso)).getTime() === startOfDay(day).getTime();

export const getTodaySegments = (
  entries: TimeEntry[],
  now: Date,
  startHour = 6,
  endHour = 21
): TimelineSegment[] => {
  const base = startOfDay(now).getTime();
  const from = base + startHour * HOUR;
  const to = base + endHour * HOUR;
  const span = to - from;

  return entries
    .filter((e) => isSameDay(e.startTime, now))
    .map((e) => {
      const s = Math.max(from, new Date(e.startTime).getTime());
      const f = Math.min(
        to,
        new Date(e.startTime).getTime() +
          calculateDuration(e.startTime, e.endTime)
      );
      return {
        id: e.id,
        projectId: e.projectId,
        left: ((s - from) / span) * 100,
        width: (Math.max(0, f - s) / span) * 100,
      };
    })
    .filter((seg) => seg.width > 0);
};

export const getTodayProjectHours = (
  entries: TimeEntry[],
  now: Date
): { projectId: string; ms: number }[] => {
  const totals = new Map<string, number>();
  entries
    .filter((e) => isSameDay(e.startTime, now))
    .forEach((e) => {
      const ms = calculateDuration(e.startTime, e.endTime);
      totals.set(e.projectId, (totals.get(e.projectId) ?? 0) + ms);
    });
  return (
    Array.from(totals.entries())
      // ここで丸めると合計が作業履歴とずれるため、丸めは表示するときに1回だけ行う
      .map(([projectId, ms]) => ({ projectId, ms }))
      .sort((a, b) => b.ms - a.ms)
  );
};

export const getRecentProjects = (
  projects: Project[],
  entries: TimeEntry[],
  limit: number
): Project[] => {
  const lastUsed = new Map<string, number>();
  entries.forEach((e) => {
    const t = new Date(e.startTime).getTime();
    if (t > (lastUsed.get(e.projectId) ?? -Infinity))
      lastUsed.set(e.projectId, t);
  });
  return projects
    .filter((p) => !p.isArchived)
    .sort((a, b) => (lastUsed.get(b.id) ?? -1) - (lastUsed.get(a.id) ?? -1))
    .slice(0, limit);
};
