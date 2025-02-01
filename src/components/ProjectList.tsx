import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  Paper,
  Box,
  Typography,
  LinearProgress,
  Tooltip,
  Divider,
} from '@mui/material';
import { Edit, Delete, PlayArrow, Stop } from '@mui/icons-material';
import { Project, TimeEntry } from '../types';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { calculateMonthlyProgress } from '../utils/analytics';

interface ProjectListProps {
  projects: Project[];
  onEditProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
  onStartTimer: (project: Project) => void;
  activeProjectId: string | null;
  timeEntries?: TimeEntry[];
}

const BASE_MONTHLY_HOURS = 140; // 基準となる月間時間

export const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  onEditProject,
  onDeleteProject,
  onStartTimer,
  activeProjectId,
  timeEntries = [],
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [projectToDelete, setProjectToDelete] = React.useState<Project | null>(null);

  const handleDeleteClick = (project: Project) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (projectToDelete) {
      onDeleteProject(projectToDelete.id);
    }
    setDeleteDialogOpen(false);
    setProjectToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setProjectToDelete(null);
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 100) return 'error';
    if (percentage >= 90) return 'warning';
    return 'primary';
  };

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        プロジェクト一覧
      </Typography>
      <List>
        {projects.map((project) => {
          const isActive = project.id === activeProjectId;
          const monthlyTarget = project.monthlyCapacity * BASE_MONTHLY_HOURS;
          const { monthlyHours, monthlyPercentage } = calculateMonthlyProgress(
            timeEntries,
            project.id,
            monthlyTarget
          );

          return (
            <React.Fragment key={project.id}>
              <ListItem
                sx={{
                  bgcolor: isActive ? 'action.selected' : 'inherit',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
                secondaryAction={
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <IconButton
                      edge="end"
                      aria-label="edit"
                      onClick={() => onEditProject(project)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDeleteClick(project)}
                    >
                      <Delete />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label={isActive ? 'stop' : 'start'}
                      onClick={() => onStartTimer(project)}
                      color={isActive ? 'error' : 'primary'}
                    >
                      {isActive ? <Stop /> : <PlayArrow />}
                    </IconButton>
                  </Box>
                }
              >
                <ListItemText
                  primary={
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="subtitle1">
                        {project.name}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box>
                      {project.description && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 1 }}
                        >
                          {project.description}
                        </Typography>
                      )}
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          稼働率: {(project.monthlyCapacity * 100).toFixed(1)}%
                          ({monthlyTarget.toFixed(1)}時間/月)
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ flexGrow: 1 }}>
                          <Tooltip 
                            title={`${monthlyHours.toFixed(1)}時間 / ${monthlyTarget.toFixed(1)}時間`}
                            arrow
                          >
                            <LinearProgress
                              variant="determinate"
                              value={Math.min(monthlyPercentage, 100)}
                              color={getProgressColor(monthlyPercentage)}
                              sx={{ height: 8, borderRadius: 1 }}
                            />
                          </Tooltip>
                        </Box>
                        <Typography
                          variant="body2"
                          color={getProgressColor(monthlyPercentage)}
                          sx={{ minWidth: '4.5em', textAlign: 'right' }}
                        >
                          {monthlyPercentage.toFixed(1)}%
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          );
        })}
      </List>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        title="プロジェクトの削除"
        message={`"${projectToDelete?.name}"を削除してもよろしいですか？\n関連する全ての作業記録も削除されます。この操作は取り消せません。`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </Paper>
  );
};