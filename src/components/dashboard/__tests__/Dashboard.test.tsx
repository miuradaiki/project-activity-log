import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import { Dashboard } from '../Dashboard';
import {
  createMockProject,
  createMockTimeEntry,
} from '../../../__mocks__/electron';
import { Project, TimeEntry } from '../../../types';
import { projectColorManager } from '../../../utils/colorUtils';

// 子コンポーネントをモック
jest.mock('../MonthlyProgressSummary', () => ({
  MonthlyProgressSummary: ({
    projects,
    timeEntries,
  }: {
    projects: Project[];
    timeEntries: TimeEntry[];
  }) => (
    <div data-testid="monthly-progress-summary">
      MonthlyProgressSummary: {projects.length} projects, {timeEntries.length}{' '}
      entries
    </div>
  ),
}));

jest.mock('../ActivityHeatmap', () => ({
  ActivityHeatmap: ({ timeEntries }: { timeEntries: TimeEntry[] }) => (
    <div data-testid="activity-heatmap">
      ActivityHeatmap: {timeEntries.length} entries
    </div>
  ),
}));

jest.mock('../WeeklySummary', () => ({
  WeeklySummary: ({
    projects,
    timeEntries,
  }: {
    projects: Project[];
    timeEntries: TimeEntry[];
  }) => (
    <div data-testid="weekly-summary">
      WeeklySummary: {projects.length} projects, {timeEntries.length} entries
    </div>
  ),
}));

jest.mock('../MonthlySummary', () => ({
  MonthlySummary: ({
    projects,
    timeEntries,
  }: {
    projects: Project[];
    timeEntries: TimeEntry[];
  }) => (
    <div data-testid="monthly-summary">
      MonthlySummary: {projects.length} projects, {timeEntries.length} entries
    </div>
  ),
}));

jest.mock('../ProjectProgressView', () => ({
  ProjectProgressView: ({
    projects,
    timeEntries,
    onStartTimer,
  }: {
    projects: Project[];
    timeEntries: TimeEntry[];
    onStartTimer: (projectId: string) => void;
  }) => (
    <div data-testid="project-progress-view">
      <span>
        ProjectProgressView: {projects.length} projects, {timeEntries.length}{' '}
        entries
      </span>
      <button onClick={() => onStartTimer('test-id')}>Start Timer</button>
    </div>
  ),
}));

const theme = createTheme();

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('Dashboard', () => {
  const mockProjects: Project[] = [
    createMockProject({ id: 'project-1', name: 'Project 1' }),
    createMockProject({ id: 'project-2', name: 'Project 2' }),
  ];

  const mockTimeEntries: TimeEntry[] = [
    createMockTimeEntry({ id: 'entry-1', projectId: 'project-1' }),
    createMockTimeEntry({ id: 'entry-2', projectId: 'project-2' }),
  ];

  const mockOnStartTimer = jest.fn();
  const mockOnEditProject = jest.fn();
  const mockOnArchiveProject = jest.fn();
  const mockOnUnarchiveProject = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // projectColorManager の初期化をスパイ
    jest.spyOn(projectColorManager, 'initializeColors');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('初期レンダリング', () => {
    it('色の初期化後に全ての子コンポーネントが表示される', async () => {
      renderWithTheme(
        <Dashboard
          projects={mockProjects}
          timeEntries={mockTimeEntries}
          onStartTimer={mockOnStartTimer}
          onEditProject={mockOnEditProject}
          onArchiveProject={mockOnArchiveProject}
          onUnarchiveProject={mockOnUnarchiveProject}
        />
      );

      // 色の初期化を待つ
      await waitFor(() => {
        expect(
          screen.getByTestId('monthly-progress-summary')
        ).toBeInTheDocument();
      });

      expect(screen.getByTestId('activity-heatmap')).toBeInTheDocument();
      expect(screen.getByTestId('weekly-summary')).toBeInTheDocument();
      expect(screen.getByTestId('monthly-summary')).toBeInTheDocument();
      expect(screen.getByTestId('project-progress-view')).toBeInTheDocument();
    });

    it('projectColorManager.initializeColors が呼ばれる', async () => {
      renderWithTheme(
        <Dashboard
          projects={mockProjects}
          timeEntries={mockTimeEntries}
          onStartTimer={mockOnStartTimer}
        />
      );

      await waitFor(() => {
        expect(projectColorManager.initializeColors).toHaveBeenCalledWith(
          mockProjects
        );
      });
    });
  });

  describe('プロパティの伝達', () => {
    it('子コンポーネントにプロジェクトとタイムエントリーが渡される', async () => {
      renderWithTheme(
        <Dashboard
          projects={mockProjects}
          timeEntries={mockTimeEntries}
          onStartTimer={mockOnStartTimer}
        />
      );

      await waitFor(() => {
        expect(
          screen.getByTestId('monthly-progress-summary')
        ).toHaveTextContent('2 projects');
        expect(
          screen.getByTestId('monthly-progress-summary')
        ).toHaveTextContent('2 entries');
      });

      expect(screen.getByTestId('activity-heatmap')).toHaveTextContent(
        '2 entries'
      );
      expect(screen.getByTestId('weekly-summary')).toHaveTextContent(
        '2 projects'
      );
      expect(screen.getByTestId('monthly-summary')).toHaveTextContent(
        '2 projects'
      );
      expect(screen.getByTestId('project-progress-view')).toHaveTextContent(
        '2 projects'
      );
    });
  });

  describe('空データの処理', () => {
    it('プロジェクトが空でも正常にレンダリングされる', async () => {
      renderWithTheme(
        <Dashboard
          projects={[]}
          timeEntries={[]}
          onStartTimer={mockOnStartTimer}
        />
      );

      await waitFor(() => {
        expect(
          screen.getByTestId('monthly-progress-summary')
        ).toHaveTextContent('0 projects');
      });

      expect(screen.getByTestId('activity-heatmap')).toHaveTextContent(
        '0 entries'
      );
    });
  });

  describe('イベントハンドリング', () => {
    it('onStartTimerが子コンポーネントから呼び出せる', async () => {
      renderWithTheme(
        <Dashboard
          projects={mockProjects}
          timeEntries={mockTimeEntries}
          onStartTimer={mockOnStartTimer}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('project-progress-view')).toBeInTheDocument();
      });

      const startButton = screen.getByRole('button', { name: /start timer/i });
      startButton.click();

      expect(mockOnStartTimer).toHaveBeenCalledWith('test-id');
    });
  });

  describe('プロジェクト変更時の挙動', () => {
    it('プロジェクトが変更されると色が再初期化される', async () => {
      const { rerender } = renderWithTheme(
        <Dashboard
          projects={mockProjects}
          timeEntries={mockTimeEntries}
          onStartTimer={mockOnStartTimer}
        />
      );

      await waitFor(() => {
        expect(projectColorManager.initializeColors).toHaveBeenCalledTimes(1);
      });

      const newProjects = [
        ...mockProjects,
        createMockProject({ id: 'project-3', name: 'Project 3' }),
      ];

      rerender(
        <ThemeProvider theme={theme}>
          <Dashboard
            projects={newProjects}
            timeEntries={mockTimeEntries}
            onStartTimer={mockOnStartTimer}
          />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(projectColorManager.initializeColors).toHaveBeenCalledTimes(2);
        expect(projectColorManager.initializeColors).toHaveBeenLastCalledWith(
          newProjects
        );
      });
    });
  });
});
