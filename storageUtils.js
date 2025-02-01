const fs = require('fs');
const path = require('path');
const { app } = require('electron');

const USER_DATA_PATH = app.getPath('userData');
const STORAGE_PATH = path.join(USER_DATA_PATH, 'data');

// ストレージディレクトリの作成
const initStorage = () => {
  if (!fs.existsSync(STORAGE_PATH)) {
    fs.mkdirSync(STORAGE_PATH, { recursive: true });
  }
  console.log('Storage path:', STORAGE_PATH);
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
    console.log('Projects recovered:', recoveredProjects);
    
    return recoveredProjects;
  } catch (error) {
    console.error('Error recovering projects:', error);
    return [];
  }
};

// プロジェクトデータの保存
const saveProjects = async (projects) => {
  const filePath = path.join(STORAGE_PATH, 'projects.json');
  console.log('Saving projects to:', filePath);
  await fs.promises.writeFile(filePath, JSON.stringify(projects, null, 2));
};

// プロジェクトデータの読み込み
const loadProjects = async () => {
  const filePath = path.join(STORAGE_PATH, 'projects.json');
  try {
    console.log('Loading projects from:', filePath);
    const data = await fs.promises.readFile(filePath, 'utf-8');
    const projects = JSON.parse(data);
    console.log('Loaded projects:', projects);
    
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
  console.log('Saving time entries to:', filePath);
  await fs.promises.writeFile(filePath, JSON.stringify(timeEntries, null, 2));
};

// 時間記録データの読み込み
const loadTimeEntries = async () => {
  const filePath = path.join(STORAGE_PATH, 'timeEntries.json');
  try {
    console.log('Loading time entries from:', filePath);
    const data = await fs.promises.readFile(filePath, 'utf-8');
    const entries = JSON.parse(data);
    console.log('Loaded time entries:', entries);
    return entries;
  } catch (error) {
    console.error('Error loading time entries:', error);
    return [];
  }
};

module.exports = {
  initStorage,
  saveProjects,
  loadProjects,
  saveTimeEntries,
  loadTimeEntries,
};