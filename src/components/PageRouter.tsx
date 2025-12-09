import React from 'react';
import { Box, Button } from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { useLanguage } from '../contexts/LanguageContext';
import { Project, TimeEntry } from '../types';
import { TimerController } from '../hooks/useTimerController';
import { Modal } from '../hooks/useModal';
import { ProjectOperations } from '../hooks/useProjectOperations';

import { Dashboard } from './dashboard/Dashboard';
import { ProjectsView } from './ui/project/ProjectsView';
import { SettingsView } from './settings/SettingsView';
import { TimerFocus } from './ui/timer/TimerFocus';
import { ProjectList } from './ProjectList';
import { TimeEntryList } from './timer/TimeEntryList';

export interface PageRouterProps {
  activePage: string;
  projects: Project[];
  timeEntries: TimeEntry[];
  timer: TimerController;
  projectFormModal: Modal<Project>;
  manualEntryModal: Modal<TimeEntry>;
  projectOps: ProjectOperations;
  onStartTimer: (project: Project) => void;
  onImportCSV: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const PageRouter: React.FC<PageRouterProps> = ({
  activePage,
  projects,
  timeEntries,
  timer,
  projectFormModal,
  manualEntryModal,
  projectOps,
  onStartTimer,
  onImportCSV,
  isDarkMode,
  onToggleTheme,
}) => {
  const { t } = useLanguage();

  switch (activePage) {
    case 'dashboard':
      return (
        <Dashboard
          projects={projects}
          timeEntries={timeEntries}
          onStartTimer={(projectId) => {
            const project = projects.find((p) => p.id === projectId);
            if (project) onStartTimer(project);
          }}
          onEditProject={(project) => projectFormModal.open(project)}
          onArchiveProject={projectOps.archiveProject}
          onUnarchiveProject={projectOps.unarchiveProject}
        />
      );

    case 'projects':
      return (
        <ProjectsView
          projects={projects}
          timeEntries={timeEntries}
          activeProjectId={timer.activeProject?.id || null}
          onEditProject={(project) => projectFormModal.open(project)}
          onDeleteProject={projectOps.deleteProject}
          onArchiveProject={projectOps.archiveProject}
          onUnarchiveProject={projectOps.unarchiveProject}
          onStartTimer={onStartTimer}
          onAddProject={() => projectFormModal.open()}
        />
      );

    case 'timer':
      return (
        <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto' }}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              onClick={onImportCSV}
            >
              {t('timer.import.csv')}
            </Button>
          </Box>

          <TimerFocus
            project={timer.activeProject}
            isRunning={timer.isRunning}
            startTime={timer.startTime}
            onStart={() =>
              timer.activeProject && timer.start(timer.activeProject)
            }
            onStop={() => timer.stop()}
          />

          <ProjectList
            projects={projects}
            onEditProject={(project) => projectFormModal.open(project)}
            onDeleteProject={projectOps.deleteProject}
            onArchiveProject={projectOps.archiveProject}
            onUnarchiveProject={projectOps.unarchiveProject}
            onStartTimer={onStartTimer}
            activeProjectId={timer.activeProject?.id || null}
            timeEntries={timeEntries}
          />

          <TimeEntryList
            timeEntries={timeEntries}
            projects={projects}
            onDeleteTimeEntry={projectOps.deleteTimeEntry}
            onEditTimeEntry={(entry) => manualEntryModal.open(entry)}
          />
        </Box>
      );

    case 'settings':
      return (
        <SettingsView onToggleTheme={onToggleTheme} isDarkMode={isDarkMode} />
      );

    default:
      return null;
  }
};
