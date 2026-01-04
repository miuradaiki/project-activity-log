import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import { TimerDisplay } from '../TimerDisplay';

const theme = createTheme();

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('TimerDisplay', () => {
  it('経過時間を表示する', () => {
    renderWithTheme(<TimerDisplay elapsed="01:23:45" isRunning={false} />);

    expect(screen.getByText('01:23:45')).toBeInTheDocument();
  });

  it('初期状態（00:00:00）を表示できる', () => {
    renderWithTheme(<TimerDisplay elapsed="00:00:00" isRunning={false} />);

    expect(screen.getByText('00:00:00')).toBeInTheDocument();
  });

  it('実行中のスタイルが適用される', () => {
    const { container } = renderWithTheme(
      <TimerDisplay elapsed="00:05:00" isRunning={true} />
    );

    const typography = container.querySelector('h3');
    expect(typography).toBeInTheDocument();
  });

  it('停止中のスタイルが適用される', () => {
    const { container } = renderWithTheme(
      <TimerDisplay elapsed="00:05:00" isRunning={false} />
    );

    const typography = container.querySelector('h3');
    expect(typography).toBeInTheDocument();
  });
});
