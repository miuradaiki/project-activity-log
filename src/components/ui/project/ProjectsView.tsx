import React, { useState } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Box, Typography, Button, useTheme } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { Project, TimeEntry } from '../../../types';
import { ProjectsGrid } from './ProjectsGrid';
import { DeleteConfirmDialog } from '../../DeleteConfirmDialog';

interface ProjectsViewProps {
  projects: Project[];
  timeEntries: TimeEntry[];
  activeProjectId: string | null;
  onEditProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
  onArchiveProject: (project: Project) => void;
  onUnarchiveProject: (project: Project) => void;
  onStartTimer: (project: Project) => void;
  onAddProject: () => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  timeEntries,
  activeProjectId,
  onEditProject,
  onDeleteProject,
  onArchiveProject,
  onUnarchiveProject,
  onStartTimer,
  onAddProject,
}) => {
  const theme = useTheme();
  const { t } = useLanguage();
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // プロジェクト削除の確認
  const handleDeleteClick = (project: Project) => {
    setProjectToDelete(project);
    setIsDeleteDialogOpen(true);
  };

  // 削除確認ダイアログで削除を確定
  const handleDeleteConfirm = () => {
    if (projectToDelete) {
      onDeleteProject(projectToDelete);
      setProjectToDelete(null);
    }
    setIsDeleteDialogOpen(false);
  };

  // 削除確認ダイアログをキャンセル
  const handleDeleteCancel = () => {
    setProjectToDelete(null);
    setIsDeleteDialogOpen(false);
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      {/* ヘッダー */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            component="h1"
            fontWeight="bold"
            gutterBottom
          >
            {t('projects.title')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('dashboard.progress.subtitle')}
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAddProject}
          sx={{
            px: 3,
            py: 1,
            borderRadius: 2,
            boxShadow: 2,
          }}
        >
          {t('projects.new')}
        </Button>
      </Box>

      {/* プロジェクトグリッド */}
      <ProjectsGrid
        projects={projects}
        activeProjectId={activeProjectId}
        timeEntries={timeEntries}
        onEditProject={onEditProject}
        onDeleteProject={handleDeleteClick}
        onArchiveProject={onArchiveProject}
        onUnarchiveProject={onUnarchiveProject}
        onStartTimer={onStartTimer}
      />

      {/* 削除確認ダイアログ */}
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        title={t('projects.delete.confirm')}
        message={`${projectToDelete?.name} ${t('projects.delete.confirm')}\n${t('projects.delete.warning')}`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </Box>
  );
};
