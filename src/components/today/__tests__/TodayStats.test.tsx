import React from 'react';
import { screen } from '@testing-library/react';
import { TodayStats } from '../TodayStats';
import { renderWithGraphite } from '../../../test-helpers/render-with-graphite';

describe('TodayStats', () => {
  it('今日の合計を h:mm、今月の進捗を%、必要ペースを h/日 で表示する', () => {
    renderWithGraphite(
      <TodayStats
        todayHours={[
          { projectId: 'a', ms: 2.5 * 3600_000 },
          { projectId: 'b', ms: 2.7 * 3600_000 },
        ]}
        monthOverview={{
          actualHours: 97.4,
          totalHours: 101.9,
          targetHours: 126,
          ratio: 97.4 / 126,
          remainingWorkingDays: 3,
          requiredDailyHours: 9.5,
        }}
      />
    );

    expect(screen.getByText('5:12')).toBeInTheDocument();
    expect(screen.getByText('77')).toBeInTheDocument();
    expect(screen.getByText('9.5')).toBeInTheDocument();
  });
});
