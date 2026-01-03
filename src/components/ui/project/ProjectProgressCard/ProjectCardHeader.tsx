import React from 'react';
import { Box, Typography, Chip, IconButton, Tooltip } from '@mui/material';
import {
  TimerOutlined as TimerIcon,
  MoreVert as MoreIcon,
} from '@mui/icons-material';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { ProjectCardHeaderProps } from './types';

export const ProjectCardHeader: React.FC<ProjectCardHeaderProps> = ({
  statusText,
  statusColor,
  monthlyCapacity,
  projectId,
  onStartTimer,
  onMenuOpen,
}) => {
  const { t } = useLanguage();

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Chip
          label={statusText}
          size="small"
          sx={{
            backgroundColor: `${statusColor}20`,
            color: statusColor,
            fontWeight: 'medium',
            mr: 1,
          }}
        />
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          {t('projects.utilization')}: {monthlyCapacity.toFixed(0)}%
        </Typography>
      </Box>
      <Box>
        <Tooltip title={t('timer.start')}>
          <IconButton
            size="small"
            color="primary"
            onClick={() => onStartTimer(projectId)}
            aria-label={t('timer.start')}
          >
            <TimerIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('actions.search')}>
          <IconButton
            size="small"
            onClick={onMenuOpen}
            aria-label={t('actions.search')}
          >
            <MoreIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};
