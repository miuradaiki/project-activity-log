import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '@mui/material';
import { Download } from '@mui/icons-material';

export const ExportButton = () => {
  const { t } = useLanguage();
  const handleExport = async () => {
    try {
      // exportCSVは引数を取らない（main.js側でデータを取得する）
      const result = await window.electronAPI.exportToCSV();
      if (result && result.success) {
        alert(t('timer.export.success'));
      } else {
        alert(t('timer.export.error'));
      }
    } catch {
      alert(t('timer.export.error'));
    }
  };

  return (
    <Button
      variant="contained"
      color="primary"
      startIcon={<Download />}
      onClick={handleExport}
    >
      {t('actions.export')}
    </Button>
  );
};
