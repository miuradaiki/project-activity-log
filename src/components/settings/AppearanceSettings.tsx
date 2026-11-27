import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { SegmentedControl } from '../ui/graphite/SegmentedControl';
import { SettingsGroup, SettingsRow } from './SettingsGroup';

interface AppearanceSettingsProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onLanguageChange: (language: 'ja' | 'en') => void;
}

export const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({
  isDarkMode,
  onToggleTheme,
  onLanguageChange,
}) => {
  const { language, t } = useLanguage();

  return (
    <SettingsGroup title={t('settings.appearance.language')}>
      <SettingsRow
        title={t('settings.theme')}
        description={t('settings.theme.hint')}
      >
        <SegmentedControl
          ariaLabel={t('settings.theme')}
          value={isDarkMode ? 'dark' : 'light'}
          onChange={(mode) => {
            if ((mode === 'dark') !== isDarkMode) onToggleTheme();
          }}
          options={[
            { value: 'light', label: t('settings.theme.light') },
            { value: 'dark', label: t('settings.theme.dark') },
          ]}
        />
      </SettingsRow>
      <SettingsRow title={t('settings.language')}>
        <SegmentedControl
          ariaLabel={t('settings.language')}
          value={language}
          onChange={onLanguageChange}
          options={[
            { value: 'ja', label: '日本語' },
            { value: 'en', label: 'English' },
          ]}
        />
      </SettingsRow>
    </SettingsGroup>
  );
};
