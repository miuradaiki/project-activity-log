import { TimeEntry, Project } from '../../types';
import { calculateDuration } from './common';

/**
 * プロジェクトごとの作業時間を集計
 */
export const getProjectDistribution = (
  timeEntries: TimeEntry[],
  projects: Project[],
  startDate: Date,
  endDate: Date
): { projectName: string; hours: number }[] => {
  const filteredEntries = timeEntries.filter((entry) => {
    const entryStartDate = new Date(entry.startTime);
    const entryEndDate = entry.endTime ? new Date(entry.endTime) : new Date();
    return (
      (entryStartDate >= startDate && entryStartDate <= endDate) ||
      (entryEndDate >= startDate && entryEndDate <= endDate)
    );
  });

  const projectHours = new Map<string, number>();

  filteredEntries.forEach((entry) => {
    const duration = calculateDuration(entry.startTime, entry.endTime);
    const hours = duration / (1000 * 60 * 60);
    const currentHours = projectHours.get(entry.projectId) || 0;
    projectHours.set(entry.projectId, currentHours + hours);
  });

  return Array.from(projectHours.entries())
    .map(([projectId, hours]) => {
      const project = projects.find((p) => p.id === projectId);
      return {
        projectName: project && !project.isArchived ? project.name : null,
        hours: Number(hours.toFixed(1)),
      };
    })
    .filter(
      (item): item is { projectName: string; hours: number } =>
        item.projectName !== null && item.hours > 0
    )
    .sort((a, b) => b.hours - a.hours);
};

/**
 * 最もアクティブなプロジェクトを取得
 */
export const getMostActiveProject = (
  timeEntries: TimeEntry[],
  projects: Project[],
  startDate: Date,
  endDate: Date
): { projectName: string; hours: number } => {
  const distribution = getProjectDistribution(
    timeEntries,
    projects,
    startDate,
    endDate
  );
  return distribution.reduce(
    (max, current) => (current.hours > max.hours ? current : max),
    { projectName: '', hours: 0 }
  );
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
  const filteredEntries = timeEntries.filter((entry) => {
    const entryDate = new Date(entry.startTime);
    return (
      entry.projectId === projectId &&
      entryDate >= startDate &&
      entryDate <= endDate
    );
  });

  const totalHours =
    filteredEntries.reduce((total, entry) => {
      return total + calculateDuration(entry.startTime, entry.endTime);
    }, 0) /
    (1000 * 60 * 60);

  return Number(totalHours.toFixed(1));
};
