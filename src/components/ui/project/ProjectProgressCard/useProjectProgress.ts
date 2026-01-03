import { useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import { Project } from '../../../../types';
import { ProjectProgress } from './types';

type TranslationFunction = (key: string) => string;

export const useProjectProgress = (
  project: Project,
  currentHours: number,
  targetHours: number,
  t: TranslationFunction
): ProjectProgress => {
  const theme = useTheme();

  return useMemo(() => {
    const isTrackingOnly = project.monthlyCapacity === 0;

    const progressPercentage =
      targetHours > 0
        ? Math.min(Math.round((currentHours / targetHours) * 100), 100)
        : 0;

    const remainingHours = Math.max(targetHours - currentHours, 0);

    let statusColor = theme.palette.info.main;
    let statusText = t('projects.filter.active');

    if (isTrackingOnly) {
      const greyColor =
        theme.palette.mode === 'dark'
          ? theme.palette.grey[500]
          : theme.palette.grey[600];
      statusColor = greyColor;
      statusText = t('projects.filter.tracking');
    } else if (progressPercentage >= 100) {
      statusColor = theme.palette.error.main;
      statusText = t('projects.filter.completed');
    } else if (progressPercentage >= 90) {
      statusColor = theme.palette.warning.main;
      statusText = t('projects.filter.warning');
    }

    let progressColor = theme.palette.primary.main;
    if (progressPercentage >= 100) {
      progressColor = theme.palette.error.main;
    } else if (progressPercentage >= 90) {
      progressColor = theme.palette.warning.main;
    }

    return {
      isTrackingOnly,
      progressPercentage,
      remainingHours,
      statusColor,
      statusText,
      progressColor,
    };
  }, [project.monthlyCapacity, currentHours, targetHours, t, theme]);
};
