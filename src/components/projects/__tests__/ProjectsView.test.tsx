import React from 'react';
import { screen, fireEvent, within } from '@testing-library/react';
import { ProjectsView } from '../ProjectsView';
import { renderWithGraphite } from '../../../test-helpers/render-with-graphite';
import { Project, TimeEntry } from '../../../types';

const p = (
  id: string,
  name: string,
  monthlyCapacity: number,
  isArchived = false
): Project => ({
  id,
  name,
  description: '',
  monthlyCapacity,
  isArchived,
  createdAt: '',
  updatedAt: '',
});

const thisMonth = (projectId: string, hours: number): TimeEntry => {
  const s = new Date();
  s.setDate(1);
  s.setHours(9, 0, 0, 0);
  return {
    id: projectId,
    projectId,
    startTime: s.toISOString(),
    endTime: new Date(s.getTime() + hours * 3600_000).toISOString(),
    description: '',
    createdAt: '',
    updatedAt: '',
  };
};

const projects = [
  p('ec', 'EC開発', 0.4),
  p('crm', '顧客管理基盤', 0.2),
  p('old', '旧案件', 0.1, true),
];
const entries = [thisMonth('ec', 10), thisMonth('crm', 34.7)];

const setup = () => {
  const handlers = {
    onEditProject: jest.fn(),
    onDeleteProject: jest.fn(),
    onArchiveProject: jest.fn(),
    onUnarchiveProject: jest.fn(),
    onStartTimer: jest.fn(),
    onAddProject: jest.fn(),
  };
  renderWithGraphite(
    <ProjectsView
      projects={projects}
      timeEntries={entries}
      activeProjectId={null}
      baseMonthlyHours={140}
      {...handlers}
    />
  );
  return handlers;
};

const rowOf = (name: string) =>
  screen.getByText(name).closest('[data-row]') as HTMLElement;

describe('ProjectsView', () => {
  it('件数付きフィルタで超過だけに絞り込める', () => {
    setup();

    fireEvent.click(screen.getByRole('button', { name: /超過\s*1/ }));

    expect(screen.getByText('顧客管理基盤')).toBeInTheDocument();
    expect(screen.queryByText('EC開発')).not.toBeInTheDocument();
  });

  it('··· メニューから編集できる', () => {
    const { onEditProject } = setup();

    fireEvent.click(
      within(rowOf('EC開発')).getByRole('button', {
        name: 'プロジェクトメニュー',
      })
    );
    fireEvent.click(screen.getByRole('menuitem', { name: '編集' }));

    expect(onEditProject).toHaveBeenCalledWith(projects[0]);
  });

  it('削除は確認ダイアログを経てから実行する', () => {
    const { onDeleteProject } = setup();

    fireEvent.click(
      within(rowOf('EC開発')).getByRole('button', {
        name: 'プロジェクトメニュー',
      })
    );
    fireEvent.click(screen.getByRole('menuitem', { name: '削除…' }));
    expect(onDeleteProject).not.toHaveBeenCalled();

    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: '削除' })
    );
    expect(onDeleteProject).toHaveBeenCalledWith(projects[0]);
  });

  it('アーカイブ済みは折りたたまれ、開くと表示される', () => {
    setup();

    expect(screen.queryByText('旧案件')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /アーカイブ済み 1件/ }));
    expect(screen.getByText('旧案件')).toBeInTheDocument();
  });
});
