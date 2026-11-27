import React from 'react';
import { screen, fireEvent, within } from '@testing-library/react';
import { renderWithGraphite } from '../../../test-helpers/render-with-graphite';
import { ToastProvider } from '../../../contexts/ToastContext';
import { EntryHistory } from '../EntryHistory';
import { Project, TimeEntry } from '../../../types';

const projects = [
  { id: 'p1', name: 'モバイルアプリ刷新', isArchived: false },
  { id: 'p2', name: '採用サイト', isArchived: false },
] as Project[];

const at = (
  daysAgo: number,
  hour: number,
  minutes: number,
  id: string,
  projectId = 'p1'
): TimeEntry => {
  const s = new Date();
  s.setDate(s.getDate() - daysAgo);
  s.setHours(hour, 0, 0, 0);
  return {
    id,
    projectId,
    startTime: s.toISOString(),
    endTime: new Date(s.getTime() + minutes * 60_000).toISOString(),
    description: `メモ${id}`,
    createdAt: '',
    updatedAt: '',
  };
};

const renderHistory = (entries: TimeEntry[]) => {
  const handlers = { onEdit: jest.fn(), onDelete: jest.fn() };
  renderWithGraphite(
    <ToastProvider>
      <EntryHistory timeEntries={entries} projects={projects} {...handlers} />
    </ToastProvider>
  );
  return handlers;
};

describe('EntryHistory', () => {
  it('日ごとにまとめ、今日・昨日の見出しと日の合計時間を出す', () => {
    renderHistory([at(0, 9, 90, 'a'), at(0, 13, 30, 'b'), at(1, 9, 60, 'c')]);

    const today = screen.getByRole('group', { name: /今日/ });
    expect(within(today).getByText('2:00')).toBeInTheDocument();
    expect(within(today).getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByRole('group', { name: /昨日/ })).toBeInTheDocument();
  });

  it('削除は確認なしですぐに実行する（取り消しは通知で行う）', () => {
    const { onDelete } = renderHistory([at(0, 9, 60, 'a')]);

    fireEvent.click(screen.getByRole('button', { name: '作業記録を削除' }));

    expect(onDelete).toHaveBeenCalledWith('a');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('編集ボタンで記録を渡す', () => {
    const entry = at(0, 9, 60, 'a');
    const { onEdit } = renderHistory([entry]);

    fireEvent.click(screen.getByRole('button', { name: '作業記録を編集' }));

    expect(onEdit).toHaveBeenCalledWith(entry);
  });

  it('多いときは一部だけ出し、「さらに表示」で続きを出す', () => {
    const entries = Array.from({ length: 25 }, (_, i) => at(i, 9, 60, `e${i}`));
    renderHistory(entries);

    expect(screen.getAllByRole('listitem')).toHaveLength(20);
    fireEvent.click(
      screen.getByRole('button', { name: 'さらに表示（残り 5 件）' })
    );
    expect(screen.getAllByRole('listitem')).toHaveLength(25);
  });

  it('検索に一致しないときは空の状態を出す', () => {
    renderHistory([at(0, 9, 60, 'a')]);

    fireEvent.change(screen.getByRole('textbox', { name: '作業履歴を検索' }), {
      target: { value: '存在しない' },
    });

    expect(
      screen.getByText('該当する作業記録はありません')
    ).toBeInTheDocument();
  });
});
