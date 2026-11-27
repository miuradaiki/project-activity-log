import React, { useState, useCallback } from 'react';
import { useSettingsContext } from '../../../contexts/SettingsContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useStorageContext } from '../../../contexts/StorageContext';
import { useToast } from '../../../contexts/ToastContext';

interface UseSettingsStateReturn {
  baseMonthlyHours: number;
  setBaseMonthlyHours: React.Dispatch<React.SetStateAction<number>>;
  isLoading: boolean;
  isTestMode: boolean;
  testDataStats: { projectCount: number; timeEntryCount: number };
  handleCommitBaseMonthlyHours: (hours: number) => Promise<void>;
  handleLanguageChange: (language: 'ja' | 'en') => void;
  handleResetSettings: () => Promise<void>;
  handleToggleTestMode: () => void;
  handleRegenerateTestData: () => Promise<void>;
  showNotification: (
    message: string,
    severity: 'success' | 'error' | 'info'
  ) => void;
}

export const useSettingsState = (): UseSettingsStateReturn => {
  const { settings, isLoading, updateBaseMonthlyHours } = useSettingsContext();
  const { setLanguage, t } = useLanguage();
  const {
    setProjects,
    setTimeEntries,
    isTestMode,
    toggleTestMode,
    testDataStats,
  } = useStorageContext();

  const [baseMonthlyHours, setBaseMonthlyHours] = useState<number>(
    settings?.workHours?.baseMonthlyHours || 140
  );

  const { showToast } = useToast();
  const showNotification = useCallback(
    (message: string, severity: 'success' | 'error' | 'info') =>
      showToast({ message, kind: severity }),
    [showToast]
  );

  // 値を変えた時点で保存する（保存ボタンを押し忘れて反映されない問題を防ぐ）
  const handleCommitBaseMonthlyHours = useCallback(
    async (hours: number) => {
      setBaseMonthlyHours(hours);
      try {
        await updateBaseMonthlyHours(hours);
      } catch {
        // 失敗時は保存済みの値に戻す（連打で古い値へ戻らないよう、描画時の値は使わない）
        setBaseMonthlyHours(settings.workHours.baseMonthlyHours);
        showNotification(t('settings.save.error'), 'error');
      }
    },
    [settings, updateBaseMonthlyHours, showNotification, t]
  );

  const handleLanguageChange = useCallback(
    (language: 'ja' | 'en') => {
      setLanguage(language);
    },
    [setLanguage]
  );

  const handleResetSettings = useCallback(async () => {
    try {
      await updateBaseMonthlyHours(140);
      setBaseMonthlyHours(140);
    } catch {
      showNotification(t('settings.reset.error'), 'error');
    }
  }, [updateBaseMonthlyHours, showNotification, t]);

  const handleToggleTestMode = useCallback(() => {
    const newMode = !isTestMode;
    toggleTestMode(newMode);
    showNotification(
      newMode ? 'テストモードに切り替えました' : '通常モードに切り替えました',
      'success'
    );
  }, [isTestMode, toggleTestMode, showNotification]);

  const handleRegenerateTestData = useCallback(async () => {
    try {
      const { generateTestData } =
        await import('../../../utils/testDataGenerator');
      const { projects: newProjects, timeEntries: newTimeEntries } =
        generateTestData([], []);

      setProjects(newProjects);
      setTimeEntries(newTimeEntries);

      showNotification('テストデータを再生成しました', 'success');
    } catch (_error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('テストデータ生成エラー:', _error);
      }
      const errorMessage =
        _error instanceof Error ? _error.message : '不明なエラー';
      showNotification(
        `テストデータの生成に失敗しました: ${errorMessage}`,
        'error'
      );
    }
  }, [setProjects, setTimeEntries, showNotification]);

  return {
    baseMonthlyHours,
    setBaseMonthlyHours,
    isLoading,
    isTestMode,
    testDataStats,
    handleCommitBaseMonthlyHours,
    handleLanguageChange,
    handleResetSettings,
    handleToggleTestMode,
    handleRegenerateTestData,
    showNotification,
  };
};
