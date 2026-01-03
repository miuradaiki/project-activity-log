import { useEffect, useState, useCallback } from 'react';
import { Project, TimeEntry } from '../types';
import { storageService } from '../services/storageService';
import { useTestMode } from './useTestMode';

export const useStorage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const {
    isTestMode,
    testProjects,
    testTimeEntries,
    setTestProjects,
    setTestTimeEntries,
    toggleTestMode,
    saveTestData,
    testDataStats,
  } = useTestMode();

  const loadData = useCallback(async () => {
    try {
      const { projects: loadedProjects, timeEntries: loadedTimeEntries } =
        await storageService.loadAll();

      if (loadedProjects.length > 0) {
        setProjects(loadedProjects);
      }

      if (loadedTimeEntries.length > 0) {
        setTimeEntries(loadedTimeEntries);
      }

      setIsDataLoaded(true);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading data:', error);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveData = useCallback(async () => {
    if (isTestMode) {
      return;
    }

    try {
      if (projects.length === 0 && timeEntries.length === 0) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Preventing save of empty data');
        }
        return;
      }

      // 整合性チェック：存在しないプロジェクトを参照するエントリを除外
      const projectIds = new Set(projects.map((p) => p.id));
      const validTimeEntries = timeEntries.filter((entry) =>
        projectIds.has(entry.projectId)
      );

      if (validTimeEntries.length !== timeEntries.length) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Some time entries reference non-existent projects');
        }
        setTimeEntries(validTimeEntries);
      }

      await storageService.saveAll(projects, validTimeEntries);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error saving data:', error);
      }
    }
  }, [projects, timeEntries, isTestMode]);

  // 初回のデータロードとテストモードの初期化
  useEffect(() => {
    const initialize = async () => {
      if (isTestMode) {
        if (testProjects.length === 0 || testTimeEntries.length === 0) {
          const { generateTestData } =
            await import('../utils/testDataGenerator');
          const { projects: newTestProjects, timeEntries: newTestTimeEntries } =
            generateTestData([], []);
          setTestProjects(newTestProjects);
          setTestTimeEntries(newTestTimeEntries);
          saveTestData(newTestProjects, newTestTimeEntries);
        }
        setIsLoading(false);
      } else {
        await loadData();
      }
    };

    initialize();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // データの保存（テストモードでない場合のみ）
  useEffect(() => {
    if (!isLoading && isDataLoaded && !isTestMode) {
      const timeoutId = setTimeout(() => {
        saveData();
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [isLoading, isDataLoaded, saveData, isTestMode, projects, timeEntries]);

  // テストデータの保存（テストモードの場合のみ）
  useEffect(() => {
    if (isTestMode && testProjects.length > 0) {
      saveTestData(testProjects, testTimeEntries);
    }
  }, [isTestMode, testProjects, testTimeEntries, saveTestData]);

  // 現在のモードに応じたデータを返す
  const currentProjects = isTestMode ? testProjects : projects;
  const currentTimeEntries = isTestMode ? testTimeEntries : timeEntries;

  // セッター
  const setCurrentProjects = useCallback(
    (newProjects: Project[] | ((prev: Project[]) => Project[])) => {
      if (isTestMode) {
        setTestProjects(newProjects);
      } else {
        setProjects(newProjects);
      }
    },
    [isTestMode, setTestProjects]
  );

  const setCurrentTimeEntries = useCallback(
    (newTimeEntries: TimeEntry[] | ((prev: TimeEntry[]) => TimeEntry[])) => {
      if (isTestMode) {
        setTestTimeEntries(newTimeEntries);
      } else {
        setTimeEntries(newTimeEntries);
      }
    },
    [isTestMode, setTestTimeEntries]
  );

  return {
    projects: currentProjects,
    setProjects: setCurrentProjects,
    timeEntries: currentTimeEntries,
    setTimeEntries: setCurrentTimeEntries,
    isLoading,
    isDataLoaded: isTestMode || isDataLoaded,
    reloadData: loadData,
    isTestMode,
    toggleTestMode,
    testDataStats,
  };
};
