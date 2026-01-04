import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import { TimerControls } from '../TimerControls';

const theme = createTheme();

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('TimerControls', () => {
  it('停止状態で再生ボタンを表示する', () => {
    renderWithTheme(
      <TimerControls isRunning={false} onStart={jest.fn()} onStop={jest.fn()} />
    );

    expect(screen.getByTestId('PlayArrowIcon')).toBeInTheDocument();
  });

  it('実行中で停止ボタンを表示する', () => {
    renderWithTheme(
      <TimerControls isRunning={true} onStart={jest.fn()} onStop={jest.fn()} />
    );

    expect(screen.getByTestId('StopIcon')).toBeInTheDocument();
  });

  it('停止状態でクリックするとonStartが呼ばれる', () => {
    const onStart = jest.fn();
    const onStop = jest.fn();
    renderWithTheme(
      <TimerControls isRunning={false} onStart={onStart} onStop={onStop} />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onStop).not.toHaveBeenCalled();
  });

  it('実行中にクリックするとonStopが呼ばれる', () => {
    const onStart = jest.fn();
    const onStop = jest.fn();
    renderWithTheme(
      <TimerControls isRunning={true} onStart={onStart} onStop={onStop} />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(onStop).toHaveBeenCalledTimes(1);
    expect(onStart).not.toHaveBeenCalled();
  });

  it('ボタンにアクセシビリティラベルがある', () => {
    renderWithTheme(
      <TimerControls isRunning={false} onStart={jest.fn()} onStop={jest.fn()} />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label');
  });
});
