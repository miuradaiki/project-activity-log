import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { ReportsView } from '../ReportsView';
import { renderWithGraphite } from '../../../test-helpers/render-with-graphite';
import { Project } from '../../../types';

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
});
