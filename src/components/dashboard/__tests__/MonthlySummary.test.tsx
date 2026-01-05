import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import { MonthlySummary } from '../MonthlySummary';
import {
  createMockProject,
  createMockTimeEntry,
} from '../../../__mocks__/electron';
import { Project, TimeEntry } from '../../../types';
import { LanguageContext } from '../../../contexts/LanguageContext';

// Recharts のモック
jest.mock('recharts', () => ({
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  Line: () => <div data-testid="line" />,
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
  Pie: ({ data }: { data: Array<{ name: string; value: number }> }) => (
    <div data-testid="pie">
      {data?.map((item, index) => (
        <span key={index} data-testid={`pie-data-${index}`}>
          {item.name}: {item.value}
        </span>
      ))}
    </div>
  ),
  Cell: () => <div data-testid="cell" />,
  Legend: () => <div data-testid="legend" />,
}));

// colorUtils のモック
jest.mock('../../../utils/colorUtils', () => ({
  projectColorManager: {
    getColorByName: () => '#0088FE',
    getColorById: () => '#0088FE',
    initializeColors: jest.fn(),
  },
}));

const theme = createTheme();

const mockTranslations: Record<string, string> = {
  'dashboard.monthly.title': '月間サマリー',
  'dashboard.monthly.total': '合計',
  'units.hours': '時間',
  'timer.title': '作業時間',
};

const renderWithProviders = (
  ui: React.ReactElement,
  language: 'ja' | 'en' = 'ja'
) => {
  const languageContextValue = {
    language,
    setLanguage: jest.fn(),
    t: (key: string) => mockTranslations[key] || key,
  };

  return render(
    <ThemeProvider theme={theme}>
      <LanguageContext.Provider value={languageContextValue}>
        {ui}
      </LanguageContext.Provider>
    </ThemeProvider>
  );
};

describe('MonthlySummary', () => {
  const mockProjects: Project[] = [
    createMockProject({ id: 'project-1', name: 'Project A' }),
    createMockProject({ id: 'project-2', name: 'Project B' }),
  ];

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const mockTimeEntries: TimeEntry[] = [
    createMockTimeEntry({
      id: 'entry-1',
      projectId: 'project-1',
      startTime: new Date(currentYear, currentMonth, 5, 9, 0).toISOString(),
      endTime: new Date(currentYear, currentMonth, 5, 11, 0).toISOString(),
    }),
    createMockTimeEntry({
      id: 'entry-2',
      projectId: 'project-2',
      startTime: new Date(currentYear, currentMonth, 10, 14, 0).toISOString(),
      endTime: new Date(currentYear, currentMonth, 10, 17, 0).toISOString(),
    }),
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('基本レンダリング', () => {
    it('タイトルが表示される', () => {
      renderWithProviders(
        <MonthlySummary projects={mockProjects} timeEntries={mockTimeEntries} />
      );

      expect(screen.getByText('月間サマリー')).toBeInTheDocument();
    });

    it('合計時間が表示される', () => {
      renderWithProviders(
        <MonthlySummary projects={mockProjects} timeEntries={mockTimeEntries} />
      );

      expect(screen.getByText(/合計:/)).toBeInTheDocument();
    });

    it('タブが表示される', () => {
      renderWithProviders(
        <MonthlySummary projects={mockProjects} timeEntries={mockTimeEntries} />
      );

      expect(
        screen.getByRole('tab', { name: /プロジェクト分布/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('tab', { name: /週別推移/i })
      ).toBeInTheDocument();
    });
  });

  describe('年月セレクター', () => {
    it('年セレクターが表示される', () => {
      renderWithProviders(
        <MonthlySummary projects={mockProjects} timeEntries={mockTimeEntries} />
      );

      // 2つのセレクター（年・月）が表示されることを確認
      const comboboxes = screen.getAllByRole('combobox');
      expect(comboboxes.length).toBeGreaterThanOrEqual(2);

      // 現在の年が表示されていることを確認（"2026年"という形式）
      expect(screen.getByText(`${currentYear}年`)).toBeInTheDocument();
    });

    it('月セレクターが表示される', () => {
      renderWithProviders(
        <MonthlySummary projects={mockProjects} timeEntries={mockTimeEntries} />
      );

      // 月のセレクターが存在することを確認
      const comboboxes = screen.getAllByRole('combobox');
      expect(comboboxes.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('タブ切り替え', () => {
    it('デフォルトでプロジェクト分布タブが選択される', () => {
      renderWithProviders(
        <MonthlySummary projects={mockProjects} timeEntries={mockTimeEntries} />
      );

      const projectsTab = screen.getByRole('tab', {
        name: /プロジェクト分布/i,
      });
      expect(projectsTab).toHaveAttribute('aria-selected', 'true');
    });

    it('週別推移タブをクリックすると切り替わる', () => {
      renderWithProviders(
        <MonthlySummary projects={mockProjects} timeEntries={mockTimeEntries} />
      );

      const weeklyTab = screen.getByRole('tab', { name: /週別推移/i });
      fireEvent.click(weeklyTab);

      expect(weeklyTab).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('グラフ表示', () => {
    it('プロジェクト分布タブで円グラフが表示される', () => {
      renderWithProviders(
        <MonthlySummary projects={mockProjects} timeEntries={mockTimeEntries} />
      );

      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    });

    it('週別推移タブで折れ線グラフが表示される', () => {
      renderWithProviders(
        <MonthlySummary projects={mockProjects} timeEntries={mockTimeEntries} />
      );

      const weeklyTab = screen.getByRole('tab', { name: /週別推移/i });
      fireEvent.click(weeklyTab);

      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
  });

  describe('空データの処理', () => {
    it('データがない場合にメッセージが表示される（プロジェクト分布）', () => {
      renderWithProviders(<MonthlySummary projects={[]} timeEntries={[]} />);

      expect(
        screen.getByText(/この月のプロジェクトデータがありません/)
      ).toBeInTheDocument();
    });

    it('週別推移タブに切り替え可能', () => {
      renderWithProviders(
        <MonthlySummary projects={mockProjects} timeEntries={[]} />
      );

      const weeklyTab = screen.getByRole('tab', { name: /週別推移/i });
      fireEvent.click(weeklyTab);

      // タブが選択状態になることを確認
      expect(weeklyTab).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('英語表示', () => {
    it('英語モードで正しいラベルが表示される', () => {
      const languageContextValue = {
        language: 'en' as const,
        setLanguage: jest.fn(),
        t: (key: string) => mockTranslations[key] || key,
      };

      render(
        <ThemeProvider theme={theme}>
          <LanguageContext.Provider value={languageContextValue}>
            <MonthlySummary
              projects={mockProjects}
              timeEntries={mockTimeEntries}
            />
          </LanguageContext.Provider>
        </ThemeProvider>
      );

      expect(
        screen.getByRole('tab', { name: /Project Distribution/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('tab', { name: /Weekly Trend/i })
      ).toBeInTheDocument();
    });
  });
});
