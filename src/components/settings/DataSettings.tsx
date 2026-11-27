import React from 'react';
import { Button } from '@mui/material';
import { useLanguage } from '../../contexts/LanguageContext';
import { SettingsGroup, SettingsRow } from './SettingsGroup';

interface DataSettingsProps {
  onImportCSV: () => void;
}

export const DataSettings: React.FC<DataSettingsProps> = ({ onImportCSV }) => {
  const { t } = useLanguage();
  return (
    <SettingsGroup title={t('settings.data')}>
      <SettingsRow
        title={t('settings.import.title')}
        description={t('settings.import.description')}
      >
        <Button variant="outlined" onClick={onImportCSV}>
          {t('settings.import.button')}
        </Button>
      </SettingsRow>
    </SettingsGroup>
  );
};
