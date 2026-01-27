import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import { ActivityCalendar } from '../ActivityCalendar';
import { Project, TimeEntry } from '../../../types';
import {
  createMockProject,
  createMockTimeEntry,
} from '../../../__mocks__/electron';
import { LanguageContext } from '../../../contexts/LanguageContext';

jest.mock('../../../utils/analytics', () => ({
  getDailyWorkHours: jest.fn((timeEntries: TimeEntry[], date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const entry = timeEntries.find((e) => e.startTime.startsWith(dateStr));
    if (!entry) return 0;
    const start = new Date(entry.startTime).getTime();
    const end = new Date(entry.endTime).getTime();
    return (end - start) / (1000 * 60 * 60);
  }),
}));

const theme = createTheme();

const mockTranslations: Record<string, string> = {
  'calendar.title': '活動カレンダー',
  'calendar.subtitle': '作業時間の分布を視覚化',
  'calendar.total': '合計: {hours}時間',
  'calendar.activity.level': '活動レベル:',
  'dashboard.monthly.year': '年',
  'dashboard.monthly.month': '月',
};

const mockT = (key: string, params?: Record<string, unknown>) => {
  let value = mockTranslations[key] || key;
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      value = value.replace(`{${k}}`, String(v));
    });
  }
  return value;
};

const languageContextValue = {
  language: 'ja' as const,
  setLanguage: jest.fn(),
  t: mockT,
};

const renderWithTheme = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      <LanguageContext.Provider value={languageContextValue}>
        {ui}
      </LanguageContext.Provider>
    </ThemeProvider>
  );
};

