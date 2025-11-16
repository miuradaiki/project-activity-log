import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import {
  List,
  ListItem,
  IconButton,
  Typography,
  Tabs,
  Tab,
  Box,
  Menu,
  MenuItem,
  LinearProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Archive as ArchiveIcon,
  Unarchive as UnarchiveIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
} from '@mui/icons-material';
import { Project, TimeEntry } from '../types';

interface ProjectListProps {
  projects: Project[];
  onEditProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
  onArchiveProject: (project: Project) => void;
  onUnarchiveProject: (project: Project) => void;
  onStartTimer: (project: Project) => void;
  activeProjectId: string | null;
  timeEntries: TimeEntry[];
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  onEditProject,
  onDeleteProject,
  onArchiveProject,
  onUnarchiveProject,
  onStartTimer,
  activeProjectId,
  timeEntries,
}) => {
  const [tabValue, setTabValue] = useState(0);
  const { t } = useLanguage();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const activeProjects = projects.filter((p) => !p.isArchived);
  const archivedProjects = projects.filter((p) => p.isArchived);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleMenuClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    project: Project
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedProject(project);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProject(null);
  };

  const handleArchiveClick = () => {
    if (selectedProject) {
      onArchiveProject(selectedProject);
    }
    handleMenuClose();
  };

  const handleUnarchiveClick = () => {
    if (selectedProject) {
      onUnarchiveProject(selectedProject);
    }
    handleMenuClose();
  };

  const calculateMonthlyTime = (projectId: string): number => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return (
      timeEntries
        .filter((entry) => {
          const entryDate = new Date(entry.startTime);
          return entry.projectId === projectId && entryDate >= startOfMonth;
        })
        .reduce((total, entry) => {
          const start = new Date(entry.startTime);
          const end = new Date(entry.endTime);
          return total + (end.getTime() - start.getTime());
        }, 0) /
      (1000 * 60 * 60)
    ); // Convert to hours
  };

  const renderProjectList = (projects: Project[]) => (
    <List>
      {projects.map((project) => {
        const isActive = project.id === activeProjectId;
        const monthlyTime = calculateMonthlyTime(project.id);
        const monthlyTarget = project.monthlyCapacity * 140;
        const progress =
          monthlyTarget > 0 ? (monthlyTime / monthlyTarget) * 100 : 0;
        const isTrackingOnly = project.monthlyCapacity === 0;

        let progressColor = 'primary';
        if (progress >= 100) {
          progressColor = 'error';
        } else if (progress >= 90) {
          progressColor = 'warning';
        }

        return (
          <ListItem
            key={project.id}
            sx={{
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 1,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              mb: 2,
              p: 2,
            }}
          >
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant="h6">{project.name}</Typography>
              <Box>
                {!project.isArchived && (
                  <IconButton
                    edge="end"
                    aria-label={isActive ? 'stop timer' : 'start timer'}
                    onClick={() => onStartTimer(project)}
                    color={isActive ? 'secondary' : 'primary'}
                  >
                    {isActive ? <StopIcon /> : <PlayArrowIcon />}
                  </IconButton>
                )}
                <IconButton
                  edge="end"
                  aria-label="more"
                  onClick={(e) => handleMenuClick(e, project)}
                >
                  <MoreVertIcon />
                </IconButton>
              </Box>
            </Box>

            <Typography variant="body2" color="text.secondary">
              {project.description}
            </Typography>

            {isTrackingOnly ? (
              <Box sx={{ width: '100%' }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 0.5 }}
                >
                  {t('projects.tracking.label')}
                </Typography>
                <Typography variant="h6" color="primary" fontWeight="bold">
                  {monthlyTime.toFixed(1)} {t('units.hours')}
                </Typography>
              </Box>
            ) : (
              <Box sx={{ width: '100%' }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {t('projects.utilization')}:{' '}
                    {(project.monthlyCapacity * 100).toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {monthlyTime.toFixed(1)} {t('units.hours')} /{' '}
                    {monthlyTarget.toFixed(1)} {t('units.hours')} (
                    {progress.toFixed(1)}%)
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(progress, 100)}
                  color={
                    progressColor as
                      | 'primary'
                      | 'secondary'
                      | 'error'
                      | 'warning'
                  }
                  sx={{ height: 8, borderRadius: 1 }}
                />
              </Box>
            )}
          </ListItem>
        );
      })}
    </List>
  );

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab
            label={`${t('projects.filter.active')} (${activeProjects.length})`}
          />
          <Tab
            label={`${t('projects.archive')} (${archivedProjects.length})`}
          />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {renderProjectList(activeProjects)}
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        {renderProjectList(archivedProjects)}
      </TabPanel>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            if (selectedProject) onEditProject(selectedProject);
            handleMenuClose();
          }}
        >
          <EditIcon sx={{ mr: 1 }} /> {t('actions.edit')}
        </MenuItem>
        {!selectedProject?.isArchived ? (
          <MenuItem onClick={handleArchiveClick}>
            <ArchiveIcon sx={{ mr: 1 }} /> {t('projects.archive')}
          </MenuItem>
        ) : (
          <MenuItem onClick={handleUnarchiveClick}>
            <UnarchiveIcon sx={{ mr: 1 }} /> {t('projects.unarchive')}
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            setDeleteConfirmOpen(true);
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} /> {t('projects.delete')}
        </MenuItem>
      </Menu>

      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        title={t('projects.delete.confirm')}
        message={t('projects.delete.warning')}
        onConfirm={() => {
          if (selectedProject) {
            onDeleteProject(selectedProject);
            setDeleteConfirmOpen(false);
            handleMenuClose();
          }
        }}
        onCancel={() => {
          setDeleteConfirmOpen(false);
        }}
      />
    </Box>
  );
};
