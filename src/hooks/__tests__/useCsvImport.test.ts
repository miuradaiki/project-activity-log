import { renderHook, act } from '@testing-library/react';
import { useCsvImport } from '../useCsvImport';
import { safeImportWorkLog } from '../../utils/safeImportUtils';
import { Project, TimeEntry } from '../../types';

jest.mock('../../utils/safeImportUtils', () => ({
  safeImportWorkLog: jest.fn(),
}));

const project = (id: string): Project => ({
  id,
  name: id,
  description: '',
  monthlyCapacity: 0,
  isArchived: false,
  createdAt: '',
  updatedAt: '',
});
const entry = (id: string): TimeEntry => ({
  id,
  projectId: 'p1',
  startTime: '',
  endTime: '',
  description: '',
  createdAt: '',
  updatedAt: '',
});

describe('useCsvImport', () => {
  const setProjects = jest.fn();
  const setTimeEntries = jest.fn();
  const base = {
    projects: [project('p1')],
    timeEntries: [entry('e1')],
    setProjects,
    setTimeEntries,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (window as unknown as { electronAPI: object }).electronAPI = {
      showOpenFileDialog: jest.fn().mockResolvedValue('/tmp/log.csv'),
    };
  });

  it('取り込みに成功したら、追加した記録と新規プロジェクトの件数を結果として返す', async () => {
    (safeImportWorkLog as jest.Mock).mockImplementation(
      async (_path, _p, _e, onSuccess) => {
        onSuccess(
          [project('p1'), project('p2')],
          [entry('e1'), entry('e2'), entry('e3')]
        );
        return { success: true };
      }
    );
    const { result } = renderHook(() => useCsvImport(base));

    await act(() => result.current.importCSV());

    expect(result.current.result).toEqual({
      kind: 'success',
      addedEntries: 2,
      addedProjects: 1,
    });
    expect(setTimeEntries).toHaveBeenCalled();
  });

  it('失敗したらエラーを結果として返す', async () => {
    (safeImportWorkLog as jest.Mock).mockResolvedValue({ success: false });
    const { result } = renderHook(() => useCsvImport(base));

    await act(() => result.current.importCSV());

    expect(result.current.result).toEqual({ kind: 'error' });
  });

  it('ファイル選択をキャンセルしたら何もしない', async () => {
    (window as unknown as { electronAPI: object }).electronAPI = {
      showOpenFileDialog: jest.fn().mockResolvedValue(null),
    };
    const { result } = renderHook(() => useCsvImport(base));

    await act(() => result.current.importCSV());

    expect(safeImportWorkLog).not.toHaveBeenCalled();
    expect(result.current.result).toBeNull();
  });

  it('ファイル選択中に増えた記録も含めて取り込む（古い一覧で上書きしない）', async () => {
    let choose: (path: string) => void = () => {};
    (window as unknown as { electronAPI: object }).electronAPI = {
      showOpenFileDialog: jest.fn(
        () => new Promise<string>((resolve) => (choose = resolve))
      ),
    };
    (safeImportWorkLog as jest.Mock).mockResolvedValue({ success: true });
    const { result, rerender } = renderHook((props) => useCsvImport(props), {
      initialProps: base,
    });

    let pending: Promise<void> = Promise.resolve();
    act(() => {
      pending = result.current.importCSV();
    });
    const latest = [entry('e1'), entry('auto-stopped')];
    rerender({ ...base, timeEntries: latest });
    await act(async () => {
      choose('/tmp/log.csv');
      await pending;
    });

    expect((safeImportWorkLog as jest.Mock).mock.calls[0][2]).toBe(latest);
  });
});
