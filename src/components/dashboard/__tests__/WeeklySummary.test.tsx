import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import { WeeklySummary } from '../WeeklySummary';
import {
  createMockProject,
  createMockTimeEntry,
} from '../../../__mocks__/electron';
import { Project, TimeEntry } from '../../../types';
import { LanguageContext } from '../../../contexts/LanguageContext';

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
  'dashboard.weekly.title': '週間サマリー',
  'dashboard.weekly.byproject': 'プロジェクト別',
  'dashboard.daily.total': '合計',
  'units.hours': '時間',
  'time.this.week': '今週',
  'timer.no.entries': 'エントリーがありません',
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

describe('WeeklySummary', () => {
  const mockProjects: Project[] = [
    createMockProject({
      id: 'project-1',
      name: 'Project A',
      isArchived: false,
    }),
    createMockProject({
      id: 'project-2',
      name: 'Project B',
      isArchived: false,
    }),
  ];

  // 今週のデータを作成
  const getStartOfWeek = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const day = now.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    return monday;
  };

  const startOfWeek = getStartOfWeek();

  const mockTimeEntries: TimeEntry[] = [
    createMockTimeEntry({
      id: 'entry-1',
      projectId: 'project-1',
      startTime: new Date(
        startOfWeek.getTime() + 9 * 60 * 60 * 1000
      ).toISOString(),
      endTime: new Date(
        startOfWeek.getTime() + 11 * 60 * 60 * 1000
      ).toISOString(),
    }),
    createMockTimeEntry({
      id: 'entry-2',
      projectId: 'project-2',
      startTime: new Date(
        startOfWeek.getTime() + 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000
      ).toISOString(),
      endTime: new Date(
        startOfWeek.getTime() + 24 * 60 * 60 * 1000 + 17 * 60 * 60 * 1000
      ).toISOString(),
    }),
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('基本レンダリング', () => {
    it('タイトルが表示される', () => {
      renderWithProviders(
        <WeeklySummary projects={mockProjects} timeEntries={mockTimeEntries} />
      );

      expect(screen.getByText('週間サマリー')).toBeInTheDocument();
    });

    it('今週ボタンが表示される', () => {
      renderWithProviders(
        <WeeklySummary projects={mockProjects} timeEntries={mockTimeEntries} />
      );

      expect(screen.getByRole('button', { name: /今週/i })).toBeInTheDocument();
    });

    it('週移動ボタンが表示される', () => {
      renderWithProviders(
        <WeeklySummary projects={mockProjects} timeEntries={mockTimeEntries} />
      );

      expect(screen.getByTestId('ChevronLeftIcon')).toBeInTheDocument();
      expect(screen.getByTestId('ChevronRightIcon')).toBeInTheDocument();
    });

    it('プロジェクト別サブタイトルが表示される', () => {
      renderWithProviders(
        <WeeklySummary projects={mockProjects} timeEntries={mockTimeEntries} />
      );

      expect(screen.getByText('プロジェクト別')).toBeInTheDocument();
    });
  });

  describe('週移動機能', () => {
    it('左矢印クリックで前週に移動', () => {
      renderWithProviders(
        <WeeklySummary projects={mockProjects} timeEntries={mockTimeEntries} />
      );

      const prevButton = screen
        .getByTestId('ChevronLeftIcon')
        .closest('button')!;
      const initialDateText = screen.getByText(/〜/).textContent;

      fireEvent.click(prevButton);

      const newDateText = screen.getByText(/〜/).textContent;
      expect(newDateText).not.toBe(initialDateText);
    });

    it('右矢印クリックで翌週に移動', () => {
      renderWithProviders(
        <WeeklySummary projects={mockProjects} timeEntries={mockTimeEntries} />
      );

      // まず前週に移動
      const prevButton = screen
        .getByTestId('ChevronLeftIcon')
        .closest('button')!;
      fireEvent.click(prevButton);

      const dateAfterPrev = screen.getByText(/〜/).textContent;

      // 翌週に移動
      const nextButton = screen
        .getByTestId('ChevronRightIcon')
        .closest('button')!;
      fireEvent.click(nextButton);

      const dateAfterNext = screen.getByText(/〜/).textContent;
      expect(dateAfterNext).not.toBe(dateAfterPrev);
    });

    it('今週ボタンクリックで今週に戻る', () => {
      renderWithProviders(
        <WeeklySummary projects={mockProjects} timeEntries={mockTimeEntries} />
      );

      const initialDateText = screen.getByText(/〜/).textContent;

      // 前週に移動
      const prevButton = screen
        .getByTestId('ChevronLeftIcon')
        .closest('button')!;
      fireEvent.click(prevButton);
      fireEvent.click(prevButton);

      // 今週に戻る
      const thisWeekButton = screen.getByRole('button', { name: /今週/i });
      fireEvent.click(thisWeekButton);

      const currentDateText = screen.getByText(/〜/).textContent;
      expect(currentDateText).toBe(initialDateText);
    });
  });

  describe('グラフ表示', () => {
    it('棒グラフが表示される', () => {
      renderWithProviders(
        <WeeklySummary projects={mockProjects} timeEntries={mockTimeEntries} />
      );

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('円グラフが表示される', () => {
      renderWithProviders(
        <WeeklySummary projects={mockProjects} timeEntries={mockTimeEntries} />
      );

      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    });

    it('アーカイブされていないプロジェクトのバーが表示される', () => {
      renderWithProviders(
        <WeeklySummary projects={mockProjects} timeEntries={mockTimeEntries} />
      );

      expect(screen.getByTestId('bar-Project A')).toBeInTheDocument();
      expect(screen.getByTestId('bar-Project B')).toBeInTheDocument();
    });
  });

  describe('空データの処理', () => {
    it('エントリーがない場合にメッセージが表示される', () => {
      renderWithProviders(
        <WeeklySummary projects={mockProjects} timeEntries={[]} />
      );

      expect(screen.getByText('エントリーがありません')).toBeInTheDocument();
    });
  });

  describe('英語表示', () => {
    it('英語モードで週の日付形式が変わる', () => {
      const languageContextValue = {
        language: 'en' as const,
        setLanguage: jest.fn(),
        t: (key: string) => mockTranslations[key] || key,
      };

      render(
        <ThemeProvider theme={theme}>
          <LanguageContext.Provider value={languageContextValue}>
            <WeeklySummary
              projects={mockProjects}
              timeEntries={mockTimeEntries}
            />
          </LanguageContext.Provider>
        </ThemeProvider>
      );

      // 英語形式の日付（例: "Jan 6, 2026 - Jan 12, 2026"）が含まれていることを確認
      // 月の短縮名（Jan, Feb, Mar など）と年を含む形式
      const dateElement = screen.getByText(
        /[A-Z][a-z]{2}\s+\d{1,2},\s+\d{4}\s+-\s+[A-Z][a-z]{2}\s+\d{1,2},\s+\d{4}/
      );
      expect(dateElement).toBeInTheDocument();
    });
  });
});
