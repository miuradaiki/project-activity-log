import React from 'react';
import { Button } from '@mui/material';
import { Download } from '@mui/icons-material';

export const ExportButton = () => {
  const handleExport = async () => {
    try {
      const result = await window.electronAPI.exportToCSV();
      if (result.success) {
        alert('データのエクスポートが完了しました');
      } else {
        alert('エクスポート中にエラーが発生しました');
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('エクスポートに失敗しました');
    }
  };

  return (
    <Button 
      variant="contained" 
      color="primary" 
      startIcon={<Download />}
      onClick={handleExport}
    >
      作業記録をCSVエクスポート
    </Button>
  );
};

