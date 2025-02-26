import { TimeEntry, Project } from '../types';

// 日付の範囲内かどうかをチェック
const isWithinDateRange = (date: Date, startDate: Date, endDate: Date): boolean => {
  const normalizedDate = new Date(date.getTime());
  normalizedDate.setHours(0, 0, 0, 0);
  const normalizedStart = new Date(startDate.getTime());
  normalizedStart.setHours(0, 0, 0, 0);
  const normalizedEnd = new Date(endDate.getTime());
  normalizedEnd.setHours(23, 59, 59, 999);
  return normalizedDate >= normalizedStart && normalizedDate <= normalizedEnd;
};

// 作業時間を計算（ミリ秒）
const calculateDuration = (startTime: string, endTime: string | null): number => {
  const start = new Date(startTime).getTime();
  const end = endTime ? new Date(endTime).getTime() : new Date().getTime();
  return end - start;
};

// 指定した日の作業時間を集計（プロジェクト別）
export const getDailyProjectHours = (
  timeEntries: TimeEntry[],
  projects: Project[],
  targetDate: Date
): { [key: string]: number } => {
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  const projectHours: { [key: string]: number } = {};
  
  // プロジェクトごとに初期化
  projects.forEach(project => {
    projectHours[project.name] = 0;
  });

  timeEntries
    .filter(entry => {
      const entryDate = new Date(entry.startTime);
      return isWithinDateRange(entryDate, startOfDay, endOfDay);
    })
    .forEach(entry => {
      const projectName = projects.find(p => p.id === entry.projectId)?.name;
      if (projectName) {
        const hours = calculateDuration(entry.startTime, entry.endTime) / (1000 * 60 * 60);
        projectHours[projectName] = (projectHours[projectName] || 0) + hours;
      }
    });

  // 小数点第一位まで丸める
  Object.keys(projectHours).forEach(key => {
    projectHours[key] = Number(projectHours[key].toFixed(1));
  });

  return projectHours;
};

// 指定した日の合計作業時間を集計
export const getDailyWorkHours = (
  timeEntries: TimeEntry[],
  targetDate: Date
): number => {
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  const totalMilliseconds = timeEntries
    .filter(entry => {
      const entryDate = new Date(entry.startTime);
      return isWithinDateRange(entryDate, startOfDay, endOfDay);
    })
    .reduce((total, entry) => {
      return total + calculateDuration(entry.startTime, entry.endTime);
    }, 0);

  return Number((totalMilliseconds / (1000 * 60 * 60)).toFixed(1));
};

// プロジェクトごとの作業時間を集計
export const getProjectDistribution = (
  timeEntries: TimeEntry[],
  projects: Project[],
  startDate: Date,
  endDate: Date
): { projectName: string; hours: number }[] => {
  const filteredEntries = timeEntries.filter(entry => {
    const entryStartDate = new Date(entry.startTime);
    const entryEndDate = entry.endTime ? new Date(entry.endTime) : new Date();
    return (
      (entryStartDate >= startDate && entryStartDate <= endDate) ||
      (entryEndDate >= startDate && entryEndDate <= endDate)
    );
  });

  const projectHours = new Map<string, number>();

  filteredEntries.forEach(entry => {
    const duration = calculateDuration(entry.startTime, entry.endTime);
    const hours = duration / (1000 * 60 * 60);
    const currentHours = projectHours.get(entry.projectId) || 0;
    projectHours.set(entry.projectId, currentHours + hours);
  });

  return Array.from(projectHours.entries())
    .map(([projectId, hours]) => ({
      projectName: projects.find(p => p.id === projectId)?.name || '不明なプロジェクト',
      hours: Number(hours.toFixed(1))
    }))
    .filter(item => item.hours > 0)
    .sort((a, b) => b.hours - a.hours);
};

// 週次の日ごとのプロジェクト別作業時間を集計
export const getWeeklyDistribution = (
  timeEntries: TimeEntry[],
  projects: Project[],
  startOfWeek: Date
): { date: string }[] => {
  const days = ['月', '火', '水', '木', '金', '土', '日'];
  const result = [];
  
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(startOfWeek);
    currentDate.setDate(startOfWeek.getDate() + i);
    
    const projectHours = getDailyProjectHours(timeEntries, projects, currentDate);
    result.push({
      date: days[i],
      ...projectHours
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
      hours: Number(weeklyHours.toFixed(1))
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
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

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
    }, 0) / (1000 * 60 * 60);

  const monthlyPercentage = monthlyTarget > 0 ? (monthlyHours / monthlyTarget) * 100 : 0;

  return {
    monthlyHours: Number(monthlyHours.toFixed(1)),
    monthlyPercentage: Number(monthlyPercentage.toFixed(1))
  };
};

/**
 * 特定のプロジェクトの指定期間での作業時間を計算
 */
export const calculateProjectHours = (
  timeEntries: TimeEntry[],
  projectId: string,
  startDate: Date,
  endDate: Date
): number => {
  const filteredEntries = timeEntries.filter(entry => {
    const entryDate = new Date(entry.startTime);
    return (
      entry.projectId === projectId &&
      entryDate >= startDate && 
      entryDate <= endDate
    );
  });

  const totalHours = filteredEntries.reduce((total, entry) => {
    return total + calculateDuration(entry.startTime, entry.endTime);
  }, 0) / (1000 * 60 * 60);

  return Number(totalHours.toFixed(1));
};

/**
 * 稼働率から月間の目標時間を計算
 * 基準を月間140時間（または設定値）として計算
 * @param allocationPercentage 稼働率（0-100）
 * @param baseMonthlyHours 基準月間時間（デフォルト: 140時間）
 */
export const calculateMonthlyTargetHours = (
  allocationPercentage: number,
  baseMonthlyHours: number = 140 // デフォルト値として140時間を使用
): number => {
  // 入力された値が0〜100の範囲内に収まるように調整
  const normalizedPercentage = Math.max(0, Math.min(100, allocationPercentage));
  const targetHours = (normalizedPercentage / 100) * baseMonthlyHours;
  return Number(targetHours.toFixed(1));
};

/**
 * 月間作業進捗の予想完了日を計算
 */
export const predictCompletionDate = (
  currentHours: number,
  targetHours: number,
  dailyAverageHours: number
): Date | null => {
  if (currentHours >= targetHours || dailyAverageHours <= 0) {
    return null; // すでに目標達成、または進捗がない場合
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
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
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
  
  // プロジェクトの今月の作業記録
  const filteredEntries = timeEntries.filter(entry => {
    const entryDate = new Date(entry.startTime);
    return entry.projectId === projectId && entryDate >= startOfMonth;
  });
  
  if (filteredEntries.length === 0) return 0;
  
  // 作業があった日を収集
  const workDays = new Set<string>();
  filteredEntries.forEach(entry => {
    const date = new Date(entry.startTime);
    workDays.add(`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`);
  });
  
  // 合計作業時間
  const totalHours = filteredEntries.reduce((total, entry) => {
    return total + calculateDuration(entry.startTime, entry.endTime) / (1000 * 60 * 60);
  }, 0);
  
  // 作業日数で割って平均を計算
  return workDays.size > 0 ? Number((totalHours / workDays.size).toFixed(1)) : 0;
};