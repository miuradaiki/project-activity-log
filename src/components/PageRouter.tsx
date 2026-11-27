import React from 'react';
import { Project, TimeEntry } from '../types';
import { TimerController } from '../hooks/useTimerController';
import { Modal } from '../hooks/useModal';
import { ProjectOperations } from '../hooks/useProjectOperations';

import { ReportsView } from './reports/ReportsView';
import { ProjectsView } from './projects/ProjectsView';
import { useSettingsContext } from '../contexts/SettingsContext';
import { SettingsView } from './settings/SettingsView';
import { TodayView } from './today/TodayView';
import { EntryHistory } from './history/EntryHistory';

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
  const { settings } = useSettingsContext();

  switch (activePage) {
    case 'dashboard':
      return (
        <ReportsView
          projects={projects}
          timeEntries={timeEntries}
          baseMonthlyHours={settings.workHours.baseMonthlyHours}
        />
      );

    case 'projects':
      return (
        <ProjectsView
          projects={projects}
          timeEntries={timeEntries}
          activeProjectId={
            timer.isRunning ? (timer.activeProject?.id ?? null) : null
          }
          baseMonthlyHours={settings.workHours.baseMonthlyHours}
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
          onCreateProject={() => projectFormModal.open()}
        >
          <EntryHistory
            timeEntries={timeEntries}
            projects={projects}
            onDelete={projectOps.deleteTimeEntry}
            onEdit={(entry) => manualEntryModal.open(entry)}
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
