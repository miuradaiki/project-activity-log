import fs from 'fs';
import path from 'path';
import { app, dialog, BrowserWindow } from 'electron';

const USER_DATA_PATH = app.getPath('userData');
const STORAGE_PATH = path.join(USER_DATA_PATH, 'data');

// ストレージディレクトリの作成
const initStorage = () => {
  if (!fs.existsSync(STORAGE_PATH)) {
    fs.mkdirSync(STORAGE_PATH, { recursive: true });
  }
};

// プロジェクトデータの復元
const recoverProjects = async () => {
  const timeEntriesPath = path.join(STORAGE_PATH, 'timeEntries.json');
  const projectsPath = path.join(STORAGE_PATH, 'projects.json');

  try {
    // プロジェクトファイルが空の場合のみ実行
    const projectsData = await fs.promises.readFile(projectsPath, 'utf-8');
    const projects = JSON.parse(projectsData);
    if (projects.length > 0) {
      return;
    }

    // タイムエントリーからプロジェクトIDを収集
    const timeEntriesData = await fs.promises.readFile(timeEntriesPath, 'utf-8');
    const timeEntries = JSON.parse(timeEntriesData);

    // ユニークなプロジェクトIDを抽出
    const projectIds = [...new Set(timeEntries.map(entry => entry.projectId))];

    // プロジェクトデータを復元
    const recoveredProjects = projectIds.map(id => ({
      id,
      name: 'Recovered Project',  // 仮の名前
      description: '復元されたプロジェクト',
      monthlyCapacity: 0.5,  // デフォルト値
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    // 復元したプロジェクトデータを保存
    await saveProjects(recoveredProjects);

    return recoveredProjects;
  } catch (error) {
    console.error('Error recovering projects:', error);
    return [];
  }
};

// プロジェクトデータの保存
const saveProjects = async (projects) => {
  const filePath = path.join(STORAGE_PATH, 'projects.json');
  await fs.promises.writeFile(filePath, JSON.stringify(projects, null, 2));
};

// プロジェクトデータの読み込み
const loadProjects = async () => {
  const filePath = path.join(STORAGE_PATH, 'projects.json');
  try {
    const data = await fs.promises.readFile(filePath, 'utf-8');
    const projects = JSON.parse(data);

    // プロジェクトデータが空の場合は復元を試みる
    if (projects.length === 0) {
      return await recoverProjects();
    }

    return projects;
  } catch (error) {
    console.error('Error loading projects:', error);
    return await recoverProjects();  // エラー時も復元を試みる
  }
};

// 時間記録データの保存
const saveTimeEntries = async (timeEntries) => {
  const filePath = path.join(STORAGE_PATH, 'timeEntries.json');
  await fs.promises.writeFile(filePath, JSON.stringify(timeEntries, null, 2));
};

// 時間記録データの読み込み
const loadTimeEntries = async () => {
  const filePath = path.join(STORAGE_PATH, 'timeEntries.json');
  try {
    const data = await fs.promises.readFile(filePath, 'utf-8');
    const entries = JSON.parse(data);
    return entries;
  } catch (error) {
    console.error('Error loading time entries:', error);
    return [];
  }
};

import Papa from 'papaparse';

/**
 * 時間記録データをCSVとしてエクスポート
 * @param {Array} timeEntries 時間記録データ
 * @param {Array} projects プロジェクトデータ
 */
const exportToCSV = async (timeEntries, projects) => {
  try {
    // プロジェクトデータをIDでマップ化
    const projectMap = projects.reduce((map, project) => {
      map[project.id] = project;
      return map;
    }, {});

    // データを整形
    const csvData = timeEntries.map(entry => {
      const project = projectMap[entry.projectId];
      return {
        date: new Date(entry.startTime).toLocaleDateString(),
        start_time: new Date(entry.startTime).toLocaleTimeString(),
        end_time: new Date(entry.endTime).toLocaleTimeString(),
        duration_minutes: Math.round((new Date(entry.endTime) - new Date(entry.startTime)) / (1000 * 60)),
        project_name: project ? project.name : 'Unknown Project',
        project_description: project ? project.description : '',
        notes: entry.notes || ''
      };
    });

    // CSVにエクスポート
    const csv = Papa.unparse(csvData, {
      header: true,
      quotes: true
    });

    // 保存先を選択
    const { filePath } = await dialog.showSaveDialog(BrowserWindow.getFocusedWindow(), {
      title: '作業時間記録をエクスポート',
      defaultPath: `work-log-${new Date().toISOString().split('T')[0]}.csv`,
      filters: [
        { name: 'CSV Files', extensions: ['csv'] }
      ]
    });

    if (filePath) {
      await fs.promises.writeFile(filePath, csv);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    throw error;
  }
};

export {
  initStorage,
  saveProjects,
  loadProjects,
  saveTimeEntries,
  loadTimeEntries,
  exportToCSV,
};
