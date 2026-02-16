import React from 'react';
import { Box, Typography, LinearProgress, useTheme } from '@mui/material';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { ProjectCardProgressProps } from './types';
import { formatHours } from '../../../../utils/formatters/timeFormatters';

export const ProjectCardProgress: React.FC<ProjectCardProgressProps> = ({
  isTrackingOnly,
  currentHours,
  targetHours,
  progressPercentage,
  progressColor,
  remainingHours,
}) => {
  const theme = useTheme();
  const { t } = useLanguage();

  if (isTrackingOnly) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {t('projects.tracking.cumulative')}
        </Typography>
        <Typography variant="h5" fontWeight="bold" color="primary">
          {formatHours(currentHours)} {t('units.hours')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 0.5,
        }}
      >
        <Typography variant="body2" fontWeight="medium">
          {t('dashboard.progress.title')}
        </Typography>
        <Typography variant="body2" fontWeight="medium" color={progressColor}>
          {progressPercentage}%
        </Typography>
      </Box>

      <LinearProgress
        variant="determinate"
        value={Math.min(progressPercentage, 100)}
        sx={{
          height: 8,
          borderRadius: 4,
          mb: 1.5,
          backgroundColor:
            theme.palette.mode === 'light'
              ? theme.palette.grey[200]
              : theme.palette.grey[700],
          '& .MuiLinearProgress-bar': {
            backgroundColor: progressColor,
            borderRadius: 4,
            transition: 'transform 0.4s linear',
          },
        }}
      />

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {formatHours(currentHours)} {t('units.hours')} /{' '}
          {formatHours(targetHours)} {t('units.hours')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('projects.sort.remaining')} {formatHours(remainingHours)}{' '}
          {t('units.hours')}
        </Typography>
      </Box>
    </Box>
  );
};
