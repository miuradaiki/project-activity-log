import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import { TimerProjectInfo } from '../TimerProjectInfo';
import { Project } from '../../../../types';

const theme = createTheme();

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

const mockProject: Project = {
  id: '1',
  name: 'テストプロジェクト',
  description: 'テスト用の説明',
  monthlyCapacity: 50,
  isArchived: false,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('TimerProjectInfo', () => {
  it('実行中のラベルを表示する', () => {
    renderWithTheme(
      <TimerProjectInfo project={mockProject} isRunning={true} />
    );

    expect(screen.getByText('Currently Working On')).toBeInTheDocument();
  });

  it('停止中のラベルを表示する', () => {
    renderWithTheme(
      <TimerProjectInfo project={mockProject} isRunning={false} />
    );

    expect(screen.getByText('Selected Project')).toBeInTheDocument();
  });

  it('プロジェクト名を表示する', () => {
    renderWithTheme(
      <TimerProjectInfo project={mockProject} isRunning={false} />
    );

    expect(screen.getByText('テストプロジェクト')).toBeInTheDocument();
  });

  it('長いプロジェクト名がtitle属性で確認できる', () => {
    const longNameProject = {
      ...mockProject,
      name: 'とても長いプロジェクト名のテスト',
    };
    renderWithTheme(
      <TimerProjectInfo project={longNameProject} isRunning={false} />
    );

    const projectNameElement =
      screen.getByTitle('とても長いプロジェクト名のテスト');
    expect(projectNameElement).toBeInTheDocument();
  });
});
