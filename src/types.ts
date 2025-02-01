export interface Project {
  id: string;
  name: string;
  description: string;
  monthlyCapacity: number;  // 月の稼働率（0.0-1.0）
  createdAt: string;
  updatedAt: string;
}

export interface TimeEntry {
  id: string;
  projectId: string;
  startTime: string;
  endTime: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}