import { Project, TimeEntry } from '../types';

export const createBackup = async () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = `${await window.electronAPI.getUserDataPath()}/backups/${timestamp}`;

  try {
    // バックアップディレクトリの作成
    await window.electronAPI.createDirectory(backupDir);

    // 現在のデータを読み込み
    const projects = await window.electronAPI.loadProjects();
    const timeEntries = await window.electronAPI.loadTimeEntries();

    // バックアップファイルに保存
    await window.electronAPI.writeFile(
      `${backupDir}/projects.json`,
      JSON.stringify(projects, null, 2)
    );
    await window.electronAPI.writeFile(
      `${backupDir}/timeEntries.json`,
      JSON.stringify(timeEntries, null, 2)
    );

    return {
      success: true,
      backupPath: backupDir,
      projects,
      timeEntries,
    };
  } catch (error) {
    console.error('Backup creation failed:', error);
    return {
      success: false,
      error,
    };
  }
};

export const restoreFromBackup = async (backupPath: string) => {
  try {
    // バックアップからデータを読み込み
    const projectsData = await window.electronAPI.readFile(
      `${backupPath}/projects.json`,
      { encoding: 'utf8' }
    );
    const timeEntriesData = await window.electronAPI.readFile(
      `${backupPath}/timeEntries.json`,
      { encoding: 'utf8' }
    );

    const projects = JSON.parse(projectsData);
    const timeEntries = JSON.parse(timeEntriesData);

    // データを復元
    await window.electronAPI.saveProjects(projects);
    await window.electronAPI.saveTimeEntries(timeEntries);

    return { success: true };
  } catch (error) {
    console.error('Restore failed:', error);
    return { success: false, error };
  }
};
