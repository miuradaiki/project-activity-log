import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import { MonthlyProgressSummary } from '../MonthlyProgressSummary';
import { LanguageContext } from '../../../contexts/LanguageContext';
import { SettingsProvider } from '../../../contexts/SettingsContext';
import { Project, TimeEntry } from '../../../types';
import {
  createMockProject,
  createMockTimeEntry,
} from '../../../__mocks__/electron';
import * as analytics from '../../../utils/analytics';

jest.mock('../../../utils/analytics', () => ({
  getDailyWorkHours: jest.fn(() => 0),
  calculateTotalMonthlyTarget: jest.fn(() => 100),
  calculateRemainingWorkingDays: jest.fn(() => 10),
}));

const theme = createTheme();

const renderWithProviders = (
  ui: React.ReactElement,
  options: { language?: 'ja' | 'en' } = {}
) => {
  const { language = 'ja' } = options;

  const mockT = (key: string) => {
    const translations: Record<string, string> = {
      'dashboard.monthly.summary.title':
        language === 'ja' ? '月間サマリー' : 'Monthly Summary',
      'dashboard.monthly.summary.worked':
        language === 'ja' ? '作業時間' : 'Worked',
      'dashboard.monthly.summary.target': language === 'ja' ? '目標' : 'Target',
      'dashboard.monthly.summary.remaining.days':
        language === 'ja' ? '残り営業日' : 'Remaining Days',
      'dashboard.monthly.summary.required.pace':
        language === 'ja' ? '必要ペース' : 'Required Pace',
      'dashboard.monthly.summary.per.day': language === 'ja' ? '/日' : '/day',
      'units.days': language === 'ja' ? '日' : 'days',
    };
    return translations[key] || key;
  };

  const languageValue = {
    language,
    setLanguage: jest.fn(),
    t: mockT,
  };

  return render(
    <ThemeProvider theme={theme}>
      <LanguageContext.Provider value={languageValue}>
        <SettingsProvider>{ui}</SettingsProvider>
      </LanguageContext.Provider>
    </ThemeProvider>
  );
};

describe('MonthlyProgressSummary', () => {
  const mockProjects: Project[] = [
    createMockProject({
      id: 'project-1',
      name: 'Project 1',
      monthlyCapacity: 0.5,
    }),
    createMockProject({
      id: 'project-2',
      name: 'Project 2',
      monthlyCapacity: 0.3,
    }),
  ];

  const mockTimeEntries: TimeEntry[] = [
    createMockTimeEntry({ id: 'entry-1', projectId: 'project-1' }),
    createMockTimeEntry({ id: 'entry-2', projectId: 'project-2' }),
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('基本レンダリング', () => {
    it('タイトルが表示される', () => {
      renderWithProviders(
        <MonthlyProgressSummary
          projects={mockProjects}
          timeEntries={mockTimeEntries}
        />
      );

      expect(screen.getByText('月間サマリー')).toBeInTheDocument();
    });

    it('進捗率が表示される', () => {
      renderWithProviders(
        <MonthlyProgressSummary
          projects={mockProjects}
          timeEntries={mockTimeEntries}
        />
      );

      expect(screen.getByText('%')).toBeInTheDocument();
    });

    it('作業時間/目標時間の見出しが表示される', () => {
      renderWithProviders(
        <MonthlyProgressSummary
          projects={mockProjects}
          timeEntries={mockTimeEntries}
        />
      );

      expect(screen.getByText(/作業時間/)).toBeInTheDocument();
      expect(screen.getByText(/目標/)).toBeInTheDocument();
    });

    it('残り営業日が表示される', () => {
      renderWithProviders(
        <MonthlyProgressSummary
          projects={mockProjects}
          timeEntries={mockTimeEntries}
        />
      );

      expect(screen.getByText('残り営業日')).toBeInTheDocument();
      // 残り営業日の値と単位が表示されることを確認
      const headings = screen.getAllByRole('heading', { level: 6 });
      const remainingDaysHeading = headings.find((h) =>
        h.textContent?.includes('10')
      );
      expect(remainingDaysHeading).toBeInTheDocument();
    });

    it('必要ペースが表示される', () => {
      renderWithProviders(
        <MonthlyProgressSummary
          projects={mockProjects}
          timeEntries={mockTimeEntries}
        />
      );

      expect(screen.getByText('必要ペース')).toBeInTheDocument();
    });
  });

  describe('進捗率計算', () => {
    it('進捗0%で正常表示', () => {
      (analytics.calculateTotalMonthlyTarget as jest.Mock).mockReturnValue(100);
      (analytics.getDailyWorkHours as jest.Mock).mockReturnValue(0);

      renderWithProviders(
        <MonthlyProgressSummary projects={mockProjects} timeEntries={[]} />
      );

      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('目標時間0の場合、進捗率は0%', () => {
      (analytics.calculateTotalMonthlyTarget as jest.Mock).mockReturnValue(0);

      renderWithProviders(
        <MonthlyProgressSummary
          projects={mockProjects}
          timeEntries={mockTimeEntries}
        />
      );

      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  describe('残り営業日・必要ペース計算', () => {
    it('残り営業日が0の場合、必要ペースは0', () => {
      (analytics.calculateRemainingWorkingDays as jest.Mock).mockReturnValue(0);
      (analytics.calculateTotalMonthlyTarget as jest.Mock).mockReturnValue(100);

      renderWithProviders(
        <MonthlyProgressSummary projects={mockProjects} timeEntries={[]} />
      );

      expect(screen.getByText(/0h\/日/)).toBeInTheDocument();
    });

    it('残り作業時間がある場合、必要ペースが計算される', () => {
      (analytics.calculateRemainingWorkingDays as jest.Mock).mockReturnValue(
        10
      );
      (analytics.calculateTotalMonthlyTarget as jest.Mock).mockReturnValue(100);

      renderWithProviders(
        <MonthlyProgressSummary projects={mockProjects} timeEntries={[]} />
      );

      expect(screen.getByText(/10h\/日/)).toBeInTheDocument();
    });
  });

  describe('日本語/英語対応', () => {
    it('日本語表示', () => {
      renderWithProviders(
        <MonthlyProgressSummary
          projects={mockProjects}
          timeEntries={mockTimeEntries}
        />,
        { language: 'ja' }
      );

      expect(screen.getByText('月間サマリー')).toBeInTheDocument();
      expect(screen.getByText('残り営業日')).toBeInTheDocument();
    });

    it('英語表示', () => {
      renderWithProviders(
        <MonthlyProgressSummary
          projects={mockProjects}
          timeEntries={mockTimeEntries}
        />,
        { language: 'en' }
      );

      expect(screen.getByText('Monthly Summary')).toBeInTheDocument();
    });
  });

  describe('空データの処理', () => {
    it('プロジェクトが空でも正常にレンダリングされる', () => {
      renderWithProviders(
        <MonthlyProgressSummary projects={[]} timeEntries={[]} />
      );

      expect(screen.getByText('月間サマリー')).toBeInTheDocument();
    });

    it('タイムエントリーが空でも正常にレンダリングされる', () => {
      renderWithProviders(
        <MonthlyProgressSummary projects={mockProjects} timeEntries={[]} />
      );

      expect(screen.getByText('月間サマリー')).toBeInTheDocument();
    });
  });
});
