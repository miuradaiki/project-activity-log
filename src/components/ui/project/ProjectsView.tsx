import React, { useState } from 'react';
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
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 4,
      }}>
        <Box>
          <Typography variant="h5" component="h1" fontWeight="bold" gutterBottom>
            プロジェクト一覧
          </Typography>
          <Typography variant="body1" color="text.secondary">
            プロジェクトの管理と進捗状況の確認ができます
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
            boxShadow: 2
          }}
        >
          新規プロジェクト
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
        title="プロジェクトの削除"
        message={`${projectToDelete?.name} を削除してもよろしいですか？\nこのプロジェクトに関連する全ての作業記録も削除されます。\nこの操作は元に戻せません。`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </Box>
  );
};
