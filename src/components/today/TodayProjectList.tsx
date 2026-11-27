import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Project, TimeEntry } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { getProjectMonthProgress } from '../../utils/analytics';
import { projectColorManager } from '../../utils/colorUtils';
import { GraphiteCard } from '../ui/graphite/GraphiteCard';
import { ProgressMeter } from '../ui/graphite/ProgressMeter';
import { PlayToggleButton } from '../ui/graphite/PlayToggleButton';
import { OverTag } from '../ui/graphite/OverTag';

interface TodayProjectListProps {
  projects: Project[];
  timeEntries: TimeEntry[];
  baseMonthlyHours: number;
  activeProjectId: string | null;
  isRunning: boolean;
  onToggle: (project: Project) => void;
  onCreateProject: () => void;
}

export const TodayProjectList: React.FC<TodayProjectListProps> = ({
  projects,
  timeEntries,
  baseMonthlyHours,
  activeProjectId,
  isRunning,
  onToggle,
  onCreateProject,
}) => {
  const { t } = useLanguage();
  const visible = projects.filter((p) => !p.isArchived);

  if (visible.length === 0) {
    return (
      <GraphiteCard
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
          {t('today.no.projects')}
        </Typography>
        <Button variant="contained" onClick={onCreateProject}>
          {t('today.create.project')}
        </Button>
      </GraphiteCard>
    );
  }

  return (
    <GraphiteCard padding="6px 20px">
      {visible.map((project, i) => {
        const progress = getProjectMonthProgress(
          project,
          timeEntries,
          baseMonthlyHours
        );
        const active = isRunning && project.id === activeProjectId;
        const color = projectColorManager.getColorById(project.id);
        const isOver = progress.status === 'over';
        return (
          <Box
            key={project.id}
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '28px 1fr 90px',
                md: '28px 1fr 220px 110px',
              },
              alignItems: 'center',
              gap: 1.75,
              py: 1.5,
              borderTop: i === 0 ? 0 : 1,
              borderColor: 'divider',
            }}
          >
            <PlayToggleButton
              active={active}
              onClick={() => onToggle(project)}
              label={t(active ? 'today.stop.project' : 'today.start.project', {
                name: project.name,
              })}
            />
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                minWidth: 0,
                fontSize: 13.5,
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
            </Box>
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              {!progress.isTrackingOnly && (
                <ProgressMeter
                  ratio={progress.ratio}
                  color={color}
                  label={project.name}
                />
              )}
            </Box>
            <Typography
              sx={{
                textAlign: 'right',
                fontSize: 13,
                fontVariantNumeric: 'tabular-nums',
                color: isOver ? 'error.main' : 'text.secondary',
              }}
            >
              {progress.isTrackingOnly
                ? `${progress.actualHours}h`
                : `${progress.actualHours} / ${progress.targetHours}h`}
            </Typography>
          </Box>
        );
      })}
    </GraphiteCard>
  );
};
