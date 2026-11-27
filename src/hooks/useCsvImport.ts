import { useCallback, useRef, useState } from 'react';
import { Project, TimeEntry } from '../types';
import { safeImportWorkLog } from '../utils/safeImportUtils';

export type CsvImportResult =
  | { kind: 'success'; addedEntries: number; addedProjects: number }
  | { kind: 'error' };

interface UseCsvImportParams {
  projects: Project[];
  timeEntries: TimeEntry[];
  setProjects: (projects: Project[]) => void;
  setTimeEntries: (entries: TimeEntry[]) => void;
}

/** CSV 取り込みを実行し、結果（件数 or 失敗）をユーザーに伝えられる形で返す */
export const useCsvImport = ({
  projects,
  timeEntries,
  setProjects,
  setTimeEntries,
}: UseCsvImportParams) => {
  const [result, setResult] = useState<CsvImportResult | null>(null);
  // ファイル選択ダイアログの間に記録が増えても（自動停止など）失わないよう、最新値を参照する
  const latest = useRef({ projects, timeEntries });
  latest.current = { projects, timeEntries };

  const importCSV = useCallback(async () => {
    try {
      const filePath = await window.electronAPI.showOpenFileDialog();
      if (!filePath) return;

      const { projects: currentProjects, timeEntries: currentEntries } =
        latest.current;
      let summary: CsvImportResult = { kind: 'error' };
      const outcome = await safeImportWorkLog(
        filePath,
        currentProjects,
        currentEntries,
        (nextProjects, nextEntries) => {
          setProjects(nextProjects);
          setTimeEntries(nextEntries);
          summary = {
            kind: 'success',
            addedEntries: Math.max(
              0,
              nextEntries.length - currentEntries.length
            ),
            addedProjects: Math.max(
              0,
              nextProjects.length - currentProjects.length
            ),
          };
        }
      );
      setResult(outcome.success ? summary : { kind: 'error' });
    } catch {
      setResult({ kind: 'error' });
    }
  }, [setProjects, setTimeEntries]);

  const dismiss = useCallback(() => setResult(null), []);

  return { importCSV, result, dismiss };
};
