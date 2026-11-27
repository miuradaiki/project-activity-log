import React from 'react';
import { Button } from '@mui/material';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';

export const ExportButton: React.FC = () => {
  const { t } = useLanguage();
  const { showToast } = useToast();

  const handleExport = async () => {
    try {
      const result = await window.electronAPI.exportToCSV();
      if (result?.canceled) return;
      showToast(
        result?.success
          ? { message: t('timer.export.success'), kind: 'success' }
          : { message: t('timer.export.error'), kind: 'error' }
      );
    } catch {
      showToast({ message: t('timer.export.error'), kind: 'error' });
    }
  };

  return (
    <Button variant="outlined" size="small" onClick={handleExport}>
      {t('timer.export.csv')}
    </Button>
  );
};
