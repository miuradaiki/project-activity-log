import fs from 'fs';
import path from 'path';
import { app, dialog, BrowserWindow } from 'electron';

// パスを遅延評価で取得（ESMのインポートホイスティング対策）
const getStoragePath = () => {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, 'data');
};

// ストレージディレクトリの作成
const initStorage = () => {
  const storagePath = getStoragePath();
  if (!fs.existsSync(storagePath)) {
    fs.mkdirSync(storagePath, { recursive: true });
  }
};

// プロジェクトデータの復元
const recoverProjects = async () => {
  const storagePath = getStoragePath();
  const timeEntriesPath = path.join(storagePath, 'timeEntries.json');
  const projectsPath = path.join(storagePath, 'projects.json');

  try {
    // プロジェクトファイルが空の場合のみ実行
    const projectsData = await fs.promises.readFile(projectsPath, 'utf-8');
    const projects = JSON.parse(projectsData);
    if (projects.length > 0) {
      return;
    }

    // タイムエントリーからプロジェクトIDを収集
    const timeEntriesData = await fs.promises.readFile(
      timeEntriesPath,
      'utf-8'
    );
    const timeEntries = JSON.parse(timeEntriesData);

    // ユニークなプロジェクトIDを抽出
    const projectIds = [
      ...new Set(timeEntries.map((entry) => entry.projectId)),
    ];

    // プロジェクトデータを復元
    const recoveredProjects = projectIds.map((id) => ({
      id,
      name: 'Recovered Project', // 仮の名前
      description: '復元されたプロジェクト',
      monthlyCapacity: 0.5, // デフォルト値
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
  const filePath = path.join(getStoragePath(), 'projects.json');
  await fs.promises.writeFile(filePath, JSON.stringify(projects, null, 2));
};

// プロジェクトデータの読み込み
const loadProjects = async () => {
  const filePath = path.join(getStoragePath(), 'projects.json');
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
    return await recoverProjects(); // エラー時も復元を試みる
  }
};

// 時間記録データの保存
const saveTimeEntries = async (timeEntries) => {
  const filePath = path.join(getStoragePath(), 'timeEntries.json');
  await fs.promises.writeFile(filePath, JSON.stringify(timeEntries, null, 2));
};

// 時間記録データの読み込み
const loadTimeEntries = async () => {
  const filePath = path.join(getStoragePath(), 'timeEntries.json');
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
// toISOString は UTC のため、JST 0〜9時に前日の日付になる
const localDateStamp = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// 戻り値: 'saved' | 'canceled' | 'empty'（キャンセルを失敗として扱わないため区別する）
const exportToCSV = async (timeEntries, projects) => {
  try {
    // データが存在するか確認
    if (!timeEntries || timeEntries.length === 0) {
      console.log('No time entries to export');
      return 'empty';
    }

    if (!projects || projects.length === 0) {
      console.log('No projects found');
      return 'empty';
    }

    // プロジェクトデータをIDでマップ化
    const projectMap = projects.reduce((map, project) => {
      map[project.id] = project;
      return map;
    }, {});

    // データを整形（日付順にソート）
    const csvData = timeEntries
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      )
      .map((entry) => {
        const project = projectMap[entry.projectId];
        const startDate = new Date(entry.startTime);
        const endDate = new Date(entry.endTime);
        const durationMs = endDate.getTime() - startDate.getTime();
        const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
        const durationMinutes = Math.floor(
          (durationMs % (1000 * 60 * 60)) / (1000 * 60)
        );

        return {
          日付: startDate.toLocaleDateString('ja-JP'),
          開始時刻: startDate.toLocaleTimeString('ja-JP'),
          終了時刻: endDate.toLocaleTimeString('ja-JP'),
          作業時間: `${durationHours}時間${durationMinutes}分`,
          '作業時間（分）': Math.round(durationMs / (1000 * 60)),
          プロジェクト名: project ? project.name : 'Unknown Project',
          プロジェクト説明: project ? project.description : '',
          メモ: entry.description || '',
        };
      });

    // CSVにエクスポート
    const csv = Papa.unparse(csvData, {
      header: true,
      quotes: true,
    });

    // BOM付きでUTF-8として保存（Excelで日本語が文字化けしないように）
    const csvWithBom = '\uFEFF' + csv;

    // 保存先を選択
    const result = await dialog.showSaveDialog(
      BrowserWindow.getFocusedWindow(),
      {
        title: '作業時間記録をエクスポート',
        defaultPath: `work-log-${localDateStamp(new Date())}.csv`,
        filters: [{ name: 'CSV Files', extensions: ['csv'] }],
      }
    );

    if (!result.canceled && result.filePath) {
      await fs.promises.writeFile(result.filePath, csvWithBom, 'utf-8');
      return 'saved';
    }
    return 'canceled';
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
