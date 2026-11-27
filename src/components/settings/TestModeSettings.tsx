import React from 'react';
import { Box, Button, Switch, useTheme } from '@mui/material';
import { useLanguage } from '../../contexts/LanguageContext';
import { numberTypography } from '../../styles/modernTheme';
import { SettingsGroup, SettingsRow } from './SettingsGroup';

interface TestModeSettingsProps {
  isTestMode: boolean;
  testDataStats: { projectCount: number; timeEntryCount: number };
  onToggleTestMode: () => void;
  onRegenerateTestData: () => void;
}

/** 開発時だけ表示する。他の設定グループと同じ行の形式にそろえる */
export const TestModeSettings: React.FC<TestModeSettingsProps> = ({
  isTestMode,
  testDataStats,
  onToggleTestMode,
  onRegenerateTestData,
}) => {
  const theme = useTheme();
  const { t } = useLanguage();
  const stat = (value: number, label: string) => (
    <Box sx={{ fontSize: 12, color: 'text.secondary' }}>
      <Box
        sx={{
          ...numberTypography(theme),
          fontWeight: 300,
          display: 'block',
          fontSize: 22,
          color: 'text.primary',
        }}
      >
        {value}
      </Box>
      {label}
    </Box>
  );

  return (
    <SettingsGroup
      title={t('settings.testmode.title')}
      badge={t('settings.testmode.badge')}
    >
      <SettingsRow
        title={t('settings.testmode.use')}
        description={t('settings.testmode.description')}
      >
        <Switch
          checked={isTestMode}
          onChange={onToggleTestMode}
          slotProps={{
            input: { role: 'switch', 'aria-label': t('settings.testmode.use') },
          }}
        />
      </SettingsRow>
      {isTestMode && (
        <SettingsRow title={t('settings.testmode.data')}>
          <Box sx={{ display: 'flex', gap: 3.5, mr: 'auto' }}>
            {stat(testDataStats.projectCount, t('settings.testmode.projects'))}
            {stat(testDataStats.timeEntryCount, t('settings.testmode.entries'))}
          </Box>
          <Button
            variant="outlined"
            size="small"
            onClick={onRegenerateTestData}
          >
            {t('settings.testmode.regenerate')}
          </Button>
        </SettingsRow>
      )}
    </SettingsGroup>
  );
};
