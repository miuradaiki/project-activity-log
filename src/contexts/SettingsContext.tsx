import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { AppSettings, DEFAULT_SETTINGS } from '../types/settings';
import { loadSettings, updateSettings } from '../utils/settingsUtils';

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

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // 初期化時に設定を読み込む
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const loadedSettings = await loadSettings();
        setSettings(loadedSettings);
      } catch (error) {
        console.error('設定の読み込みに失敗しました:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // 月間基準時間を更新
  const updateBaseMonthlyHours = async (hours: number) => {
    try {
      setIsLoading(true);
      const updatedSettings = await updateSettings((current) => ({
        ...current,
        workHours: {
          ...current.workHours,
          baseMonthlyHours: hours,
        },
      }));
      setSettings(updatedSettings);
    } catch (error) {
      console.error('設定の更新に失敗しました:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // コンテキスト値
  const value = {
    settings,
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
    throw new Error('useSettingsContext must be used within a SettingsProvider');
  }
  return context;
};
