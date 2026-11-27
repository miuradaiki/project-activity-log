import { TimeEntry } from '../../types';
import { calculateDuration } from './common';

const HOUR = 3600_000;
const round1 = (n: number) => Math.round(n * 10) / 10;

export interface ReportDay {
  date: Date;
  byProject: Record<string, number>;
  total: number;
  isToday: boolean;
  isFuture: boolean;
}

export interface ReportWeek {
  /** 週の初日（月内）の M/D */
  label: string;
  days: ReportDay[];
  total: number;
}

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

const hoursByDay = (entries: TimeEntry[]) => {
  const map = new Map<string, Record<string, number>>();
  entries.forEach((entry) => {
    const start = new Date(entry.startTime);
    const key = dayKey(start);
    const hours = calculateDuration(entry.startTime, entry.endTime) / HOUR;
    const bucket = map.get(key) ?? {};
    bucket[entry.projectId] = (bucket[entry.projectId] ?? 0) + hours;
    map.set(key, bucket);
  });
  return map;
};

/**
 * 月内の平日を月曜始まりの週ごとにまとめる（週末は稼働対象外のため除外）。
 * month は 0 始まり。
 */
export const getWeekdayBreakdown = (
  entries: TimeEntry[],
  year: number,
  month: number,
  now: Date = new Date()
): ReportWeek[] => {
  const byDay = hoursByDay(entries);
  const todayKey = dayKey(now);
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const weeks: ReportWeek[] = [];

  for (let d = 1; d <= lastDate; d++) {
    const date = new Date(year, month, d);
    const dow = date.getDay();
    if (dow === 0 || dow === 6) continue;
    if (dow === 1 || weeks.length === 0) {
      weeks.push({ label: `${month + 1}/${d}`, days: [], total: 0 });
    }
    const raw = byDay.get(dayKey(date)) ?? {};
    const byProject: Record<string, number> = {};
    Object.entries(raw).forEach(([pid, h]) => (byProject[pid] = round1(h)));
    const total = round1(Object.values(raw).reduce((a, b) => a + b, 0));
    const week = weeks[weeks.length - 1];
    week.days.push({
      date,
      byProject,
      total,
      isToday: dayKey(date) === todayKey,
      isFuture: date.getTime() > todayStart,
    });
    week.total = round1(week.total + total);
  }
  return weeks;
};

export const getMonthProjectShares = (
  entries: TimeEntry[],
  year: number,
  month: number
): { projectId: string; hours: number; share: number }[] => {
  const totals = new Map<string, number>();
  entries.forEach((entry) => {
    const start = new Date(entry.startTime);
    if (start.getFullYear() !== year || start.getMonth() !== month) return;
    const h = calculateDuration(entry.startTime, entry.endTime) / HOUR;
    totals.set(entry.projectId, (totals.get(entry.projectId) ?? 0) + h);
  });
  const sum = Array.from(totals.values()).reduce((a, b) => a + b, 0);
  return Array.from(totals.entries())
    .map(([projectId, h]) => ({
      projectId,
      hours: round1(h),
      share: sum > 0 ? h / sum : 0,
    }))
    .sort((a, b) => b.hours - a.hours);
};
