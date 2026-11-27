import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { TodayProjectList } from '../TodayProjectList';
import { renderWithGraphite } from '../../../test-helpers/render-with-graphite';
import { Project, TimeEntry } from '../../../types';

const p = (id: string, name: string, monthlyCapacity: number): Project => ({
  id,
  name,
  description: '',
  monthlyCapacity,
  isArchived: false,
  createdAt: '',
  updatedAt: '',
});

const hoursEntry = (projectId: string, hours: number): TimeEntry => {
  const start = new Date();
  start.setDate(1);
  start.setHours(9, 0, 0, 0);
  return {
    id: `${projectId}-${hours}`,
    projectId,
    startTime: start.toISOString(),
    endTime: new Date(start.getTime() + hours * 3600_000).toISOString(),
    description: '',
    createdAt: '',
    updatedAt: '',
  };
};

const projects = [p('ec', 'EC開発', 0.4), p('crm', '顧客管理基盤', 0.2)];
const entries = [hoursEntry('ec', 31.8), hoursEntry('crm', 34.7)];

const renderList = (
  props: Partial<React.ComponentProps<typeof TodayProjectList>> = {}
) =>
  renderWithGraphite(
    <TodayProjectList
      projects={projects}
      timeEntries={entries}
      baseMonthlyHours={140}
      activeProjectId="ec"
      isRunning
      onToggle={jest.fn()}
      onCreateProject={jest.fn()}
      {...props}
    />
  );

describe('TodayProjectList', () => {
  it('計測中のプロジェクトは停止、それ以外は開始のボタンを出し、押すとそのプロジェクトで切り替える', () => {
    const onToggle = jest.fn();
    renderList({ onToggle });

    fireEvent.click(screen.getByRole('button', { name: 'EC開発 を停止' }));
    fireEvent.click(
      screen.getByRole('button', { name: '顧客管理基盤 を開始' })
    );

    expect(onToggle.mock.calls.map((c) => c[0].id)).toEqual(['ec', 'crm']);
  });

  it('設定の基準時間で目標を計算し、超過は時間付きのタグで示す', () => {
    renderList({ baseMonthlyHours: 140 });

    expect(screen.getByText('31.8 / 56h')).toBeInTheDocument();
    expect(screen.getByText('34.7 / 28h')).toBeInTheDocument();
    expect(screen.getByText('+6.7h 超過')).toBeInTheDocument();
  });
});

describe('TodayProjectList の空状態', () => {
  it('プロジェクトがないときは作成ボタンを出す', () => {
    const onCreateProject = jest.fn();
    renderWithGraphite(
      <TodayProjectList
        projects={[]}
        timeEntries={[]}
        baseMonthlyHours={140}
        activeProjectId={null}
        isRunning={false}
        onToggle={jest.fn()}
        onCreateProject={onCreateProject}
      />
    );

    expect(
      screen.getByText('まだプロジェクトがありません')
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'プロジェクトを作成' }));
    expect(onCreateProject).toHaveBeenCalledTimes(1);
  });
});
