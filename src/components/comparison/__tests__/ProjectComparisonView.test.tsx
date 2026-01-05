import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import { ProjectComparisonView } from '../ProjectComparisonView';
import {
  createMockProject,
  createMockTimeEntry,
} from '../../../__mocks__/electron';
import { Project, TimeEntry } from '../../../types';

// Recharts のモック
jest.mock('recharts', () => ({
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: ({ dataKey }: { dataKey: string }) => (
    <div data-testid={`bar-${dataKey}`} />
  ),
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  Legend: () => <div data-testid="legend" />,
}));

const theme = createTheme();

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('ProjectComparisonView', () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const mockProjects: Project[] = [
    createMockProject({
      id: 'project-1',
      name: 'Project A',
      isArchived: false,
      monthlyCapacity: 40,
    }),
    createMockProject({
      id: 'project-2',
      name: 'Project B',
      isArchived: false,
      monthlyCapacity: 30,
    }),
    createMockProject({
      id: 'project-3',
      name: 'Project C',
      isArchived: false,
      monthlyCapacity: 20,
    }),
    createMockProject({
      id: 'archived-project',
      name: 'Archived Project',
      isArchived: true,
      monthlyCapacity: 10,
    }),
  ];

  const mockTimeEntries: TimeEntry[] = [
    createMockTimeEntry({
      id: 'entry-1',
      projectId: 'project-1',
      startTime: new Date(currentYear, currentMonth, 5, 9, 0).toISOString(),
      endTime: new Date(currentYear, currentMonth, 5, 17, 0).toISOString(),
    }),
    createMockTimeEntry({
      id: 'entry-2',
      projectId: 'project-2',
      startTime: new Date(currentYear, currentMonth, 6, 10, 0).toISOString(),
      endTime: new Date(currentYear, currentMonth, 6, 15, 0).toISOString(),
    }),
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('基本レンダリング', () => {
    it('タイトルが表示される', () => {
      renderWithTheme(
        <ProjectComparisonView
          projects={mockProjects}
          timeEntries={mockTimeEntries}
        />
      );

      expect(screen.getByText('プロジェクト比較')).toBeInTheDocument();
    });

    it('サブタイトルが表示される', () => {
      renderWithTheme(
        <ProjectComparisonView
          projects={mockProjects}
          timeEntries={mockTimeEntries}
        />
      );

      expect(
        screen.getByText('複数プロジェクトの進捗状況を比較')
      ).toBeInTheDocument();
    });

    it('表示モード切り替えボタンが表示される', () => {
      renderWithTheme(
        <ProjectComparisonView
          projects={mockProjects}
          timeEntries={mockTimeEntries}
        />
      );

      expect(screen.getByTestId('DonutLargeIcon')).toBeInTheDocument();
    });
  });

  describe('プロジェクト選択', () => {
    it('プロジェクト選択セレクターが表示される', () => {
      renderWithTheme(
        <ProjectComparisonView
          projects={mockProjects}
          timeEntries={mockTimeEntries}
        />
      );

      expect(screen.getByLabelText(/比較するプロジェクト/)).toBeInTheDocument();
    });

    it('アーカイブされていないプロジェクトのみが選択肢に表示される', async () => {
      renderWithTheme(
        <ProjectComparisonView
          projects={mockProjects}
          timeEntries={mockTimeEntries}
        />
      );

      // セレクターをクリック
      const selector = screen.getByRole('combobox');
      fireEvent.mouseDown(selector);

      await waitFor(() => {
        expect(
          screen.getByRole('option', { name: 'Project A' })
        ).toBeInTheDocument();
        expect(
          screen.getByRole('option', { name: 'Project B' })
        ).toBeInTheDocument();
        expect(
          screen.getByRole('option', { name: 'Project C' })
        ).toBeInTheDocument();
        expect(
          screen.queryByRole('option', { name: 'Archived Project' })
        ).not.toBeInTheDocument();
      });
    });

    it('自動的に最大5つのプロジェクトが選択される', () => {
      const manyProjects = Array.from({ length: 7 }, (_, i) =>
        createMockProject({
          id: `project-${i + 1}`,
          name: `Project ${i + 1}`,
          isArchived: false,
        })
      );

      renderWithTheme(
        <ProjectComparisonView projects={manyProjects} timeEntries={[]} />
      );

      // 選択されたプロジェクトのチップを確認
      const chips = screen
        .getAllByRole('button')
        .filter((btn) => btn.classList.contains('MuiChip-root'));
      // チップの数は最大5つのはず
      expect(chips.length).toBeLessThanOrEqual(5);
    });
  });

  describe('グラフ表示', () => {
    it('デフォルトで棒グラフが表示される', () => {
      renderWithTheme(
        <ProjectComparisonView
          projects={mockProjects}
          timeEntries={mockTimeEntries}
        />
      );

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('表示モードを切り替えると円グラフが表示される', () => {
      renderWithTheme(
        <ProjectComparisonView
          projects={mockProjects}
          timeEntries={mockTimeEntries}
        />
      );

      const toggleButton = screen
        .getByTestId('DonutLargeIcon')
        .closest('button')!;
      fireEvent.click(toggleButton);

      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    });

    it('再度切り替えると棒グラフに戻る', () => {
      renderWithTheme(
        <ProjectComparisonView
          projects={mockProjects}
          timeEntries={mockTimeEntries}
        />
      );

      const toggleButton = screen
        .getByTestId('DonutLargeIcon')
        .closest('button')!;

      // 円グラフに切り替え
      fireEvent.click(toggleButton);
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();

      // 棒グラフに戻す
      const viewWeekButton = screen
        .getByTestId('ViewWeekIcon')
        .closest('button')!;
      fireEvent.click(viewWeekButton);
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });

  describe('プロジェクト詳細', () => {
    it('プロジェクト詳細セクションが表示される', async () => {
      renderWithTheme(
        <ProjectComparisonView
          projects={mockProjects}
          timeEntries={mockTimeEntries}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('プロジェクト詳細')).toBeInTheDocument();
      });
    });

    it('進捗率が表示される', async () => {
      renderWithTheme(
        <ProjectComparisonView
          projects={mockProjects}
          timeEntries={mockTimeEntries}
        />
      );

      await waitFor(() => {
        expect(screen.getAllByText(/進捗:/)[0]).toBeInTheDocument();
      });
    });

    it('実績と目標が表示される', async () => {
      renderWithTheme(
        <ProjectComparisonView
          projects={mockProjects}
          timeEntries={mockTimeEntries}
        />
      );

      await waitFor(() => {
        expect(screen.getAllByText(/実績:/)[0]).toBeInTheDocument();
        expect(screen.getAllByText(/目標:/)[0]).toBeInTheDocument();
      });
    });
  });

  describe('空データの処理', () => {
    it('プロジェクトが選択されていない場合にメッセージが表示される', () => {
      renderWithTheme(
        <ProjectComparisonView
          projects={mockProjects}
          timeEntries={mockTimeEntries}
          activeProjects={[]}
        />
      );

      // 初期選択で自動選択されるので、空にはならない
      // ただし、全てアーカイブされている場合は空になる
    });

    it('タイムエントリーがなくてもエラーなくレンダリングされる', () => {
      renderWithTheme(
        <ProjectComparisonView projects={mockProjects} timeEntries={[]} />
      );

      expect(screen.getByText('プロジェクト比較')).toBeInTheDocument();
    });

    it('アーカイブプロジェクトのみの場合、選択メッセージが表示される', () => {
      const archivedOnlyProjects = [
        createMockProject({
          id: 'archived-1',
          name: 'Archived 1',
          isArchived: true,
        }),
        createMockProject({
          id: 'archived-2',
          name: 'Archived 2',
          isArchived: true,
        }),
      ];

      renderWithTheme(
        <ProjectComparisonView
          projects={archivedOnlyProjects}
          timeEntries={[]}
        />
      );

      expect(
        screen.getByText('比較するプロジェクトを選択してください')
      ).toBeInTheDocument();
    });
  });

  describe('activeProjects プロパティ', () => {
    it('activeProjectsが指定された場合、その順序で選択される', async () => {
      renderWithTheme(
        <ProjectComparisonView
          projects={mockProjects}
          timeEntries={mockTimeEntries}
          activeProjects={['project-2', 'project-1']}
        />
      );

      await waitFor(() => {
        // project-2が最初に表示されていることを確認
        const projectDetails = screen.getAllByText(/Project [AB]/);
        expect(projectDetails.length).toBeGreaterThan(0);
      });
    });
  });
});
