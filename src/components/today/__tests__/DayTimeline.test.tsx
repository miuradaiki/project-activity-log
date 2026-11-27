import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithGraphite } from '../../../test-helpers/render-with-graphite';
import { DayTimeline } from '../DayTimeline';

describe('DayTimeline', () => {
  it('両端を除く毎時に区切り線を引き、3時間ごとの線を強調する', () => {
    renderWithGraphite(<DayTimeline segments={[]} nowPosition={null} />);

    const lines = screen.getAllByTestId('timeline-hour-line');
    // 6:00〜21:00 の帯なので、7時〜20時の14本
    expect(lines.map((l) => l.dataset.hour)).toEqual(
      Array.from({ length: 14 }, (_, i) => String(7 + i))
    );
    expect(
      lines.filter((l) => l.dataset.major === 'true').map((l) => l.dataset.hour)
    ).toEqual(['9', '12', '15', '18']);
  });

  it('区切り線は時刻に対応する位置に置く', () => {
    renderWithGraphite(<DayTimeline segments={[]} nowPosition={null} />);

    const nine = screen
      .getAllByTestId('timeline-hour-line')
      .find((l) => l.dataset.hour === '9');
    expect(nine).toHaveStyle({ left: '20%' });
  });
});
