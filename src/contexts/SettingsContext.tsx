import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from 'react';
import { AppSettings, DEFAULT_SETTINGS } from '../types/settings';
import { loadSettings, updateSettings } from '../utils/settingsUtils';
import { isTestDataEnabled } from '../utils/env';
import { STORAGE_KEYS } from '../constants/storageKeys';

// コンテキストの型定義
interface SettingsContextType {
  settings: AppSettings;
  isLoading: boolean;
  updateBaseMonthlyHours: (hours: number) => Promise<void>;
}

// デフォルト値の作成
const defaultContextValue: SettingsContextType = {
  settings: DEFAULT_SETTINGS,
  isLoading: true,
  updateBaseMonthlyHours: async () => {},
};

// コンテキストの作成
const SettingsContext = createContext<SettingsContextType>(defaultContextValue);

// コンテキストプロバイダコンポーネント
interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({
  children,
}) => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isTestMode, setIsTestMode] = useState(false);

  // テストモード用の設定
  const [testSettings, setTestSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TEST_SETTINGS);
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  // テストモードの状態を監視
  useEffect(() => {
    const checkTestMode = () => {
      const testModeEnabled =
        localStorage.getItem('project_activity_log_test_mode') === 'true' &&
        isTestDataEnabled();
      setIsTestMode(testModeEnabled);
    };

    // 初回チェック
    checkTestMode();

    // localStorageの変更を監視
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'project_activity_log_test_mode') {
        checkTestMode();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // カスタムイベントでも監視（同一タブでの変更検知用）
    const handleTestModeChange = () => checkTestMode();
    window.addEventListener('testModeChanged', handleTestModeChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('testModeChanged', handleTestModeChange);
    };
  }, []);

  // 初期化時に設定を読み込む
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        if (!isTestMode) {
          const loadedSettings = await loadSettings();
          setSettings(loadedSettings);
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('設定の読み込みに失敗しました:', error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [isTestMode]);

  // テストモード用の設定を保存
  useEffect(() => {
    if (isTestMode) {
      localStorage.setItem(
        STORAGE_KEYS.TEST_SETTINGS,
        JSON.stringify(testSettings)
      );
    }
  }, [isTestMode, testSettings]);

  // 月間基準時間を更新
  const updateBaseMonthlyHours = async (hours: number) => {
    try {
      setIsLoading(true);

      if (isTestMode) {
        // テストモードの場合はローカルステートのみ更新
        const updatedSettings = {
          ...testSettings,
          workHours: {
            ...testSettings.workHours,
            baseMonthlyHours: hours,
          },
        };
        setTestSettings(updatedSettings);
      } else {
        // 通常モードの場合は従来通り
        const updatedSettings = await updateSettings((current) => ({
          ...current,
          workHours: {
            ...current.workHours,
            baseMonthlyHours: hours,
          },
        }));
        setSettings(updatedSettings);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('設定の更新に失敗しました:', error);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 現在のモードに応じた設定を返す
  const currentSettings = isTestMode ? testSettings : settings;

  // コンテキスト値
  const value = {
    settings: currentSettings,
    isLoading,
    updateBaseMonthlyHours,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

// カスタムフック
export const useSettingsContext = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error(
      'useSettingsContext must be used within a SettingsProvider'
    );
  }
  return context;
};
