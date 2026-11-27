import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { NowCard } from '../NowCard';
import { renderWithGraphite } from '../../../test-helpers/render-with-graphite';
import { Project } from '../../../types';

const p = (id: string, name: string): Project => ({
  id,
  name,
  description: '',
  monthlyCapacity: 0.3,
  isArchived: false,
  createdAt: '',
  updatedAt: '',
});

describe('NowCard', () => {
  it('計測していないときは最近のプロジェクトから直接開始できる', () => {
    const onStart = jest.fn();
    const recent = [p('p1', 'EC開発'), p('p2', '在庫管理')];
    renderWithGraphite(
      <NowCard
        activeProject={null}
        isRunning={false}
        startTime={null}
        recentProjects={recent}
        onStart={onStart}
        onStop={jest.fn()}
      />
    );

    expect(screen.getByText('計測していません')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '在庫管理 を開始' }));
    expect(onStart).toHaveBeenCalledWith(recent[1]);
  });

  it('計測中は開始時刻とプロジェクト名を表示し、停止ボタンで止められる', () => {
    const onStop = jest.fn();
    renderWithGraphite(
      <NowCard
        activeProject={p('p1', 'EC開発')}
        isRunning
        startTime={new Date(2026, 10, 26, 10, 30).toISOString()}
        recentProjects={[]}
        onStart={jest.fn()}
        onStop={onStop}
      />
    );

    expect(screen.getByText('計測中 · 10:30 から')).toBeInTheDocument();
    expect(screen.getByText('EC開発')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '停止' }));
    expect(onStop).toHaveBeenCalledTimes(1);
  });
});
