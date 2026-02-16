import { TimeEntry, Project } from '../../types';
import { isWithinDateRange, calculateDuration } from './common';
import { getProjectDistribution } from './aggregations';

/**
 * 月の週数を取得
 */
const getWeeksInMonth = (year: number, month: number): number => {
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstWeekday = firstDayOfMonth.getDay();
  const lastDate = lastDayOfMonth.getDate();
  return Math.ceil((lastDate + firstWeekday) / 7);
};

/**
 * 週の日付範囲を取得
 */
const getWeekDateRange = (
  year: number,
  month: number,
  weekNumber: number
): { start: Date; end: Date } => {
  const firstDayOfMonth = new Date(year, month, 1);
  const firstWeekday = firstDayOfMonth.getDay();
  const startDate = new Date(
    year,
    month,
    1 + (weekNumber - 1) * 7 - firstWeekday
  );
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  return { start: startDate, end: endDate };
};

/**
 * 月間の週ごとの作業時間を集計
 */
export const getMonthlyDistribution = (
  timeEntries: TimeEntry[],
  year: number,
  month: number
): { week: number; hours: number }[] => {
  const weeksInMonth = getWeeksInMonth(year, month);
  const result = [];

  for (let weekNumber = 1; weekNumber <= weeksInMonth; weekNumber++) {
    const { start, end } = getWeekDateRange(year, month, weekNumber);

    const weeklyHours =
      timeEntries
        .filter((entry) => {
          const entryDate = new Date(entry.startTime);
          return isWithinDateRange(entryDate, start, end);
        })
        .reduce((total, entry) => {
          return total + calculateDuration(entry.startTime, entry.endTime);
        }, 0) /
      (1000 * 60 * 60);

    result.push({
      week: weekNumber,
      hours: Number(weeklyHours.toFixed(1)),
    });
  }

  return result;
};

/**
 * 月間の進捗状況を計算
 */
export const calculateMonthlyProgress = (
  timeEntries: TimeEntry[],
  projectId: string,
  monthlyTarget: number
): { monthlyHours: number; monthlyPercentage: number } => {
  const now = new Date();
  const startOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
    0,
    0,
    0,
    0
  );
  const endOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );

  const monthlyHours =
    timeEntries
      .filter((entry) => {
        const entryDate = new Date(entry.startTime);
        return (
          entry.projectId === projectId &&
          isWithinDateRange(entryDate, startOfMonth, endOfMonth)
        );
      })
      .reduce((total, entry) => {
        return total + calculateDuration(entry.startTime, entry.endTime);
      }, 0) /
    (1000 * 60 * 60);

  const monthlyPercentage =
    monthlyTarget > 0 ? (monthlyHours / monthlyTarget) * 100 : 0;

  return {
    monthlyHours: Number(monthlyHours.toFixed(1)),
    monthlyPercentage: Number(monthlyPercentage.toFixed(1)),
  };
};

/**
 * 稼働率から月間の目標時間を計算
 * 基準を月間140時間（または設定値）として計算
 * @param allocationPercentage 稼働率（0-100）
 * @param baseMonthlyHours 基準月間時間（デフォルト: 140時間）
 */
export const calculateMonthlyTargetHours = (
  allocationPercentage: number,
  baseMonthlyHours: number = 140
): number => {
  const normalizedPercentage = Math.max(0, Math.min(100, allocationPercentage));
  const targetHours = (normalizedPercentage / 100) * baseMonthlyHours;
  return Number(targetHours.toFixed(1));
};

/**
 * 前月のプロジェクトごとの作業時間を集計
 */
export const getPreviousMonthProjectDistribution = (
  timeEntries: TimeEntry[],
  projects: Project[]
): { projectName: string; hours: number }[] => {
  const now = new Date();
  const startOfPrevMonth = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    1,
    0,
    0,
    0,
    0
  );
  const endOfPrevMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    0,
    23,
    59,
    59,
    999
  );

  return getProjectDistribution(
    timeEntries,
    projects,
    startOfPrevMonth,
    endOfPrevMonth
  );
};

/**
 * 全プロジェクトの月間目標時間を合計
 * アーカイブされたプロジェクトは除外
 */
export const calculateTotalMonthlyTarget = (
  projects: Project[],
  baseMonthlyHours: number
): number => {
  const totalTarget = projects
    .filter((project) => !project.isArchived)
    .reduce((total, project) => {
      const targetHours = calculateMonthlyTargetHours(
        project.monthlyCapacity * 100,
        baseMonthlyHours
      );
      return total + targetHours;
    }, 0);

  return Number(totalTarget.toFixed(1));
};

/**
 * 今月の残り営業日数を計算（土日除外、今日を含む）
 */
export const calculateRemainingWorkingDays = (date?: Date): number => {
  const now = date || new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();
  const today = now.getDate();

  let workingDays = 0;

  for (let day = today; day <= lastDay; day++) {
    const d = new Date(year, month, day);
    const dayOfWeek = d.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDays++;
    }
  }

  return workingDays;
};
