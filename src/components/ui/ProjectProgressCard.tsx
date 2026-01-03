import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Typography, Card, CardContent, useTheme } from '@mui/material';
import { Project } from '../../types';
import { useSettingsContext } from '../../contexts/SettingsContext';
import {
  ProjectCardMenu,
  ProjectTargetDialog,
  ProjectCardHeader,
  ProjectCardProgress,
  useProjectProgress,
} from './project/ProjectProgressCard';

interface ProjectProgressCardProps {
  project: Project;
  currentHours: number;
  targetHours: number;
  onStartTimer: (projectId: string) => void;
  onEditProject?: (project: Project) => void;
  onArchiveProject?: (project: Project) => void;
  onUnarchiveProject?: (project: Project) => void;
  onViewDetails?: (project: Project) => void;
  onUpdateTarget?: (project: Project, newMonthlyCapacity: number) => void;
}

/**
 * プロジェクトの進捗状況を視覚的に表示するカードコンポーネント
 */
export const ProjectProgressCard: React.FC<ProjectProgressCardProps> = ({
  project,
  currentHours,
  targetHours,
  onStartTimer,
  onEditProject,
  onArchiveProject,
  onUnarchiveProject,
  onViewDetails,
  onUpdateTarget,
}) => {
  const theme = useTheme();
  const { t } = useLanguage();
  const { settings } = useSettingsContext();
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [targetDialogOpen, setTargetDialogOpen] = useState(false);

  const progress = useProjectProgress(project, currentHours, targetHours, t);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleOpenTargetDialog = () => {
    setTargetDialogOpen(true);
  };

  const handleCloseTargetDialog = () => {
    setTargetDialogOpen(false);
  };

  const handleUpdateTarget = (newMonthlyCapacity: number) => {
    if (onUpdateTarget) {
      onUpdateTarget(project, newMonthlyCapacity);
    }
    handleCloseTargetDialog();
  };

  const handleEdit = () => {
    onEditProject?.(project);
  };

  const handleArchive = () => {
    if (project.isArchived) {
      onUnarchiveProject?.(project);
    } else {
      onArchiveProject?.(project);
    }
  };

  const handleViewDetails = () => {
    onViewDetails?.(project);
  };

  return (
    <>
      <Card
        sx={{
          height: '100%',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[4],
          },
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'visible',
        }}
      >
        <CardContent sx={{ flexGrow: 1, p: 2 }}>
          <ProjectCardHeader
            statusText={progress.statusText}
            statusColor={progress.statusColor}
            monthlyCapacity={project.monthlyCapacity * 100}
            projectId={project.id}
            onStartTimer={onStartTimer}
            onMenuOpen={handleMenuOpen}
          />

          <Typography
            variant="h6"
            fontWeight="medium"
            gutterBottom
            sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {project.name}
          </Typography>

          {project.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 2,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                height: '2.5rem',
              }}
            >
              {project.description}
            </Typography>
          )}

          <ProjectCardProgress
            isTrackingOnly={progress.isTrackingOnly}
            currentHours={currentHours}
            targetHours={targetHours}
            progressPercentage={progress.progressPercentage}
            progressColor={progress.progressColor}
            remainingHours={progress.remainingHours}
          />
        </CardContent>
      </Card>

      <ProjectCardMenu
        anchorEl={menuAnchorEl}
        project={project}
        onClose={handleMenuClose}
        onEdit={onEditProject ? handleEdit : undefined}
        onArchive={
          onArchiveProject || onUnarchiveProject ? handleArchive : undefined
        }
        onOpenTargetDialog={onUpdateTarget ? handleOpenTargetDialog : undefined}
        onViewDetails={onViewDetails ? handleViewDetails : undefined}
      />

      <ProjectTargetDialog
        open={targetDialogOpen}
        project={project}
        baseMonthlyHours={settings.workHours.baseMonthlyHours}
        onClose={handleCloseTargetDialog}
        onSave={handleUpdateTarget}
      />
    </>
  );
};
