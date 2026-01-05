import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const testProjects = [
  {
    id: 'test-project-1',
    name: 'テストプロジェクト1',
    description: 'E2Eテスト用のプロジェクト',
    monthlyCapacity: 0.5,
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'test-project-2',
    name: 'テストプロジェクト2',
    description: '2つ目のテストプロジェクト',
    monthlyCapacity: 0.3,
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'test-project-archived',
    name: 'アーカイブ済みプロジェクト',
    description: 'アーカイブテスト用',
    monthlyCapacity: 0.2,
    isArchived: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const now = new Date();
const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

const testTimeEntries = [
  {
    id: 'test-entry-1',
    projectId: 'test-project-1',
    startTime: twoHoursAgo.toISOString(),
    endTime: oneHourAgo.toISOString(),
    notes: 'テスト作業1',
  },
  {
    id: 'test-entry-2',
    projectId: 'test-project-2',
    startTime: oneHourAgo.toISOString(),
    endTime: now.toISOString(),
    notes: 'テスト作業2',
  },
];

async function globalSetup() {
  const testUserDataPath = path.join(__dirname, '..', '.test-user-data');
  const dataPath = path.join(testUserDataPath, 'data');

  // Create directories
  if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath, { recursive: true });
  }

  // Write test data
  const projectsPath = path.join(dataPath, 'projects.json');
  const timeEntriesPath = path.join(dataPath, 'timeEntries.json');

  fs.writeFileSync(projectsPath, JSON.stringify(testProjects, null, 2));
  fs.writeFileSync(timeEntriesPath, JSON.stringify(testTimeEntries, null, 2));

  console.log('E2E test data initialized:');
  console.log(`  - Projects: ${projectsPath}`);
  console.log(`  - Time entries: ${timeEntriesPath}`);
}

export default globalSetup;
