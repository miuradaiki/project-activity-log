import { useEffect, useState, useCallback } from 'react';
import { Project, TimeEntry } from '../types';

export const useStorage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [loadedProjects, loadedTimeEntries] = await Promise.all([
        window.electronAPI.loadProjects(),
        window.electronAPI.loadTimeEntries()
      ]);

      if (Array.isArray(loadedProjects) && loadedProjects.length > 0) {
        setProjects(loadedProjects);
      }

      if (Array.isArray(loadedTimeEntries) && loadedTimeEntries.length > 0) {
        setTimeEntries(loadedTimeEntries);
      }

      setIsDataLoaded(true);
    } catch (error) {
      console.error('Error loading data:', error);
      // エラー時は既存のデータを維持
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveData = useCallback(async () => {
    try {
      // データが空の場合は保存しない
      if (projects.length === 0 && timeEntries.length === 0) {
        console.warn('Preventing save of empty data');
        return;
      }

      // プロジェクトとタイムエントリの整合性チェック
      const projectIds = new Set(projects.map(p => p.id));
      const validTimeEntries = timeEntries.filter(entry => projectIds.has(entry.projectId));

      if (validTimeEntries.length !== timeEntries.length) {
        console.warn('Some time entries reference non-existent projects');
        setTimeEntries(validTimeEntries);
      }
      await Promise.all([
        window.electronAPI.saveProjects(projects),
        window.electronAPI.saveTimeEntries(validTimeEntries)
      ]);
    } catch (error) {
      console.error('Error saving data:', error);
      // エラー発生時にユーザーに通知する処理を追加することを推奨
    }
  }, [projects, timeEntries]);

  // 初回のデータロード
  useEffect(() => {
    loadData();
  }, [loadData]);

  // データの保存
  useEffect(() => {
    if (!isLoading && isDataLoaded) {
      const timeoutId = setTimeout(() => {
        saveData();
      }, 1000); // デバウンス処理

      return () => clearTimeout(timeoutId);
    }
  }, [isLoading, isDataLoaded, saveData]);

  return {
    projects,
    setProjects,
    timeEntries,
    setTimeEntries,
    isLoading,
    isDataLoaded,
    reloadData: loadData // データの再読み込み用
  };
};
