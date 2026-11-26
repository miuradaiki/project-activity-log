import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { ThemeProvider } from '@mui/material';
import { Sidebar, DRAWER_WIDTH } from '../Sidebar';
import { LanguageProvider } from '../../../../contexts/LanguageContext';
import { modernDarkTheme } from '../../../../styles/modernTheme';
import { Project } from '../../../../types';

const project: Project = {
  id: 'p1',
  name: 'EC開発',
  description: '',
  monthlyCapacity: 0.4,
  isArchived: false,
  createdAt: '',
  updatedAt: '',
};

const overview = {
  actualHours: 97.4,
  totalHours: 101.9,
  targetHours: 126,
  ratio: 97.4 / 126,
  remainingWorkingDays: 3,
  requiredDailyHours: 9.5,
};

const renderSidebar = (props: Partial<React.ComponentProps<typeof Sidebar>>) =>
  render(
    <ThemeProvider theme={modernDarkTheme}>
      <LanguageProvider>
        <Sidebar
          activePage="timer"
          onNavigate={jest.fn()}
          monthOverview={overview}
          activeProject={null}
          elapsedMs={0}
          onStopTimer={jest.fn()}
          mobileOpen={false}
          onMobileClose={jest.fn()}
          {...props}
        />
      </LanguageProvider>
    </ThemeProvider>
  );

describe('Sidebar', () => {
  beforeAll(() => {
    Object.defineProperty(window.navigator, 'language', {
      value: 'ja-JP',
      configurable: true,
    });
  });

  it('幅は 216px', () => {
    expect(DRAWER_WIDTH).toBe(216);
  });

  it('今日・プロジェクト・レポート・設定の順に遷移でき、それぞれのページを指定する', () => {
    const onNavigate = jest.fn();
    renderSidebar({ onNavigate });

    const nav = screen.getByRole('navigation');
    const items = within(nav).getAllByRole('button');
    expect(items.map((b) => b.textContent)).toEqual([
      '今日',
      'プロジェクト',
      'レポート',
      '設定',
    ]);
    items.forEach((b) => fireEvent.click(b));
    expect(onNavigate.mock.calls.map((c) => c[0])).toEqual([
      'timer',
      'projects',
      'dashboard',
      'settings',
    ]);
  });

  it('現在のページに aria-current を付ける', () => {
    renderSidebar({ activePage: 'projects' });

    expect(
      screen.getByRole('button', { name: 'プロジェクト' })
    ).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: '今日' })).not.toHaveAttribute(
      'aria-current'
    );
  });

  it('今月の進捗を 実績 / 目標 と割合で表示する', () => {
    renderSidebar({});

    expect(screen.getByText('97.4 / 126h · 77%')).toBeInTheDocument();
  });

  it('計測していないときは計測中の表示を出さない', () => {
    renderSidebar({});

    expect(
      screen.queryByRole('button', { name: 'タイマーを停止' })
    ).not.toBeInTheDocument();
  });

  it('計測中はプロジェクト名と経過時間を表示し、停止できる', () => {
    const onStopTimer = jest.fn();
    renderSidebar({
      activeProject: project,
      elapsedMs: (3600 + 24 * 60) * 1000,
      onStopTimer,
    });

    expect(screen.getByText('EC開発')).toBeInTheDocument();
    expect(screen.getByText('1:24')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'タイマーを停止' }));
    expect(onStopTimer).toHaveBeenCalledTimes(1);
  });
});
