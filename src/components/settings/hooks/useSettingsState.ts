import React, { useState, useCallback } from 'react';
import { useSettingsContext } from '../../../contexts/SettingsContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useStorage } from '../../../hooks/useStorage';

interface Notification {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info';
}

interface UseSettingsStateReturn {
  baseMonthlyHours: number;
  setBaseMonthlyHours: React.Dispatch<React.SetStateAction<number>>;
  notification: Notification;
  isLoading: boolean;
  isTestMode: boolean;
  testDataStats: { projectCount: number; timeEntryCount: number };
  handleSaveBaseMonthlyHours: () => Promise<void>;
  handleLanguageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleResetSettings: () => Promise<void>;
  handleToggleTestMode: () => void;
  handleRegenerateTestData: () => Promise<void>;
  showNotification: (
    message: string,
    severity: 'success' | 'error' | 'info'
  ) => void;
  handleCloseNotification: () => void;
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
  } = useStorage();

  const [baseMonthlyHours, setBaseMonthlyHours] = useState<number>(
    settings?.workHours?.baseMonthlyHours || 140
  );

  const [notification, setNotification] = useState<Notification>({
    open: false,
    message: '',
    severity: 'info',
  });

  const showNotification = useCallback(
    (message: string, severity: 'success' | 'error' | 'info') => {
      setNotification({ open: true, message, severity });
    },
    []
  );

  const handleCloseNotification = useCallback(() => {
    setNotification((prev) => ({ ...prev, open: false }));
  }, []);

  const handleSaveBaseMonthlyHours = useCallback(async () => {
    try {
      await updateBaseMonthlyHours(baseMonthlyHours);
      showNotification(t('settings.monthly.hours.saved'), 'success');
    } catch {
      showNotification(t('settings.save.error'), 'error');
    }
  }, [baseMonthlyHours, updateBaseMonthlyHours, showNotification, t]);

  const handleLanguageChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setLanguage(event.target.value as 'ja' | 'en');
      showNotification(t('settings.language.changed'), 'success');
    },
    [setLanguage, showNotification, t]
  );

  const handleResetSettings = useCallback(async () => {
    try {
      await updateBaseMonthlyHours(140);
      setBaseMonthlyHours(140);
      showNotification(t('settings.reset.success'), 'success');
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
      const { generateTestData } = await import(
        '../../../utils/testDataGenerator'
      );
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
    notification,
    isLoading,
    isTestMode,
    testDataStats,
    handleSaveBaseMonthlyHours,
    handleLanguageChange,
    handleResetSettings,
    handleToggleTestMode,
    handleRegenerateTestData,
    showNotification,
    handleCloseNotification,
  };
};
