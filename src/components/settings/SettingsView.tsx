import React from 'react';
import { Box, Typography } from '@mui/material';
import { useLanguage } from '../../contexts/LanguageContext';
import { isTestDataEnabled } from '../../utils/env';
import { useSettingsState } from './hooks/useSettingsState';
import { WorkHoursSettings } from './WorkHoursSettings';
import { AppearanceSettings } from './AppearanceSettings';
import { TestModeSettings } from './TestModeSettings';
import { DataSettings } from './DataSettings';
import { PageHeader } from '../ui/PageHeader';

interface SettingsViewProps {
  onToggleTheme: () => void;
  isDarkMode: boolean;
  onImportCSV: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onToggleTheme,
  isDarkMode,
  onImportCSV,
}) => {
  const { t } = useLanguage();
  const testDataFeatureEnabled = isTestDataEnabled();

  const {
    baseMonthlyHours,
    isLoading,
    isTestMode,
    testDataStats,
    handleCommitBaseMonthlyHours,
    handleLanguageChange,
    handleResetSettings,
    handleToggleTestMode,
    handleRegenerateTestData,
  } = useSettingsState();

  if (isLoading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography>{t('settings.loading')}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title={t('settings.title')}
        subtitle={t('settings.instant')}
      />
      <Box
        sx={{
          maxWidth: 720,
          display: 'flex',
          flexDirection: 'column',
          gap: 3.25,
        }}
      >
        <WorkHoursSettings
          baseMonthlyHours={baseMonthlyHours}
          onCommit={handleCommitBaseMonthlyHours}
          onReset={handleResetSettings}
        />
        <AppearanceSettings
          isDarkMode={isDarkMode}
          onToggleTheme={onToggleTheme}
          onLanguageChange={handleLanguageChange}
        />
        <DataSettings onImportCSV={onImportCSV} />
        {testDataFeatureEnabled && (
          <TestModeSettings
            isTestMode={isTestMode}
            testDataStats={testDataStats}
            onToggleTestMode={handleToggleTestMode}
            onRegenerateTestData={handleRegenerateTestData}
          />
        )}
      </Box>
    </Box>
  );
};
