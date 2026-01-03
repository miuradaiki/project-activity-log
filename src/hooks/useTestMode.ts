import { useState, useCallback } from 'react';
import { Project, TimeEntry } from '../types';
import { isTestDataEnabled } from '../utils/env';

const TEST_MODE_KEY = 'project_activity_log_test_mode';
const TEST_PROJECTS_KEY = 'project_activity_log_test_projects';
const TEST_TIME_ENTRIES_KEY = 'project_activity_log_test_time_entries';

export interface UseTestModeReturn {
  isTestMode: boolean;
  testProjects: Project[];
  testTimeEntries: TimeEntry[];
  setTestProjects: (
    projects: Project[] | ((prev: Project[]) => Project[])
  ) => void;
  setTestTimeEntries: (
    entries: TimeEntry[] | ((prev: TimeEntry[]) => TimeEntry[])
  ) => void;
  toggleTestMode: (enabled: boolean) => Promise<void>;
  saveTestData: (projects: Project[], timeEntries: TimeEntry[]) => void;
  testDataStats: { projectCount: number; timeEntryCount: number };
}

export const useTestMode = (): UseTestModeReturn => {
  const [isTestMode, setIsTestModeState] = useState(() => {
    const isTestEnv = isTestDataEnabled();
    const savedTestMode = localStorage.getItem(TEST_MODE_KEY) === 'true';
    return isTestEnv && savedTestMode;
  });

  const [testProjects, setTestProjects] = useState<Project[]>(() => {
    if (isTestDataEnabled() && localStorage.getItem(TEST_MODE_KEY) === 'true') {
      const saved = localStorage.getItem(TEST_PROJECTS_KEY);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [testTimeEntries, setTestTimeEntries] = useState<TimeEntry[]>(() => {
    if (isTestDataEnabled() && localStorage.getItem(TEST_MODE_KEY) === 'true') {
      const saved = localStorage.getItem(TEST_TIME_ENTRIES_KEY);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const saveTestData = useCallback(
    (projects: Project[], timeEntries: TimeEntry[]) => {
      localStorage.setItem(TEST_PROJECTS_KEY, JSON.stringify(projects));
      localStorage.setItem(TEST_TIME_ENTRIES_KEY, JSON.stringify(timeEntries));
    },
    []
  );

  const toggleTestMode = useCallback(
    async (enabled: boolean) => {
      const isTestEnv = isTestDataEnabled();
      if (!isTestEnv) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Test mode is not enabled in environment');
        }
        return;
      }

      setIsTestModeState(enabled);
      localStorage.setItem(TEST_MODE_KEY, enabled.toString());

      window.dispatchEvent(new Event('testModeChanged'));

      if (enabled) {
        const savedProjects = localStorage.getItem(TEST_PROJECTS_KEY);
        const savedTimeEntries = localStorage.getItem(TEST_TIME_ENTRIES_KEY);

        if (!savedProjects || !savedTimeEntries) {
          const { generateTestData } =
            await import('../utils/testDataGenerator');
          const generated = generateTestData([], []);
          setTestProjects(generated.projects);
          setTestTimeEntries(generated.timeEntries);
          saveTestData(generated.projects, generated.timeEntries);
        }
      }
    },
    [saveTestData]
  );

  const testDataStats = {
    projectCount: testProjects.length,
    timeEntryCount: testTimeEntries.length,
  };

  return {
    isTestMode,
    testProjects,
    testTimeEntries,
    setTestProjects,
    setTestTimeEntries,
    toggleTestMode,
    saveTestData,
    testDataStats,
  };
};
