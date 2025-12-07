import React, { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Project, TimeEntry } from '../types';

export interface UseProjectOperationsProps {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  setTimeEntries: React.Dispatch<React.SetStateAction<TimeEntry[]>>;
  activeProjectId: string | null;
  isTimerRunning: boolean;
  onTimerStop: () => void;
}

export interface ProjectOperations {
  createProject: (
    projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'isArchived'>
  ) => void;
  editProject: (
    originalProject: Project,
    projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>
  ) => void;
  archiveProject: (project: Project) => void;
  unarchiveProject: (project: Project) => void;
  deleteProject: (project: Project) => void;
  deleteTimeEntry: (timeEntryId: string) => void;
  saveTimeEntry: (timeEntry: TimeEntry, isEditing: boolean) => void;
}

export const useProjectOperations = ({
  setProjects,
  setTimeEntries,
  activeProjectId,
  isTimerRunning,
  onTimerStop,
}: UseProjectOperationsProps): ProjectOperations => {
  const createProject = useCallback(
    (
      projectData: Omit<
        Project,
        'id' | 'createdAt' | 'updatedAt' | 'isArchived'
      >
    ) => {
      const timestamp = new Date().toISOString();
      const newProject: Project = {
        ...projectData,
        id: uuidv4(),
        createdAt: timestamp,
        updatedAt: timestamp,
        isArchived: false,
      };
      setProjects((prev) => [...prev, newProject]);
    },
    [setProjects]
  );

  const editProject = useCallback(
    (
      originalProject: Project,
      projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>
    ) => {
      const updatedProject: Project = {
        ...originalProject,
        ...projectData,
        updatedAt: new Date().toISOString(),
      };

      setProjects((prev) =>
        prev.map((p) => (p.id === originalProject.id ? updatedProject : p))
      );
    },
    [setProjects]
  );

  const archiveProject = useCallback(
    (project: Project) => {
      const updatedProject: Project = {
        ...project,
        isArchived: true,
        archivedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (activeProjectId === project.id && isTimerRunning) {
        onTimerStop();
      }

      setProjects((prev) =>
        prev.map((p) => (p.id === project.id ? updatedProject : p))
      );
    },
    [activeProjectId, isTimerRunning, onTimerStop, setProjects]
  );

  const unarchiveProject = useCallback(
    (project: Project) => {
      const updatedProject: Project = {
        ...project,
        isArchived: false,
        archivedAt: undefined,
        updatedAt: new Date().toISOString(),
      };

      setProjects((prev) =>
        prev.map((p) => (p.id === project.id ? updatedProject : p))
      );
    },
    [setProjects]
  );

  const deleteProject = useCallback(
    (project: Project) => {
      if (activeProjectId === project.id && isTimerRunning) {
        onTimerStop();
      }
      setProjects((prev) => prev.filter((p) => p.id !== project.id));
      setTimeEntries((prev) => prev.filter((t) => t.projectId !== project.id));
    },
    [activeProjectId, isTimerRunning, onTimerStop, setProjects, setTimeEntries]
  );

  const deleteTimeEntry = useCallback(
    (timeEntryId: string) => {
      setTimeEntries((prev) => prev.filter((t) => t.id !== timeEntryId));
    },
    [setTimeEntries]
  );

  const saveTimeEntry = useCallback(
    (timeEntry: TimeEntry, isEditing: boolean) => {
      if (isEditing) {
        setTimeEntries((prev) =>
          prev.map((t) => (t.id === timeEntry.id ? timeEntry : t))
        );
      } else {
        setTimeEntries((prev) => [...prev, timeEntry]);
      }
    },
    [setTimeEntries]
  );

  return {
    createProject,
    editProject,
    archiveProject,
    unarchiveProject,
    deleteProject,
    deleteTimeEntry,
    saveTimeEntry,
  };
};
