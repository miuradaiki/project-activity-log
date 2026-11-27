import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { ReportsView } from '../ReportsView';
import { renderWithGraphite } from '../../../test-helpers/render-with-graphite';
import { Project, TimeEntry } from '../../../types';

const projects: Project[] = [
  {
    id: 'ec',
    name: 'EC開発',
    description: '',
    monthlyCapacity: 0.4,
    isArchived: false,
    createdAt: '',
    updatedAt: '',
  },
];

describe('ReportsView', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 10, 26, 12));
  });
  afterAll(() => jest.useRealTimers());

  it('当月を表示し、前の月へ移動できる', () => {
    renderWithGraphite(
      <ReportsView
        projects={projects}
        timeEntries={[]}
        baseMonthlyHours={140}
      />
    );

    expect(screen.getByText('2026年11月')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '前の月へ' }));
    expect(screen.getByText('2026年10月')).toBeInTheDocument();
  });

  it('当月より先には進めない', () => {
    renderWithGraphite(
      <ReportsView
        projects={projects}
        timeEntries={[]}
        baseMonthlyHours={140}
      />
    );

    expect(screen.getByRole('button', { name: '次の月へ' })).toBeDisabled();
  });

  it('活動ヒートマップは表示しない', () => {
    renderWithGraphite(
      <ReportsView
        projects={projects}
        timeEntries={[]}
        baseMonthlyHours={140}
      />
    );

    expect(screen.queryByText('活動ヒートマップ')).not.toBeInTheDocument();
  });

  describe('月の稼働', () => {
    const p = (id: string, name: string, monthlyCapacity: number): Project => ({
      id,
      name,
      description: '',
      monthlyCapacity,
      isArchived: false,
      createdAt: '',
      updatedAt: '',
    });
    const entry = (
      projectId: string,
      day: number,
      hours: number
    ): TimeEntry => {
      const s = new Date(2026, 10, day, 9);
      return {
        id: `${projectId}-${day}`,
        projectId,
        startTime: s.toISOString(),
        endTime: new Date(s.getTime() + hours * 3600_000).toISOString(),
        description: '',
        createdAt: '',
        updatedAt: '',
      };
    };
    // 基準 100h → A 40% = 40h、B 10% = 10h
    const render = () =>
      renderWithGraphite(
        <ReportsView
          projects={[
            p('a', '案件A', 0.4),
            p('b', '案件B', 0.1),
            p('t', '社内対応', 0),
          ]}
          timeEntries={[entry('a', 2, 10), entry('b', 3, 12), entry('t', 4, 3)]}
          baseMonthlyHours={100}
        />
      );

    it('配分のある合計と、超過・90%以上の件数、追跡のみの時間を表示する', () => {
      render();

      expect(screen.getByText('/ 50h · 44%')).toBeInTheDocument();
      expect(
        screen.getByText('超過 1件 · 90%以上 0件 · 追跡のみ 3h')
      ).toBeInTheDocument();
    });

    it('プロジェクトは割合の高い順に並べ、追跡のみは最後に同じ形の行で出す', () => {
      render();

      const names = screen
        .getAllByTestId('report-project-row')
        .map((row) => row.getAttribute('data-name'));
      expect(names).toEqual(['案件B', '案件A', '社内対応']);
      expect(screen.getByText('12 / 10h')).toBeInTheDocument();
      expect(screen.getByText('120%')).toBeInTheDocument();
    });

    it('残り営業日と必要ペースは表示しない', () => {
      render();

      expect(screen.queryByText('残り営業日')).not.toBeInTheDocument();
      expect(screen.queryByText('必要ペース')).not.toBeInTheDocument();
    });
  });

  it('週ごとのグラフは、平日の少ない週も5日分の枠を取り、棒の幅をそろえる', () => {
    renderWithGraphite(
      <ReportsView
        projects={projects}
        timeEntries={[]}
        baseMonthlyHours={140}
      />
    );

    // 2026年11月は 11/2〜11/30 の5週（最終週は 11/30 の1日だけ）
    expect(screen.getAllByTestId('report-day-slot')).toHaveLength(25);
  });
});
