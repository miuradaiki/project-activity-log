import { useState, useCallback, useEffect } from 'react';
import { Project, TimeEntry } from '../types';
import { createTimerEntries } from '../utils/timeEntryUtils';
import { STORAGE_KEYS } from '../constants/storageKeys';

const MIN_DURATION_MS = 60000; // 1分
const MAX_DURATION_MS = 8 * 60 * 60 * 1000; // 8時間

interface TimerStateStorage {
  projectId: string | null;
  isRunning: boolean;
  startTime: string | null;
}

export interface TimerController {
  activeProject: Project | null;
  isRunning: boolean;
  startTime: string | null;
  start: (project: Project) => Promise<void>;
  /** 保存した記録を返す（1分未満で保存しなかったときは空） */
  stop: () => Promise<TimeEntry[]>;
  toggle: (project?: Project) => Promise<void>;
  canStart: boolean;
  canStop: boolean;
}

export const useTimerController = (
  projects: Project[],
  onTimeEntriesCreated?: (entries: TimeEntry[]) => void,
  /** 1分未満で停止し、記録を保存しなかったときに呼ばれる */
  onDiscarded?: () => void
): TimerController => {
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [isRestored, setIsRestored] = useState(false);

  // localStorage から状態を復元
  useEffect(() => {
    if (isRestored || projects.length === 0) return;

    const stored = localStorage.getItem(STORAGE_KEYS.TIMER_STATE);
    if (stored) {
      try {
        const parsed: TimerStateStorage = JSON.parse(stored);

        // 8時間以上経過している場合は再開せず、停止したときと同じく8時間分を記録に残す
        if (
          parsed.startTime &&
          new Date(parsed.startTime).getTime() < Date.now() - MAX_DURATION_MS
        ) {
          // 先に消しておき、StrictMode で effect が2回走っても二重に保存しない
          localStorage.removeItem(STORAGE_KEYS.TIMER_STATE);
          const project = projects.find((p) => p.id === parsed.projectId);
          if (parsed.isRunning && project) {
            const endTime = new Date(
              new Date(parsed.startTime).getTime() + MAX_DURATION_MS
            ).toISOString();
            onTimeEntriesCreated?.(
              createTimerEntries(project.id, parsed.startTime, endTime, '')
            );
          }
          setIsRestored(true);
          return;
        }

        if (parsed.isRunning && parsed.projectId && parsed.startTime) {
          const project = projects.find((p) => p.id === parsed.projectId);
          if (project && !project.isArchived) {
            setActiveProject(project);
            setIsRunning(true);
            setStartTime(parsed.startTime);

            // トレイにタイマー開始を通知
            if (window.electronAPI?.timerStart) {
              window.electronAPI.timerStart(project.name);
            }
          } else {
            localStorage.removeItem(STORAGE_KEYS.TIMER_STATE);
          }
        }
      } catch {
        localStorage.removeItem(STORAGE_KEYS.TIMER_STATE);
      }
    }
    setIsRestored(true);
  }, [projects, isRestored, onTimeEntriesCreated]);

  // localStorage に状態を保存
  useEffect(() => {
    if (!isRestored) return;

    if (isRunning && activeProject && startTime) {
      const timerState: TimerStateStorage = {
        projectId: activeProject.id,
        isRunning,
        startTime,
      };
      localStorage.setItem(
        STORAGE_KEYS.TIMER_STATE,
        JSON.stringify(timerState)
      );
    } else {
      localStorage.removeItem(STORAGE_KEYS.TIMER_STATE);
    }
  }, [activeProject, isRunning, startTime, isRestored]);

  // トレイからのタイマー停止イベント
  useEffect(() => {
    if (window.electronAPI?.onTrayStopTimer) {
      window.electronAPI.onTrayStopTimer(() => {
        stop();
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = useCallback(async (project: Project) => {
    const now = new Date().toISOString();
    setStartTime(now);
    setIsRunning(true);
    setActiveProject(project);

    if (window.electronAPI?.timerStart) {
      await window.electronAPI.timerStart(project.name);
    }
  }, []);

  const stop = useCallback(async (): Promise<TimeEntry[]> => {
    if (!activeProject || !startTime) return [];

    // スリープ中は自動停止の監視が止まるため、復帰時の停止でも8時間を上限に区切る
    const startMs = new Date(startTime).getTime();
    const endMs = Math.min(Date.now(), startMs + MAX_DURATION_MS);
    const endTime = new Date(endMs).toISOString();
    const duration = endMs - startMs;

    // 状態をリセット
    setIsRunning(false);
    setStartTime(null);
    setActiveProject(null);

    // トレイの表示更新に失敗しても、計測分の記録は失わないよう保存を続ける
    try {
      await window.electronAPI?.timerStop?.();
    } catch (error) {
      console.error('トレイへのタイマー停止の通知に失敗しました:', error);
    }

    // 1分未満の場合は保存しない
    if (duration < MIN_DURATION_MS) {
      onDiscarded?.();
      return [];
    }

    // 日跨ぎ対応: createTimerEntriesを使用して適切に分割
    const newTimeEntries = createTimerEntries(
      activeProject.id,
      startTime,
      endTime,
      ''
    );

    onTimeEntriesCreated?.(newTimeEntries);
    return newTimeEntries;
  }, [activeProject, startTime, onTimeEntriesCreated, onDiscarded]);

  const toggle = useCallback(
    async (project?: Project) => {
      if (!isRunning) {
        if (project) await start(project);
        return;
      }
      await stop();
      // 計測中に別プロジェクトが指定された場合は、記録を保存して切り替える
      if (project && project.id !== activeProject?.id) {
        await start(project);
      }
    },
    [isRunning, activeProject, start, stop]
  );

  return {
    activeProject,
    isRunning,
    startTime,
    start,
    stop,
    toggle,
    canStart: !isRunning,
    canStop: isRunning,
  };
};
