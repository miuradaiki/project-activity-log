import { TimeEntry } from '../../types';

/**
 * 日付の範囲内かどうかをチェック
 */
export const isWithinDateRange = (
  date: Date,
  startDate: Date,
  endDate: Date
): boolean => {
  const normalizedDate = new Date(date.getTime());
  normalizedDate.setHours(0, 0, 0, 0);
  const normalizedStart = new Date(startDate.getTime());
  normalizedStart.setHours(0, 0, 0, 0);
  const normalizedEnd = new Date(endDate.getTime());
  normalizedEnd.setHours(23, 59, 59, 999);
  return normalizedDate >= normalizedStart && normalizedDate <= normalizedEnd;
};

/**
 * 作業時間を計算（ミリ秒）
 */
export const calculateDuration = (
  startTime: string,
  endTime: string | null
): number => {
  const start = new Date(startTime).getTime();
  const end = endTime ? new Date(endTime).getTime() : new Date().getTime();
  return end - start;
};

/**
 * 指定した日の開始と終了を取得
 */
export const getDayBoundaries = (
  targetDate: Date
): { startOfDay: Date; endOfDay: Date } => {
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);
  return { startOfDay, endOfDay };
};

/**
 * タイムエントリーを日付範囲でフィルタリング
 */
export const filterEntriesByDateRange = (
  timeEntries: TimeEntry[],
  startDate: Date,
  endDate: Date
): TimeEntry[] => {
  return timeEntries.filter((entry) => {
    const entryDate = new Date(entry.startTime);
    return isWithinDateRange(entryDate, startDate, endDate);
  });
};
