import { v4 as uuidv4 } from 'uuid';
import Papa from 'papaparse';
import { Project, TimeEntry } from '../types';

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
  const newTimeEntries: TimeEntry[] = data.map((row) => {
    const [year, month, day] = row.date.split('/');
    const projectId = projectIdMap.get(row.project_name)!;

    const formatDateTime = (date: string, time: string) => {
      const [hours, minutes, seconds] = time.split(':');
      return new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hours),
        parseInt(minutes),
        parseInt(seconds) || 0
      ).toISOString();
    };

    const startTime = formatDateTime(row.date, row.start_time);
    const endTime = formatDateTime(row.date, row.end_time);

    return {
      id: uuidv4(),
      projectId,
      startTime,
      endTime,
      description: row.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  return {
    projects: [...currentProjects, ...newProjects],
    timeEntries: [...currentTimeEntries, ...newTimeEntries],
  };
};
