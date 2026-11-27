import { useCallback, useState } from 'react';
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

  const importCSV = useCallback(async () => {
    try {
      const filePath = await window.electronAPI.showOpenFileDialog();
      if (!filePath) return;

      let summary: CsvImportResult = { kind: 'error' };
      const outcome = await safeImportWorkLog(
        filePath,
        projects,
        timeEntries,
        (nextProjects, nextEntries) => {
          setProjects(nextProjects);
          setTimeEntries(nextEntries);
          summary = {
            kind: 'success',
            addedEntries: Math.max(0, nextEntries.length - timeEntries.length),
            addedProjects: Math.max(0, nextProjects.length - projects.length),
          };
        }
      );
      setResult(outcome.success ? summary : { kind: 'error' });
    } catch {
      setResult({ kind: 'error' });
    }
  }, [projects, timeEntries, setProjects, setTimeEntries]);

  const dismiss = useCallback(() => setResult(null), []);

  return { importCSV, result, dismiss };
};
