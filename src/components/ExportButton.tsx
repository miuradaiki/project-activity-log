import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '@mui/material';
import { Download } from '@mui/icons-material';

export const ExportButton = () => {
  const { t } = useLanguage();
  const handleExport = async () => {
    try {
      const timeEntries = await window.electronAPI.loadTimeEntries();
      const projects = await window.electronAPI.loadProjects();
      await window.electronAPI.exportCSV(timeEntries, projects);
      alert(t('timer.export.success'));
    } catch (error) {
      console.error('Export error:', error);
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
