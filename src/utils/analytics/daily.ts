import { TimeEntry, Project } from '../../types';
import {
  isWithinDateRange,
  calculateDuration,
  getDayBoundaries,
} from './common';

/**
 * 指定した日の作業時間を集計（プロジェクト別）
 */
export const getDailyProjectHours = (
  timeEntries: TimeEntry[],
  projects: Project[],
  targetDate: Date
): { [key: string]: number } => {
  const { startOfDay, endOfDay } = getDayBoundaries(targetDate);

  const projectHours: { [key: string]: number } = {};

  // アーカイブされていないプロジェクトのみを初期化
  projects
    .filter((project) => !project.isArchived)
    .forEach((project) => {
      projectHours[project.name] = 0;
    });

  timeEntries
    .filter((entry) => {
      const entryDate = new Date(entry.startTime);
      return isWithinDateRange(entryDate, startOfDay, endOfDay);
    })
    .forEach((entry) => {
      const project = projects.find((p) => p.id === entry.projectId);
      if (project && !project.isArchived) {
        const hours =
          calculateDuration(entry.startTime, entry.endTime) / (1000 * 60 * 60);
        projectHours[project.name] = (projectHours[project.name] || 0) + hours;
      }
    });

  // 小数点第一位まで丸める
  Object.keys(projectHours).forEach((key) => {
    projectHours[key] = Number(projectHours[key].toFixed(1));
  });

  return projectHours;
};

/**
 * 指定した日の合計作業時間を集計
 */
export const getDailyWorkHours = (
  timeEntries: TimeEntry[],
  targetDate: Date
): number => {
  const { startOfDay, endOfDay } = getDayBoundaries(targetDate);

  const totalMilliseconds = timeEntries
    .filter((entry) => {
      const entryDate = new Date(entry.startTime);
      return isWithinDateRange(entryDate, startOfDay, endOfDay);
    })
    .reduce((total, entry) => {
      return total + calculateDuration(entry.startTime, entry.endTime);
    }, 0);

  return Number((totalMilliseconds / (1000 * 60 * 60)).toFixed(1));
};

/**
 * 指定した日の最も長い作業セッションの時間（分単位）を取得
 */
export const getLongestWorkSession = (
  timeEntries: TimeEntry[],
  targetDate: Date
): number => {
  const { startOfDay, endOfDay } = getDayBoundaries(targetDate);

  const todayEntries = timeEntries.filter((entry) => {
    const entryDate = new Date(entry.startTime);
    return isWithinDateRange(entryDate, startOfDay, endOfDay);
  });

  if (todayEntries.length === 0) return 0;

  const longestSession = todayEntries.reduce((longest, entry) => {
    const duration =
      calculateDuration(entry.startTime, entry.endTime) / (1000 * 60);
    return duration > longest ? duration : longest;
  }, 0);

  return Math.round(longestSession);
};

/**
 * 指定した日の平均作業セッション時間（分単位）を取得
 */
export const getAverageWorkSession = (
  timeEntries: TimeEntry[],
  targetDate: Date
): number => {
  const { startOfDay, endOfDay } = getDayBoundaries(targetDate);

  const todayEntries = timeEntries.filter((entry) => {
    const entryDate = new Date(entry.startTime);
    return isWithinDateRange(entryDate, startOfDay, endOfDay);
  });

  if (todayEntries.length === 0) return 0;

  const totalDuration = todayEntries.reduce((total, entry) => {
    const duration =
      calculateDuration(entry.startTime, entry.endTime) / (1000 * 60);
    return total + duration;
  }, 0);

  return Math.round(totalDuration / todayEntries.length);
};
