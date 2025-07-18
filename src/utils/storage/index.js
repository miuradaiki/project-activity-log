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
    return JSON.parse(data);
  } catch (error) {
    return [];
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
    return JSON.parse(data);
  } catch (error) {
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
