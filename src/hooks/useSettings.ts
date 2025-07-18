import { useState, useEffect, useCallback } from 'react';
import { AppSettings, DEFAULT_SETTINGS } from '../types/settings';
import {
  loadSettings,
  saveSettings,
  updateSettings,
} from '../utils/settingsUtils';

/**
 * 設定を管理するカスタムフック
 */
export const useSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // 設定を読み込み
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const loadedSettings = await loadSettings();
        setSettings(loadedSettings);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('設定の読み込みに失敗しました')
        );
        console.error('設定の読み込みに失敗しました:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // 設定を更新
  const updateSettingsValue = useCallback(
    async (updater: (currentSettings: AppSettings) => AppSettings) => {
      try {
        setIsLoading(true);
        const updatedSettings = await updateSettings(updater);
        setSettings(updatedSettings);
        setError(null);
        return updatedSettings;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('設定の更新に失敗しました')
        );
        console.error('設定の更新に失敗しました:', err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // 月間基準時間を更新するユーティリティ関数
  const updateBaseMonthlyHours = useCallback(
    async (hours: number) => {
      return updateSettingsValue((current) => ({
        ...current,
        workHours: {
          ...current.workHours,
          baseMonthlyHours: hours,
        },
      }));
    },
    [updateSettingsValue]
  );

  // 設定をリセット
  const resetAllSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      await saveSettings(DEFAULT_SETTINGS);
      setSettings(DEFAULT_SETTINGS);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('設定のリセットに失敗しました')
      );
      console.error('設定のリセットに失敗しました:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    settings,
    isLoading,
    error,
    updateSettings: updateSettingsValue,
    updateBaseMonthlyHours,
    resetAllSettings,
  };
};