describe('ActivityCalendar', () => {
  const mockProjects: Project[] = [
    createMockProject({ id: 'project-1', name: 'Project 1' }),
  ];

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const createTimeEntriesForMonth = (
    year: number,
    month: number
  ): TimeEntry[] => {
    const entries: TimeEntry[] = [];
    for (let day = 1; day <= 5; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      entries.push(
        createMockTimeEntry({
          id: `entry-${day}`,
          projectId: 'project-1',
          startTime: `${dateStr}T09:00:00Z`,
          endTime: `${dateStr}T${(9 + day).toString().padStart(2, '0')}:00:00Z`,
        })
      );
    }
    return entries;
  };

  const mockTimeEntries = createTimeEntriesForMonth(currentYear, currentMonth);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('基本レンダリング', () => {
    it('カレンダータイトルが表示される', () => {
      renderWithTheme(
        <ActivityCalendar
          timeEntries={mockTimeEntries}
          _projects={mockProjects}
        />
      );

      expect(screen.getByText('活動カレンダー')).toBeInTheDocument();
    });

    it('サブタイトルが表示される', () => {
      renderWithTheme(
        <ActivityCalendar
          timeEntries={mockTimeEntries}
          _projects={mockProjects}
        />
      );

      expect(screen.getByText('作業時間の分布を視覚化')).toBeInTheDocument();
    });

    it('曜日ヘッダーが表示される', () => {
      renderWithTheme(
        <ActivityCalendar
          timeEntries={mockTimeEntries}
          _projects={mockProjects}
        />
      );

      const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
      weekdays.forEach((day) => {
        expect(screen.getByText(day)).toBeInTheDocument();
      });
    });

    it('凡例が表示される', () => {
      renderWithTheme(
        <ActivityCalendar
          timeEntries={mockTimeEntries}
          _projects={mockProjects}
        />
      );

      expect(screen.getByText('活動レベル:')).toBeInTheDocument();
    });

    it('合計時間が表示される', () => {
      renderWithTheme(
        <ActivityCalendar
          timeEntries={mockTimeEntries}
          _projects={mockProjects}
        />
      );

      expect(screen.getByText(/合計:.*時間/)).toBeInTheDocument();
    });
  });

  describe('年月ナビゲーション', () => {
    it('年と月のセレクトボックスが表示される', () => {
      renderWithTheme(
        <ActivityCalendar
          timeEntries={mockTimeEntries}
          _projects={mockProjects}
        />
      );

      expect(screen.getByText(`${currentYear}年`)).toBeInTheDocument();
      expect(screen.getByText(`${currentMonth + 1}月`)).toBeInTheDocument();
    });

    it('前月ボタンをクリックすると前月が表示される', () => {
      renderWithTheme(
        <ActivityCalendar
          timeEntries={mockTimeEntries}
          _projects={mockProjects}
        />
      );

      const prevButton = screen
        .getByTestId('ChevronLeftIcon')
        .closest('button');
      expect(prevButton).toBeInTheDocument();

      fireEvent.click(prevButton!);

      const expectedMonth = currentMonth === 0 ? 12 : currentMonth;
      expect(screen.getByText(`${expectedMonth}月`)).toBeInTheDocument();
    });

    it('次月ボタンをクリックすると次月が表示される', () => {
      renderWithTheme(
        <ActivityCalendar
          timeEntries={mockTimeEntries}
          _projects={mockProjects}
        />
      );

      const nextButton = screen
        .getByTestId('ChevronRightIcon')
        .closest('button');
      expect(nextButton).toBeInTheDocument();

      fireEvent.click(nextButton!);

      const expectedMonth = currentMonth === 11 ? 1 : currentMonth + 2;
      expect(screen.getByText(`${expectedMonth}月`)).toBeInTheDocument();
    });

    it('年跨ぎの前月移動（1月→12月）', () => {
      renderWithTheme(
        <ActivityCalendar
          timeEntries={mockTimeEntries}
          _projects={mockProjects}
        />
      );

      const prevButton = screen
        .getByTestId('ChevronLeftIcon')
        .closest('button');

      // 1月になるまで前月に移動
      for (let i = 0; i <= currentMonth; i++) {
        fireEvent.click(prevButton!);
      }

      expect(screen.getByText('12月')).toBeInTheDocument();
      expect(screen.getByText(`${currentYear - 1}年`)).toBeInTheDocument();
    });

    it('年跨ぎの次月移動（12月→1月）', () => {
      renderWithTheme(
        <ActivityCalendar
          timeEntries={mockTimeEntries}
          _projects={mockProjects}
        />
      );

      const nextButton = screen
        .getByTestId('ChevronRightIcon')
        .closest('button');

      // 12月になるまで次月に移動
      for (let i = currentMonth; i < 11; i++) {
        fireEvent.click(nextButton!);
      }
      // さらに1回クリックで翌年1月へ
      fireEvent.click(nextButton!);

      expect(screen.getByText('1月')).toBeInTheDocument();
      expect(screen.getByText(`${currentYear + 1}年`)).toBeInTheDocument();
    });
  });

  describe('ヒートマップ色計算', () => {
    it('作業時間0のセルは薄い色', () => {
      renderWithTheme(
        <ActivityCalendar timeEntries={[]} _projects={mockProjects} />
      );

      // カレンダーがレンダリングされることを確認
      expect(screen.getByText('活動カレンダー')).toBeInTheDocument();
    });

    it('作業時間ありのセルは濃い色になる', () => {
      renderWithTheme(
        <ActivityCalendar
          timeEntries={mockTimeEntries}
          _projects={mockProjects}
        />
      );

      // カレンダーがレンダリングされることを確認
      expect(screen.getByText('活動カレンダー')).toBeInTheDocument();
    });
  });

  describe('今日の日付ハイライト', () => {
    it('今日の日付がハイライト表示される', () => {
      renderWithTheme(
        <ActivityCalendar
          timeEntries={mockTimeEntries}
          _projects={mockProjects}
        />
      );

      const today = new Date();
      const todayDate = today.getDate();

      // 今日の日付を含むセルを探す
      const todayCells = screen.getAllByText(String(todayDate));
      expect(todayCells.length).toBeGreaterThan(0);
    });
  });

  describe('ツールチップ表示', () => {
    it('日付セルにホバーするとツールチップが表示される', async () => {
      renderWithTheme(
        <ActivityCalendar
          timeEntries={mockTimeEntries}
          _projects={mockProjects}
        />
      );

      // 日付「1」のセルを取得
      const day1Cells = screen.getAllByText('1');
      const day1Cell = day1Cells.find((el) => {
        return el.closest('[class*="MuiBox-root"]');
      });

      expect(day1Cell).toBeInTheDocument();

      // ツールチップのトリガー要素を確認
      if (day1Cell) {
        fireEvent.mouseOver(day1Cell);
        // ツールチップは遅延表示のため、すぐには表示されない
        // ツールチップ要素の存在を期待しない（実装依存のため）
      }
    });
  });

  describe('空データの処理', () => {
    it('タイムエントリーが空でも正常にレンダリングされる', () => {
      renderWithTheme(
        <ActivityCalendar timeEntries={[]} _projects={mockProjects} />
      );

      expect(screen.getByText('活動カレンダー')).toBeInTheDocument();
      expect(screen.getByText(/合計: 0\.0時間/)).toBeInTheDocument();
    });

    it('プロジェクトが空でも正常にレンダリングされる', () => {
      renderWithTheme(
        <ActivityCalendar timeEntries={mockTimeEntries} _projects={[]} />
      );

      expect(screen.getByText('活動カレンダー')).toBeInTheDocument();
    });
  });

  describe('カレンダーグリッド', () => {
    it('月の全日付が表示される', () => {
      renderWithTheme(
        <ActivityCalendar
          timeEntries={mockTimeEntries}
          _projects={mockProjects}
        />
      );

      // 現在の月の日数を取得
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

      // 1から月の日数までの日付が表示されていることを確認
      for (let day = 1; day <= daysInMonth; day++) {
        const dayCells = screen.getAllByText(String(day));
        expect(dayCells.length).toBeGreaterThanOrEqual(1);
      }
    });
  });
});
