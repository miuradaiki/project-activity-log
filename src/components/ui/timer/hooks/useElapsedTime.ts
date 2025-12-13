import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@mui/material';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { formatElapsedTime } from '../../../../utils/time';

interface UseElapsedTimeProps {
  isRunning: boolean;
  startTime: string | null;
  onStop: () => void;
}

interface UseElapsedTimeReturn {
  elapsed: string;
  elapsedMs: number;
  timerColor: string;
}

export const useElapsedTime = ({
  isRunning,
  startTime,
  onStop,
}: UseElapsedTimeProps): UseElapsedTimeReturn => {
  const theme = useTheme();
  const { t } = useLanguage();
  const [elapsed, setElapsed] = useState<string>('00:00:00');
  const [elapsedMs, setElapsedMs] = useState<number>(0);

  const calculateElapsed = useCallback(() => {
    if (!startTime) return { text: '00:00:00', ms: 0 };
    const diff = new Date().getTime() - new Date(startTime).getTime();
    return {
      text: formatElapsedTime(diff),
      ms: diff,
    };
  }, [startTime]);

  useEffect(() => {
    let intervalId: number;

    if (isRunning && startTime) {
      const { text, ms } = calculateElapsed();
      setElapsed(text);
      setElapsedMs(ms);

      intervalId = window.setInterval(() => {
        const currentElapsed =
          new Date().getTime() - new Date(startTime).getTime();

        if (currentElapsed >= 8 * 60 * 60 * 1000) {
          onStop();
          new Notification(t('timer.notification.maxtime'), {
            body: t('timer.notification.maxtime.body'),
          });
        } else {
          setElapsed(formatElapsedTime(currentElapsed));
          setElapsedMs(currentElapsed);
        }
      }, 1000);
    }

    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [isRunning, startTime, calculateElapsed, onStop, t]);

  useEffect(() => {
    if (isRunning && startTime) {
      const { text, ms } = calculateElapsed();
      setElapsed(text);
      setElapsedMs(ms);
    }
  }, [isRunning, startTime, calculateElapsed]);

  const getTimerColor = useCallback((): string => {
    const maxDuration = 8 * 60 * 60 * 1000;
    const progress = Math.min((elapsedMs / maxDuration) * 100, 100);

    if (progress >= 90) return theme.palette.error.main;
    if (progress >= 75) return theme.palette.warning.main;
    return theme.palette.primary.main;
  }, [
    elapsedMs,
    theme.palette.error.main,
    theme.palette.warning.main,
    theme.palette.primary.main,
  ]);

  return {
    elapsed,
    elapsedMs,
    timerColor: getTimerColor(),
  };
};
