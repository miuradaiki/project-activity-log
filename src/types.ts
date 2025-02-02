export interface Project {
  id: string;
  name: string;
  description: string;
  monthlyCapacity: number;  // 月の稼働率（0.0-1.0）
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;      // アーカイブ状態
  archivedAt?: string;      // アーカイブした日時
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