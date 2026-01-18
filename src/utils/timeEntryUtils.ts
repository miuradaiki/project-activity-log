import { TimeEntry } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { addDays, isSameDay } from 'date-fns';

/**
 * 日跨ぎの時間エントリーを日別に分割する
 * @param projectId - プロジェクトID
 * @param startDateTime - 開始日時
 * @param endDateTime - 終了日時
 * @param description - 説明
 * @returns 分割された時間エントリーの配列
 */
export const createSplitEntries = (
  projectId: string,
  startDateTime: Date,
  endDateTime: Date,
  description: string = ''
): TimeEntry[] => {
  const entries: TimeEntry[] = [];
  let currentStart = new Date(startDateTime);
  const timestamp = new Date().toISOString();

  // 同じ日の場合は分割しない
  if (isSameDay(startDateTime, endDateTime)) {
    return [
      {
        id: uuidv4(),
        projectId,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        description,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ];
  }

  // 日跨ぎの場合は日別に分割
  while (currentStart < endDateTime) {
    const currentEnd = new Date(currentStart);
    currentEnd.setHours(23, 59, 59, 999); // その日の終わり

    if (currentEnd > endDateTime) {
      currentEnd.setTime(endDateTime.getTime());
    }

    const entry: TimeEntry = {
      id: uuidv4(),
      projectId,
      startTime: currentStart.toISOString(),
      endTime: currentEnd.toISOString(),
      description:
        entries.length === 0
          ? description
          : `${description} (${entries.length + 1}日目)`,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    entries.push(entry);

    // 次の日の開始時刻を設定
    currentStart = addDays(currentStart, 1);
    currentStart.setHours(0, 0, 0, 0);
  }

  return entries;
};

/**
 * タイマーから時間エントリーを作成する（日跨ぎ対応）
 * @param projectId - プロジェクトID
 * @param startTime - 開始時刻（ISO文字列）
 * @param endTime - 終了時刻（ISO文字列）
 * @param description - 説明（オプション）
 * @returns 時間エントリーの配列（日跨ぎの場合は複数）
 */
export const createTimerEntries = (
  projectId: string,
  startTime: string,
  endTime: string,
  description: string = ''
): TimeEntry[] => {
  const startDateTime = new Date(startTime);
  const endDateTime = new Date(endTime);

  return createSplitEntries(projectId, startDateTime, endDateTime, description);
};
