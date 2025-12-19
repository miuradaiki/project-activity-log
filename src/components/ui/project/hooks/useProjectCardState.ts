import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { Project } from '../../../../types';

interface StatusInfo {
  label: string;
  color: 'default' | 'primary' | 'secondary' | 'error' | 'warning';
  bgColor: string;
  textColor: string;
}

interface UseProjectCardStateProps {
  project: Project;
  isActive: boolean;
  monthlyTime: number;
  monthlyTarget: number;
}

interface UseProjectCardStateReturn {
  anchorEl: HTMLElement | null;
  setAnchorEl: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
  animatedProgress: number;
  progress: number;
  progressColor: string;
  statusInfo: StatusInfo;
  isTrackingOnly: boolean;
  handleMenuClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  handleMenuClose: () => void;
}

export const useProjectCardState = ({
  project,
  isActive,
  monthlyTime,
  monthlyTarget,
}: UseProjectCardStateProps): UseProjectCardStateReturn => {
  const theme = useTheme();
  const { t } = useLanguage();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [animatedProgress, setAnimatedProgress] = useState(0);

  const progress =
    monthlyTarget > 0 ? Math.min((monthlyTime / monthlyTarget) * 100, 100) : 0;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 300);
    return () => clearTimeout(timer);
  }, [progress]);

  const getProgressColor = (): string => {
    if (progress >= 100) return theme.palette.error.main;
    if (progress >= 90) return theme.palette.warning.main;
    return theme.palette.primary.main;
  };

  const isTrackingOnly = project.monthlyCapacity === 0;

  const getStatusInfo = (): StatusInfo => {
    if (project.isArchived) {
      const bgColor =
        theme.palette.mode === 'dark'
          ? theme.palette.grey[600]
          : theme.palette.grey[300];
      return {
        label: t('projects.archive'),
        color: 'default',
        bgColor: bgColor,
        textColor: theme.palette.getContrastText(bgColor),
      };
    }

    if (isTrackingOnly) {
      const bgColor =
        theme.palette.mode === 'dark'
          ? theme.palette.grey[700]
          : theme.palette.grey[200];
      return {
        label: t('projects.filter.tracking'),
        color: 'default',
        bgColor: bgColor,
        textColor: theme.palette.getContrastText(bgColor),
      };
    }

    if (progress >= 100) {
      return {
        label: t('projects.filter.completed'),
        color: 'error',
        bgColor: theme.palette.error.light,
        textColor: theme.palette.getContrastText(theme.palette.error.light),
      };
    }

    if (progress >= 90) {
      return {
        label: t('projects.filter.warning'),
        color: 'warning',
        bgColor: theme.palette.warning.light,
        textColor: theme.palette.getContrastText(theme.palette.warning.light),
      };
    }

    if (isActive) {
      return {
        label: t('timer.title'),
        color: 'secondary',
        bgColor: theme.palette.secondary.light,
        textColor: theme.palette.getContrastText(theme.palette.secondary.light),
      };
    }

    return {
      label: t('projects.filter.active'),
      color: 'primary',
      bgColor: theme.palette.primary.light,
      textColor: theme.palette.getContrastText(theme.palette.primary.light),
    };
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return {
    anchorEl,
    setAnchorEl,
    animatedProgress,
    progress,
    progressColor: getProgressColor(),
    statusInfo: getStatusInfo(),
    isTrackingOnly,
    handleMenuClick,
    handleMenuClose,
  };
};
