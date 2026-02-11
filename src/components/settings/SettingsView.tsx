import React from 'react';
import { Box, Typography, Alert, Snackbar, Grid } from '@mui/material';
import { useLanguage } from '../../contexts/LanguageContext';
import { isTestDataEnabled } from '../../utils/env';
import { useSettingsState } from './hooks/useSettingsState';
import { WorkHoursSettings } from './WorkHoursSettings';
import { AppearanceSettings } from './AppearanceSettings';
import { TestModeSettings } from './TestModeSettings';

interface SettingsViewProps {
  onToggleTheme: () => void;
  isDarkMode: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onToggleTheme,
  isDarkMode,
}) => {
  const { t } = useLanguage();
  const testDataFeatureEnabled = isTestDataEnabled();

  const {
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
    handleCloseNotification,
  } = useSettingsState();

  if (isLoading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography>{t('settings.loading')}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      <Typography variant="h5" fontWeight="medium" sx={{ mb: 3 }}>
        {t('settings.title')}
      </Typography>
      <Grid container spacing={3}>
        <Grid size={12}>
          <WorkHoursSettings
            baseMonthlyHours={baseMonthlyHours}
            onBaseMonthlyHoursChange={setBaseMonthlyHours}
            onSave={handleSaveBaseMonthlyHours}
            onReset={handleResetSettings}
          />
        </Grid>

        <Grid size={12}>
          <AppearanceSettings
            isDarkMode={isDarkMode}
            onToggleTheme={onToggleTheme}
            onLanguageChange={handleLanguageChange}
          />
        </Grid>

        {testDataFeatureEnabled && (
          <Grid size={12}>
            <TestModeSettings
              isTestMode={isTestMode}
              testDataStats={testDataStats}
              onToggleTestMode={handleToggleTestMode}
              onRegenerateTestData={handleRegenerateTestData}
            />
          </Grid>
        )}
      </Grid>
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
          elevation={6}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
