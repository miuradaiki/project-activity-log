import { importWorkLog } from './importUtils';
import { createBackup, restoreFromBackup } from './backupUtils';
import { Project, TimeEntry } from '../types';

export const safeImportWorkLog = async (
  csvPath: string,
  currentProjects: Project[],
  currentTimeEntries: TimeEntry[],
  onSuccess: (projects: Project[], timeEntries: TimeEntry[]) => void
) => {
  let backup: { success: boolean; backupPath?: string } | null = null;

  try {
    // 1. バックアップを作成
    backup = await createBackup();
    if (!backup.success) {
      throw new Error('バックアップの作成に失敗しました');
    }
    console.log('バックアップを作成しました:', backup.backupPath);

    // 2. インポートを実行
    const { projects, timeEntries } = await importWorkLog(
      csvPath,
      currentProjects,
      currentTimeEntries
    );

    // 3. 新しいデータを保存
    await window.electronAPI.saveProjects(projects);
    await window.electronAPI.saveTimeEntries(timeEntries);

    // 4. 成功コールバックを呼び出し
    onSuccess(projects, timeEntries);

    console.log('インポートが完了しました');
    return {
      success: true,
      backupPath: backup.backupPath,
    };
  } catch (error) {
    console.error('インポート中にエラーが発生しました:', error);

    // エラーが発生した場合、バックアップから復元を試みる
    if (backup?.backupPath) {
      console.log('バックアップからの復元を試みます...');
      const restore = await restoreFromBackup(backup.backupPath);
      if (restore.success) {
        console.log('バックアップからの復元に成功しました');
      } else {
        console.error('バックアップからの復元に失敗しました:', restore.error);
      }
    }

    return {
      success: false,
      error,
    };
  }
};
