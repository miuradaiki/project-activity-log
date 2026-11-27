import React from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import { MoreHoriz as MoreIcon } from '@mui/icons-material';
import { useLanguage } from '../../contexts/LanguageContext';
import { projectColorManager } from '../../utils/colorUtils';
import { ProgressMeter } from '../ui/graphite/ProgressMeter';
import { PlayToggleButton } from '../ui/graphite/PlayToggleButton';
import { OverTag } from '../ui/graphite/OverTag';
import { ProjectRow } from './project-table-rows';

export const PROJECT_GRID_COLUMNS = {
  xs: '28px 1fr 90px 32px',
  md: '28px 1.6fr 1.2fr 110px 90px 32px',
};

interface ProjectTableRowProps {
  row: ProjectRow;
  isRunning: boolean;
  onToggle: () => void;
  onOpenMenu: (anchor: HTMLElement) => void;
}

export const ProjectTableRow: React.FC<ProjectTableRowProps> = ({
  row,
  isRunning,
  onToggle,
  onOpenMenu,
}) => {
  const { t } = useLanguage();
  const { project, progress } = row;
  const color = projectColorManager.getColorById(project.id);
  const isOver = progress.status === 'over';
  const numeric = {
    fontSize: 13,
    textAlign: 'right',
    fontVariantNumeric: 'tabular-nums',
  } as const;

  return (
    <Box
      data-row
      sx={(theme) => ({
        display: 'grid',
        gridTemplateColumns: PROJECT_GRID_COLUMNS,
        alignItems: 'center',
        gap: 2,
        px: 2.75,
        minHeight: 62,
        borderTop: 1,
        borderColor: 'divider',
        bgcolor: isRunning ? `${theme.palette.primary.main}0D` : 'transparent',
      })}
    >
      <PlayToggleButton
        testId="project-play-button"
        active={isRunning}
        onClick={onToggle}
        label={t(isRunning ? 'today.stop.project' : 'today.start.project', {
          name: project.name,
        })}
      />
      <Box sx={{ minWidth: 0 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            fontSize: 13.5,
            fontWeight: 500,
          }}
        >
          <Box
            aria-hidden
            sx={{
              width: 8,
              height: 8,
              borderRadius: '3px',
              flex: 'none',
              bgcolor: color,
            }}
          />
          <Box
            component="span"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {project.name}
          </Box>
          {isOver && <OverTag hours={progress.overHours} />}
          {isRunning && (
            <Box
              component="span"
              sx={{
                fontSize: 11,
                px: 0.875,
                py: 0.25,
                borderRadius: 1.5,
                bgcolor: 'action.hover',
                color: 'text.secondary',
              }}
            >
              {t('projects.running')}
            </Box>
          )}
        </Box>
        <Typography sx={{ fontSize: 12, color: 'text.disabled', mt: 0.375 }}>
          {progress.isTrackingOnly
            ? t('projects.tracking.only')
            : t('projects.utilization.value', {
                percent: Math.round(project.monthlyCapacity * 100),
              })}
        </Typography>
      </Box>
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        {progress.isTrackingOnly ? (
          <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>
            {t('projects.no.target')}
          </Typography>
        ) : (
          <>
            <ProgressMeter
              ratio={progress.ratio}
              color={color}
              label={project.name}
            />
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 11.5,
                color: 'text.disabled',
                mt: 0.75,
              }}
            >
              <span>{Math.round(progress.ratio * 100)}%</span>
              {!isOver && progress.remainingHours > 0 && (
                <span>
                  {t('projects.pace', { hours: progress.requiredDailyHours })}
                </span>
              )}
            </Box>
          </>
        )}
      </Box>
      <Typography
        sx={{ ...numeric, color: isOver ? 'error.main' : 'text.secondary' }}
      >
        {progress.isTrackingOnly
          ? `${progress.actualHours}h`
          : `${progress.actualHours} / ${progress.targetHours}h`}
      </Typography>
      <Typography
        sx={{
          ...numeric,
          display: { xs: 'none', md: 'block' },
          color: isOver ? 'error.main' : 'text.secondary',
        }}
      >
        {progress.isTrackingOnly
          ? '—'
          : isOver
            ? `−${progress.overHours}h`
            : `${progress.remainingHours}h`}
      </Typography>
      <IconButton
        size="small"
        data-testid="project-more-button"
        aria-label={t('aria.project.menu')}
        onClick={(e) => onOpenMenu(e.currentTarget)}
      >
        <MoreIcon fontSize="small" />
      </IconButton>
    </Box>
  );
};
