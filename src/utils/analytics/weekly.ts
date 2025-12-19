import { TimeEntry, Project } from '../../types';
import { getDailyProjectHours } from './daily';

/**
 * 指定した日付の週番号を取得（月内）
 */
export const getWeekNumber = (date: Date): number => {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const firstWeekday = firstDayOfMonth.getDay();
  return Math.ceil((date.getDate() + firstWeekday) / 7);
};

/**
 * 週次の日ごとのプロジェクト別作業時間を集計
 */
export const getWeeklyDistribution = (
  timeEntries: TimeEntry[],
  projects: Project[],
  startOfWeek: Date,
  isEnglish: boolean = false
): { date: string }[] => {
  const japDays = ['月', '火', '水', '木', '金', '土', '日'];
  const engDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const days = isEnglish ? engDays : japDays;
  const result = [];

  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(startOfWeek);
    currentDate.setDate(startOfWeek.getDate() + i);

    const projectHours = getDailyProjectHours(
      timeEntries,
      projects,
      currentDate
    );
    result.push({
      date: days[i],
      ...projectHours,
    });
  }

  return result;
};
