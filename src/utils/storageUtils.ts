import { importWorkLog } from './importUtils';
import { Project, TimeEntry } from '../types';

export const importAndSaveWorkLog = async (
  csvPath: string,
  currentProjects: Project[],
  currentTimeEntries: TimeEntry[],
  onSuccess: (projects: Project[], timeEntries: TimeEntry[]) => void
) => {
  try {
    const { projects, timeEntries } = await importWorkLog(
      csvPath,
      currentProjects,
      currentTimeEntries
    );

    // データを保存
    await window.electronAPI.saveProjects(projects);
    await window.electronAPI.saveTimeEntries(timeEntries);

    // 成功コールバックを呼び出し
    onSuccess(projects, timeEntries);

    return true;
  } catch (error) {
    console.error('Error importing work log:', error);
    return false;
  }
};
