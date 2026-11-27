import { v4 as uuidv4 } from 'uuid';
import Papa from 'papaparse';
import { Project, TimeEntry } from '../types';
import { createSplitEntries } from './timeEntryUtils';

interface CSVRow {
  date: string;
  start_time: string;
  end_time: string;
  duration_minutes: string;
  project_name: string;
  project_description: string;
  notes: string;
}

export const importWorkLog = async (
  csvPath: string,
  currentProjects: Project[],
  currentTimeEntries: TimeEntry[]
): Promise<{ projects: Project[]; timeEntries: TimeEntry[] }> => {
  // CSVファイルを読み込む
  const csvContent = await window.electronAPI.readFile(csvPath, {
    encoding: 'utf8',
  });

  // CSVをパース
  const { data } = Papa.parse<CSVRow>(csvContent, {
    header: true,
    skipEmptyLines: true,
  });

  // プロジェクト名の一覧を取得
  const uniqueProjectNames = Array.from(
    new Set(data.map((row) => row.project_name))
  );

  // 新規プロジェクトの作成
  const newProjects: Project[] = [];
  const projectIdMap = new Map<string, string>();

  // 既存のプロジェクトをマッピング
  currentProjects.forEach((project) => {
    projectIdMap.set(project.name, project.id);
  });

  // 新規プロジェクトを作成
  uniqueProjectNames.forEach((projectName) => {
    if (!projectIdMap.has(projectName)) {
      const description =
        data.find((row) => row.project_name === projectName)
          ?.project_description || '';
      const newProject: Project = {
        id: uuidv4(),
        name: projectName,
        description: description,
        monthlyCapacity: 1, // デフォルト値
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isArchived: false,
      };
      newProjects.push(newProject);
      projectIdMap.set(projectName, newProject.id);
    }
  });

  // TimeEntriesの作成
  const newTimeEntries: TimeEntry[] = data.flatMap((row) => {
    const [year, month, day] = row.date.split('/').map(Number);
    const projectId = projectIdMap.get(row.project_name)!;

    const toDate = (time: string) => {
      const [hours, minutes, seconds] = time.split(':').map(Number);
      return new Date(year, month - 1, day, hours, minutes, seconds || 0);
    };

    const start = toDate(row.start_time);
    const end = toDate(row.end_time);
    // 行には日付が1つしかないため、終了が開始以前なら翌日まで続いた記録とみなす
    if (end <= start) end.setDate(end.getDate() + 1);

    return createSplitEntries(projectId, start, end, row.notes || '');
  });

  return {
    projects: [...currentProjects, ...newProjects],
    timeEntries: [...currentTimeEntries, ...newTimeEntries],
  };
};
