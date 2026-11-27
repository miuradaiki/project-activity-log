import React from 'react';
import { Box, Button } from '@mui/material';
import { Project, TimeEntry } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { calculateDuration } from '../../utils/analytics/common';
import { GraphiteDialog } from '../ui/graphite/GraphiteDialog';

interface ProjectDeleteDialogProps {
  project: Project | null;
  timeEntries: TimeEntry[];
  onConfirm: (project: Project) => void;
  onArchive: (project: Project) => void;
  onCancel: () => void;
}

/** 記録ごと消える唯一の操作なので、消える量を示し、アーカイブという逃げ道を添える */
export const ProjectDeleteDialog: React.FC<ProjectDeleteDialogProps> = ({
  project,
  timeEntries,
  onConfirm,
  onArchive,
  onCancel,
}) => {
  const { t } = useLanguage();
  const entries = project
    ? timeEntries.filter((e) => e.projectId === project.id)
    : [];
  const hours =
    Math.round(
      (entries.reduce(
        (sum, e) => sum + calculateDuration(e.startTime, e.endTime),
        0
      ) /
        3600_000) *
        10
    ) / 10;

  return (
    <GraphiteDialog
      open={!!project}
      onClose={onCancel}
      size="sm"
      title={t('projects.delete.title', { name: project?.name ?? '' })}
      subtitle={
        <>
          <Box component="span" sx={{ color: 'text.primary', fontWeight: 500 }}>
            {t('projects.delete.entries', { count: entries.length, hours })}
          </Box>
          {t('projects.delete.hint')}
        </>
      }
      summary={
        project && !project.isArchived ? (
          <Button size="small" onClick={() => onArchive(project)}>
            {t('projects.delete.archive.instead')}
          </Button>
        ) : undefined
      }
      actions={
        <>
          <Button variant="outlined" onClick={onCancel}>
            {t('projects.cancel')}
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => project && onConfirm(project)}
          >
            {t('projects.delete')}
          </Button>
        </>
      }
    />
  );
};
