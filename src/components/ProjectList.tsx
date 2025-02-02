import React, { useState } from 'react';
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
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const activeProjects = projects.filter(p => !p.isArchived);
  const archivedProjects = projects.filter(p => p.isArchived);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>, project: Project) => {
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
    
    return timeEntries
      .filter(entry => {
        const entryDate = new Date(entry.startTime);
        return entry.projectId === projectId && entryDate >= startOfMonth;
      })
      .reduce((total, entry) => {
        const start = new Date(entry.startTime);
        const end = new Date(entry.endTime);
        return total + (end.getTime() - start.getTime());
      }, 0) / (1000 * 60 * 60); // Convert to hours
  };

  const renderProjectList = (projects: Project[]) => (
    <List>
      {projects.map((project) => {
        const isActive = project.id === activeProjectId;
        const monthlyTime = calculateMonthlyTime(project.id);
        const monthlyTarget = project.monthlyCapacity * 140; // 140時間を基準とした月間目標時間
        const progress = (monthlyTime / monthlyTarget) * 100;

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
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">{project.name}</Typography>
              <Box>
                {!project.isArchived && (
                  <IconButton
                    edge="end"
                    aria-label={isActive ? "stop timer" : "start timer"}
                    onClick={() => onStartTimer(project)}
                    color={isActive ? "secondary" : "primary"}
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
            
            <Box sx={{ width: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  稼働率: {(project.monthlyCapacity * 100).toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {monthlyTime.toFixed(1)}時間 / {monthlyTarget.toFixed(1)}時間 ({progress.toFixed(1)}%)
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={Math.min(progress, 100)} 
                color={progressColor as 'primary' | 'secondary' | 'error' | 'warning'}
                sx={{ height: 8, borderRadius: 1 }}
              />
            </Box>
          </ListItem>
        );
      })}
    </List>
  );

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label={`アクティブ (${activeProjects.length})`} />
          <Tab label={`アーカイブ (${archivedProjects.length})`} />
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
        <MenuItem onClick={() => {
          if (selectedProject) onEditProject(selectedProject);
          handleMenuClose();
        }}>
          <EditIcon sx={{ mr: 1 }} /> 編集
        </MenuItem>
        {!selectedProject?.isArchived ? (
          <MenuItem onClick={handleArchiveClick}>
            <ArchiveIcon sx={{ mr: 1 }} /> アーカイブ
          </MenuItem>
        ) : (
          <MenuItem onClick={handleUnarchiveClick}>
            <UnarchiveIcon sx={{ mr: 1 }} /> アーカイブ解除
          </MenuItem>
        )}
        <MenuItem 
          onClick={() => {
            setDeleteConfirmOpen(true);
          }} 
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} /> 削除
        </MenuItem>
      </Menu>

      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        title="プロジェクトの削除"
        message={`このプロジェクトをアーカイブではなく削除しますか？\n削除したプロジェクトは復元できません。`}
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