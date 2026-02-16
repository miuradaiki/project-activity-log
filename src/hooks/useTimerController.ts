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
  stop: () => Promise<void>;
  toggle: (project?: Project) => Promise<void>;
  canStart: boolean;
  canStop: boolean;
}

export const useTimerController = (
  projects: Project[],
  onTimeEntriesCreated?: (entries: TimeEntry[]) => void
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

        // 8時間以上経過している場合はリセット
        if (
          parsed.startTime &&
          new Date(parsed.startTime).getTime() < Date.now() - MAX_DURATION_MS
        ) {
          localStorage.removeItem(STORAGE_KEYS.TIMER_STATE);
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
  }, [projects, isRestored]);

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

  const stop = useCallback(async () => {
    if (!activeProject || !startTime) return;

    const endTime = new Date().toISOString();
    const startTimeDate = new Date(startTime);
    const endTimeDate = new Date(endTime);
    const duration = endTimeDate.getTime() - startTimeDate.getTime();

    // 状態をリセット
    setIsRunning(false);
    setStartTime(null);
    setActiveProject(null);

    // トレイにタイマー停止を通知
    if (window.electronAPI?.timerStop) {
      await window.electronAPI.timerStop();
    }

    // 1分未満の場合は保存しない
    if (duration < MIN_DURATION_MS) {
      alert('1分未満の時間エントリは保存できません。');
      return;
    }

    // 日跨ぎ対応: createTimerEntriesを使用して適切に分割
    const newTimeEntries = createTimerEntries(
      activeProject.id,
      startTime,
      endTime,
      ''
    );

    onTimeEntriesCreated?.(newTimeEntries);
  }, [activeProject, startTime, onTimeEntriesCreated]);

  const toggle = useCallback(
    async (project?: Project) => {
      if (isRunning) {
        await stop();
      } else if (project) {
        await start(project);
      }
    },
    [isRunning, start, stop]
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
