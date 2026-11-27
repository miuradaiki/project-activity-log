import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@mui/material';
import { LanguageProvider } from '../contexts/LanguageContext';
import { modernDarkTheme } from '../styles/modernTheme';

/** Graphite テーマ＋日本語で描画するテスト用ヘルパー */
export const renderWithGraphite = (ui: React.ReactElement) => {
  Object.defineProperty(window.navigator, 'language', {
    value: 'ja-JP',
    configurable: true,
  });
  return render(
    <ThemeProvider theme={modernDarkTheme}>
      <LanguageProvider>{ui}</LanguageProvider>
    </ThemeProvider>
  );
};
