import { TimeEntry } from '../../types';
import { calculateDuration } from './common';

/**
 * 月間作業進捗の予想完了日を計算
 */
export const predictCompletionDate = (
  currentHours: number,
  targetHours: number,
  dailyAverageHours: number
): Date | null => {
  if (currentHours >= targetHours || dailyAverageHours <= 0) {
    return null;
  }

  const remainingHours = targetHours - currentHours;
  const daysNeeded = Math.ceil(remainingHours / dailyAverageHours);

  const completionDate = new Date();
  completionDate.setDate(completionDate.getDate() + daysNeeded);

  return completionDate;
};

/**
 * プロジェクトの1日あたりの推奨作業時間を計算
 */
export const calculateRecommendedDailyHours = (
  currentHours: number,
  targetHours: number
): number => {
  const now = new Date();
  const currentDay = now.getDate();
  const lastDayOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0
  ).getDate();
  const remainingDays = lastDayOfMonth - currentDay + 1;

  if (remainingDays <= 0 || currentHours >= targetHours) {
    return 0;
  }

  const remainingHours = targetHours - currentHours;
  const recommendedHours = remainingHours / remainingDays;

  return Number(recommendedHours.toFixed(1));
};

/**
 * プロジェクトの日次平均作業時間を計算
 */
export const calculateDailyAverageHours = (
  timeEntries: TimeEntry[],
  projectId: string
): number => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const filteredEntries = timeEntries.filter((entry) => {
    const entryDate = new Date(entry.startTime);
    return entry.projectId === projectId && entryDate >= startOfMonth;
  });

  if (filteredEntries.length === 0) return 0;

  const workDays = new Set<string>();
  filteredEntries.forEach((entry) => {
    const date = new Date(entry.startTime);
    workDays.add(`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`);
  });

  const totalHours = filteredEntries.reduce((total, entry) => {
    return (
      total +
      calculateDuration(entry.startTime, entry.endTime) / (1000 * 60 * 60)
    );
  }, 0);

  return workDays.size > 0
    ? Number((totalHours / workDays.size).toFixed(1))
    : 0;
};
