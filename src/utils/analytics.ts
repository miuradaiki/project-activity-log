import { TimeEntry, Project } from '../types';

// 日付の範囲内かどうかをチェック
const isWithinDateRange = (date: Date, startDate: Date, endDate: Date): boolean => {
  return date >= startDate && date <= endDate;
};

// 作業時間を計算（ミリ秒）
const calculateDuration = (startTime: string, endTime: string | null): number => {
  const start = new Date(startTime).getTime();
  const end = endTime ? new Date(endTime).getTime() : new Date().getTime();
  return end - start;
};

// 指定した日の作業時間を集計
export const getDailyWorkHours = (
  timeEntries: TimeEntry[],
  targetDate: Date
): number => {
  const startOfDay = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate(),
    0, 0, 0, 0
  );
  const endOfDay = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate(),
    23, 59, 59, 999
  );

  return timeEntries
    .filter(entry => {
      const entryDate = new Date(entry.startTime);
      return isWithinDateRange(entryDate, startOfDay, endOfDay);
    })
    .reduce((total, entry) => {
      return total + calculateDuration(entry.startTime, entry.endTime);
    }, 0) / (1000 * 60 * 60); // ミリ秒から時間に変換
};

// プロジェクトごとの作業時間を集計
export const getProjectDistribution = (
  timeEntries: TimeEntry[],
  projects: Project[],
  startDate: Date,
  endDate: Date
): { projectName: string; hours: number }[] => {
  const distribution = timeEntries
    .filter(entry => {
      const entryDate = new Date(entry.startTime);
      return isWithinDateRange(entryDate, startDate, endDate);
    })
    .reduce((acc, entry) => {
      const projectId = entry.projectId;
      const duration = calculateDuration(entry.startTime, entry.endTime);
      acc[projectId] = (acc[projectId] || 0) + duration;
      return acc;
    }, {} as { [key: string]: number });

  return Object.entries(distribution).map(([projectId, duration]) => ({
    projectName: projects.find(p => p.id === projectId)?.name || '不明なプロジェクト',
    hours: duration / (1000 * 60 * 60)
  }));
};

// 週次の日ごとの作業時間を集計
export const getWeeklyDistribution = (
  timeEntries: TimeEntry[],
  startOfWeek: Date
): { date: string; hours: number }[] => {
  const result = [];
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(
      startOfWeek.getFullYear(),
      startOfWeek.getMonth(),
      startOfWeek.getDate() + i
    );
    
    const hours = getDailyWorkHours(timeEntries, currentDate);
    result.push({
      date: currentDate.toLocaleDateString('ja-JP', { weekday: 'short' }),
      hours
    });
  }
  return result;
};

// 指定した日付の週番号を取得（月内）
const getWeekNumber = (date: Date): number => {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const firstWeekday = firstDayOfMonth.getDay();
  return Math.ceil((date.getDate() + firstWeekday) / 7);
};

// 月の週数を取得
const getWeeksInMonth = (year: number, month: number): number => {
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstWeekday = firstDayOfMonth.getDay();
  const lastDate = lastDayOfMonth.getDate();
  return Math.ceil((lastDate + firstWeekday) / 7);
};

// 週の日付範囲を取得
const getWeekDateRange = (year: number, month: number, weekNumber: number): { start: Date; end: Date } => {
  const firstDayOfMonth = new Date(year, month, 1);
  const firstWeekday = firstDayOfMonth.getDay();
  const startDate = new Date(year, month, 1 + (weekNumber - 1) * 7 - firstWeekday);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  return { start: startDate, end: endDate };
};

// 月間の週ごとの作業時間を集計
export const getMonthlyDistribution = (
  timeEntries: TimeEntry[],
  year: number,
  month: number
): { week: number; hours: number }[] => {
  const weeksInMonth = getWeeksInMonth(year, month);
  const result = [];

  for (let weekNumber = 1; weekNumber <= weeksInMonth; weekNumber++) {
    const { start, end } = getWeekDateRange(year, month, weekNumber);
    
    const weeklyHours = timeEntries
      .filter(entry => {
        const entryDate = new Date(entry.startTime);
        return isWithinDateRange(entryDate, start, end);
      })
      .reduce((total, entry) => {
        return total + calculateDuration(entry.startTime, entry.endTime);
      }, 0) / (1000 * 60 * 60);

    result.push({
      week: weekNumber,
      hours: weeklyHours
    });
  }

  return result;
};

// 最もアクティブなプロジェクトを取得
export const getMostActiveProject = (
  timeEntries: TimeEntry[],
  projects: Project[],
  startDate: Date,
  endDate: Date
): { projectName: string; hours: number } => {
  const distribution = getProjectDistribution(timeEntries, projects, startDate, endDate);
  return distribution.reduce((max, current) => 
    current.hours > max.hours ? current : max
  , { projectName: '', hours: 0 });
};

// 月間の進捗状況を計算
export const calculateMonthlyProgress = (
  timeEntries: TimeEntry[],
  projectId: string,
  monthlyTarget: number
): { monthlyHours: number; monthlyPercentage: number } => {
  // 現在の月の開始日と終了日を取得
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  // プロジェクトの当月の作業時間を集計
  const monthlyHours = timeEntries
    .filter(entry => {
      const entryDate = new Date(entry.startTime);
      return (
        entry.projectId === projectId &&
        isWithinDateRange(entryDate, startOfMonth, endOfMonth)
      );
    })
    .reduce((total, entry) => {
      return total + calculateDuration(entry.startTime, entry.endTime);
    }, 0) / (1000 * 60 * 60); // ミリ秒から時間に変換

  // 進捗率を計算
  const monthlyPercentage = monthlyTarget > 0 ? (monthlyHours / monthlyTarget) * 100 : 0;

  return {
    monthlyHours,
    monthlyPercentage
  };
};