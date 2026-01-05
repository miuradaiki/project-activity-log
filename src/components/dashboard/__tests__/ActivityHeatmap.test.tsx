import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import { ActivityHeatmap } from '../ActivityHeatmap';
import { createMockTimeEntry } from '../../../__mocks__/electron';
import { TimeEntry } from '../../../types';
import { LanguageContext } from '../../../contexts/LanguageContext';
import { HeatmapWeek, HeatmapDay } from '../../../utils/analytics/heatmap';

// framer-motion のモック
jest.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      ...props
    }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

// heatmap utils のモック
const mockHeatmapData: HeatmapWeek[] = [
  {
    days: [
      { date: new Date(2026, 0, 5), hours: 0, level: 0 },
      { date: new Date(2026, 0, 6), hours: 2.5, level: 2 },
      { date: new Date(2026, 0, 7), hours: 5, level: 3 },
      { date: new Date(2026, 0, 8), hours: 0, level: 0 },
      { date: new Date(2026, 0, 9), hours: 1.5, level: 1 },
      { date: new Date(2026, 0, 10), hours: 8, level: 4 },
      { date: new Date(2026, 0, 11), hours: 0, level: 0 },
    ] as HeatmapDay[],
  },
  {
    days: [
      { date: new Date(2026, 0, 12), hours: 3, level: 2 },
      { date: new Date(2026, 0, 13), hours: 0, level: 0 },
      null,
      null,
      null,
      null,
      null,
    ],
  },
];

jest.mock('../../../utils/analytics/heatmap', () => ({
  generateHeatmapData: jest.fn(() => mockHeatmapData),
  getRolling12MonthRange: jest.fn(() => ({
    start: new Date(2025, 0, 6),
    end: new Date(2026, 0, 5),
  })),
  calculateHeatmapLevel: jest.fn((hours: number) => {
    if (hours === 0) return 0;
    if (hours < 2) return 1;
    if (hours < 4) return 2;
    if (hours < 6) return 3;
    return 4;
  }),
}));

// GlassCard のモック
jest.mock('../../ui/modern/StyledComponents', () => ({
  GlassCard: ({ children, sx }: { children: React.ReactNode; sx?: object }) => (
    <div data-testid="glass-card" style={sx as React.CSSProperties}>
      {children}
    </div>
  ),
}));

const theme = createTheme();

const mockTranslations: Record<string, string> = {
  'dashboard.heatmap.title': '活動ヒートマップ',
  'dashboard.heatmap.less': '少',
  'dashboard.heatmap.more': '多',
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

describe('ActivityHeatmap', () => {
  const mockTimeEntries: TimeEntry[] = [
    createMockTimeEntry({
      id: 'entry-1',
      projectId: 'project-1',
      startTime: '2026-01-06T09:00:00Z',
      endTime: '2026-01-06T11:30:00Z',
    }),
    createMockTimeEntry({
      id: 'entry-2',
      projectId: 'project-1',
      startTime: '2026-01-07T09:00:00Z',
      endTime: '2026-01-07T14:00:00Z',
    }),
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('基本レンダリング', () => {
    it('タイトルが表示される', () => {
      renderWithProviders(<ActivityHeatmap timeEntries={mockTimeEntries} />);

      expect(screen.getByText('活動ヒートマップ')).toBeInTheDocument();
    });

    it('GlassCardでラップされる', () => {
      renderWithProviders(<ActivityHeatmap timeEntries={mockTimeEntries} />);

      expect(screen.getByTestId('glass-card')).toBeInTheDocument();
    });

    it('凡例が表示される', () => {
      renderWithProviders(<ActivityHeatmap timeEntries={mockTimeEntries} />);

      expect(screen.getByText('少')).toBeInTheDocument();
      expect(screen.getByText('多')).toBeInTheDocument();
    });
  });

  describe('ヒートマップセル', () => {
    it('ヒートマップセルが表示される', () => {
      renderWithProviders(<ActivityHeatmap timeEntries={mockTimeEntries} />);

      // aria-label を持つセルを探す
      const cells = screen
        .getAllByRole('generic')
        .filter(
          (el) =>
            el.getAttribute('aria-label')?.includes('時間') ||
            el.getAttribute('aria-label')?.includes('hours')
        );

      expect(cells.length).toBeGreaterThan(0);
    });
  });

  describe('曜日ラベル', () => {
    it('日本語モードで曜日ラベルが表示される', () => {
      renderWithProviders(<ActivityHeatmap timeEntries={mockTimeEntries} />);

      expect(screen.getByText('月')).toBeInTheDocument();
      expect(screen.getByText('水')).toBeInTheDocument();
      expect(screen.getByText('金')).toBeInTheDocument();
    });

    it('英語モードで曜日ラベルが表示される', () => {
      renderWithProviders(
        <ActivityHeatmap timeEntries={mockTimeEntries} />,
        'en'
      );

      expect(screen.getByText('Mon')).toBeInTheDocument();
      expect(screen.getByText('Wed')).toBeInTheDocument();
      expect(screen.getByText('Fri')).toBeInTheDocument();
    });
  });

  describe('クリックイベント', () => {
    it('onDayClickが渡された場合、クリックでコールバックが呼ばれる', () => {
      const mockOnDayClick = jest.fn();

      renderWithProviders(
        <ActivityHeatmap
          timeEntries={mockTimeEntries}
          onDayClick={mockOnDayClick}
        />
      );

      // クリック可能なセルを探してクリック
      const cells = screen
        .getAllByRole('generic')
        .filter((el) => el.getAttribute('aria-label')?.includes('時間'));

      if (cells.length > 0) {
        fireEvent.click(cells[0]);
        expect(mockOnDayClick).toHaveBeenCalled();
      }
    });
  });

  describe('空データの処理', () => {
    it('タイムエントリーが空でもエラーなくレンダリングされる', () => {
      renderWithProviders(<ActivityHeatmap timeEntries={[]} />);

      expect(screen.getByText('活動ヒートマップ')).toBeInTheDocument();
    });
  });

  describe('月ラベル', () => {
    it('月ラベルが表示される', () => {
      renderWithProviders(<ActivityHeatmap timeEntries={mockTimeEntries} />);

      // 月ラベル（1月など）が表示されていることを確認
      // モックデータに基づいて1月のラベルが存在するはず
      const monthLabels = screen.getAllByText(/月/);
      expect(monthLabels.length).toBeGreaterThan(0);
    });
  });
});
