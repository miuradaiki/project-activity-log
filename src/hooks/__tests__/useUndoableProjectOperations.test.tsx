import React, { useState } from 'react';
import { renderHook, act, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material';
import { modernDarkTheme } from '../../styles/modernTheme';
import { LanguageProvider } from '../../contexts/LanguageContext';
import { ToastProvider } from '../../contexts/ToastContext';
import { useProjectOperations } from '../useProjectOperations';
import { useUndoableProjectOperations } from '../useUndoableProjectOperations';
import {
  createMockProject,
  createMockTimeEntry,
} from '../../__tests__/helpers';
import { Project, TimeEntry } from '../../types';

const p1 = createMockProject({ id: 'p1', name: 'モバイル' });
const p2 = createMockProject({ id: 'p2', name: '採用サイト' });
const p3 = createMockProject({ id: 'p3', name: 'ダッシュボード' });
const e1 = createMockTimeEntry({ id: 'e1', projectId: 'p1' });
const e2 = createMockTimeEntry({ id: 'e2', projectId: 'p2' });
const e3 = createMockTimeEntry({ id: 'e3', projectId: 'p2' });

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={modernDarkTheme}>
    <LanguageProvider>
      <ToastProvider>{children}</ToastProvider>
    </LanguageProvider>
  </ThemeProvider>
);

const setup = () => {
  Object.defineProperty(window.navigator, 'language', {
    value: 'ja-JP',
    configurable: true,
  });
  return renderHook(
    () => {
      const [projects, setProjects] = useState<Project[]>([p1, p2, p3]);
      const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([e1, e2, e3]);
      const base = useProjectOperations({
        projects,
        setProjects,
        setTimeEntries,
        activeProjectId: null,
        isTimerRunning: false,
        onTimerStop: jest.fn(),
      });
      const ops = useUndoableProjectOperations({
        projectOps: base,
        projects,
        timeEntries,
        setProjects,
        setTimeEntries,
      });
      return { ops, projects, timeEntries };
    },
    { wrapper }
  );
};

const undo = () =>
  fireEvent.click(screen.getByRole('button', { name: '元に戻す' }));

describe('useUndoableProjectOperations', () => {
  it('作業記録を削除すると通知が出て、元に戻すと記録が復活する', () => {
    const { result } = setup();

    act(() => result.current.ops.deleteTimeEntry('e2'));
    expect(result.current.timeEntries.map((e) => e.id)).toEqual(['e1', 'e3']);
    expect(screen.getByText('作業記録を削除しました')).toBeInTheDocument();

    undo();
    expect(result.current.timeEntries.map((e) => e.id).sort()).toEqual([
      'e1',
      'e2',
      'e3',
    ]);
  });

  it('アーカイブを元に戻すと、アーカイブ前の状態に戻る', () => {
    const { result } = setup();

    act(() => result.current.ops.archiveProject(p2));
    expect(result.current.projects[1].isArchived).toBe(true);
    expect(
      screen.getByText('「採用サイト」をアーカイブしました')
    ).toBeInTheDocument();

    undo();
    expect(result.current.projects[1]).toEqual(p2);
  });

  it('プロジェクト削除を元に戻すと、元の並び順と記録ごと復活する', () => {
    const { result } = setup();

    act(() => result.current.ops.deleteProject(p2));
    expect(result.current.projects.map((p) => p.id)).toEqual(['p1', 'p3']);
    expect(result.current.timeEntries.map((e) => e.id)).toEqual(['e1']);
    expect(
      screen.getByText('「採用サイト」と記録2件を削除しました')
    ).toBeInTheDocument();

    undo();
    // 並び順は色の割り当てに使うため、元の位置に戻す
    expect(result.current.projects.map((p) => p.id)).toEqual([
      'p1',
      'p2',
      'p3',
    ]);
    expect(result.current.timeEntries.map((e) => e.id).sort()).toEqual([
      'e1',
      'e2',
      'e3',
    ]);
  });
});
