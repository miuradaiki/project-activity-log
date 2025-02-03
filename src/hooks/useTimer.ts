import { useState, useEffect } from 'react';
import { TimerState } from '../types/timer';

const TIMER_STORAGE_KEY = 'project-activity-timer-state';

export const useTimer = () => {
  const [timerState, setTimerState] = useState<TimerState>(() => {
    const stored = localStorage.getItem(TIMER_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // 保存された開始時刻が8時間以上前の場合はリセット
      if (parsed.startTime && new Date(parsed.startTime).getTime() < Date.now() - 8 * 60 * 60 * 1000) {
        return { projectId: null, isRunning: false, startTime: null };
      }
      return parsed;
    }
    return { projectId: null, isRunning: false, startTime: null };
  });

  // タイマー状態の変更を永続化
  useEffect(() => {
    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(timerState));
  }, [timerState]);

  const startTimer = (projectId: string) => {
    setTimerState({
      projectId,
      isRunning: true,
      startTime: new Date().toISOString(),
    });
  };

  const stopTimer = async () => {
    if (timerState.startTime) {
      const endTime = new Date().toISOString();
      const duration = new Date().getTime() - new Date(timerState.startTime).getTime();

      // ここで作業記録を保存
      try {
        await window.electron.saveTimeEntry({
          projectId: timerState.projectId!,
          startTime: timerState.startTime,
          endTime,
          duration,
        });
      } catch (error) {
        console.error('Failed to save time entry:', error);
      }
    }

    setTimerState({
      projectId: null,
      isRunning: false,
      startTime: null,
    });
  };

  return {
    timerState,
    startTimer,
    stopTimer,
  };
};
