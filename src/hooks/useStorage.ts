import { useEffect, useState, useCallback } from 'react';
import { Project, TimeEntry } from '../types';
import { isTestDataEnabled } from '../utils/env';

// テストモードのキー
const TEST_MODE_KEY = 'project_activity_log_test_mode';
const TEST_PROJECTS_KEY = 'project_activity_log_test_projects';
const TEST_TIME_ENTRIES_KEY = 'project_activity_log_test_time_entries';

export const useStorage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // テストモードの状態管理
  const [isTestMode, setIsTestModeState] = useState(() => {
    // 環境変数とローカルストレージの両方をチェック
    const isTestEnv = isTestDataEnabled();
    const savedTestMode = localStorage.getItem(TEST_MODE_KEY) === 'true';
    return isTestEnv && savedTestMode;
  });

  // テストデータの状態（ローカルストレージから復元）
  const [testProjects, setTestProjects] = useState<Project[]>(() => {
    if (isTestMode) {
      const saved = localStorage.getItem(TEST_PROJECTS_KEY);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [testTimeEntries, setTestTimeEntries] = useState<TimeEntry[]>(() => {
    if (isTestMode) {
      const saved = localStorage.getItem(TEST_TIME_ENTRIES_KEY);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // テストデータをローカルストレージに保存
  const saveTestData = useCallback(
    (projects: Project[], timeEntries: TimeEntry[]) => {
      localStorage.setItem(TEST_PROJECTS_KEY, JSON.stringify(projects));
      localStorage.setItem(TEST_TIME_ENTRIES_KEY, JSON.stringify(timeEntries));
    },
    []
  );

  const loadData = useCallback(async () => {
    try {
      const [loadedProjects, loadedTimeEntries] = await Promise.all([
        window.electronAPI.loadProjects(),
        window.electronAPI.loadTimeEntries(),
      ]);

      if (Array.isArray(loadedProjects) && loadedProjects.length > 0) {
        setProjects(loadedProjects);
      }

      if (Array.isArray(loadedTimeEntries) && loadedTimeEntries.length > 0) {
        setTimeEntries(loadedTimeEntries);
      }

      setIsDataLoaded(true);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading data:', error);
      }
      // エラー時は既存のデータを維持
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveData = useCallback(async () => {
    // テストモードの場合は保存しない
    if (isTestMode) {
      return;
    }

    try {
      // データが空の場合は保存しない
      if (projects.length === 0 && timeEntries.length === 0) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Preventing save of empty data');
        }
        return;
      }

      // プロジェクトとタイムエントリの整合性チェック
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
      await Promise.all([
        window.electronAPI.saveProjects(projects),
        window.electronAPI.saveTimeEntries(validTimeEntries),
      ]);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error saving data:', error);
      }
      // エラー発生時にユーザーに通知する処理を追加することを推奨
    }
  }, [projects, timeEntries, isTestMode]);

  // 初回のデータロードとテストモードの初期化
  useEffect(() => {
    const initialize = async () => {
      if (isTestMode) {
        // テストモードで起動した場合
        if (testProjects.length === 0 || testTimeEntries.length === 0) {
          // テストデータが空の場合は生成
          const { generateTestData } = await import(
            '../utils/testDataGenerator'
          );
          const { projects: newTestProjects, timeEntries: newTestTimeEntries } =
            generateTestData([], []);
          setTestProjects(newTestProjects);
          setTestTimeEntries(newTestTimeEntries);
          saveTestData(newTestProjects, newTestTimeEntries);
        }
        setIsLoading(false);
      } else {
        // 通常モードの場合、実データをロード
        await loadData();
      }
    };

    initialize();
  }, []); // 依存配列を空にして初回のみ実行

  // データの保存（テストモードでない場合のみ）
  useEffect(() => {
    if (!isLoading && isDataLoaded && !isTestMode) {
      const timeoutId = setTimeout(() => {
        saveData();
      }, 1000); // デバウンス処理

      return () => clearTimeout(timeoutId);
    }
  }, [isLoading, isDataLoaded, saveData, isTestMode, projects, timeEntries]);

  // テストデータの保存（テストモードの場合のみ）
  useEffect(() => {
    if (isTestMode && testProjects.length > 0) {
      saveTestData(testProjects, testTimeEntries);
    }
  }, [isTestMode, testProjects, testTimeEntries, saveTestData]);

  // テストモードの切り替え
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

      // カスタムイベントを発火して他のコンポーネントに通知
      window.dispatchEvent(new Event('testModeChanged'));

      if (enabled) {
        // テストモードを有効にする場合
        let newTestProjects = testProjects;
        let newTestTimeEntries = testTimeEntries;

        // 保存されたテストデータがない場合は生成
        if (testProjects.length === 0 || testTimeEntries.length === 0) {
          const { generateTestData } = await import(
            '../utils/testDataGenerator'
          );
          const generated = generateTestData([], []);
          newTestProjects = generated.projects;
          newTestTimeEntries = generated.timeEntries;
          setTestProjects(newTestProjects);
          setTestTimeEntries(newTestTimeEntries);
          saveTestData(newTestProjects, newTestTimeEntries);
        }
      } else {
        // 通常モードに戻る場合は、実データを再読み込み
        await loadData();
      }
    },
    [loadData, testProjects, testTimeEntries, saveTestData]
  );

  // 現在のモードに応じたデータを返す
  const currentProjects = isTestMode ? testProjects : projects;
  const currentTimeEntries = isTestMode ? testTimeEntries : timeEntries;

  // テストモード用のセッター
  const setCurrentProjects = useCallback(
    (newProjects: Project[] | ((prev: Project[]) => Project[])) => {
      if (isTestMode) {
        setTestProjects(newProjects);
      } else {
        setProjects(newProjects);
      }
    },
    [isTestMode]
  );

  const setCurrentTimeEntries = useCallback(
    (newTimeEntries: TimeEntry[] | ((prev: TimeEntry[]) => TimeEntry[])) => {
      if (isTestMode) {
        setTestTimeEntries(newTimeEntries);
      } else {
        setTimeEntries(newTimeEntries);
      }
    },
    [isTestMode]
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
    // テストモード関連のユーティリティ
    testDataStats: {
      projectCount: testProjects.length,
      timeEntryCount: testTimeEntries.length,
    },
  };
};
