import React from 'react';
import { Project, TimeEntry } from '../types';
import { TimerController } from '../hooks/useTimerController';
import { Modal } from '../hooks/useModal';
import { ProjectOperations } from '../hooks/useProjectOperations';

import { Dashboard } from './dashboard/Dashboard';
import { ProjectsView } from './ui/project/ProjectsView';
import { SettingsView } from './settings/SettingsView';
import { TodayView } from './today/TodayView';
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
        <TodayView
          projects={projects}
          timeEntries={timeEntries}
          activeProject={timer.activeProject}
          isRunning={timer.isRunning}
          startTime={timer.startTime}
          onToggleProject={onStartTimer}
          onStop={() => timer.stop()}
          onManualEntry={() => manualEntryModal.open()}
        >
          <TimeEntryList
            timeEntries={timeEntries}
            projects={projects}
            onDeleteTimeEntry={projectOps.deleteTimeEntry}
            onEditTimeEntry={(entry) => manualEntryModal.open(entry)}
          />
        </TodayView>
      );

    case 'settings':
      return (
        <SettingsView
          onToggleTheme={onToggleTheme}
          isDarkMode={isDarkMode}
          onImportCSV={onImportCSV}
        />
      );

    default:
      return null;
  }
};
