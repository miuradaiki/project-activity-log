import React, { useEffect, useState, useCallback } from 'react';
import { Box, Typography, Paper, IconButton } from '@mui/material';
import { PlayArrow, Stop } from '@mui/icons-material';
import { Project } from '../../types';
import { formatElapsedTime } from '../../utils/time';

interface TimerProps {
  project: Project | null;
  isRunning: boolean;
  startTime: string | null;
  onStart: () => void;
  onStop: () => void;
}

export const Timer: React.FC<TimerProps> = ({
  project,
  isRunning,
  startTime,
  onStart,
  onStop,
}) => {
  const [elapsed, setElapsed] = useState<string>('00:00:00');

  const calculateElapsed = useCallback(() => {
    if (!startTime) return '00:00:00';
    const diff = new Date().getTime() - new Date(startTime).getTime();
    return formatElapsedTime(diff);
  }, [startTime]);

  useEffect(() => {
    let intervalId: number;

    if (isRunning && startTime) {
      // 初回計算
      setElapsed(calculateElapsed());

      // 1秒ごとに更新
      intervalId = window.setInterval(() => {
        const currentElapsed =
          new Date().getTime() - new Date(startTime).getTime();

        // 8時間（28800000ミリ秒）を超えた場合、タイマーを自動停止
        if (currentElapsed >= 8 * 60 * 60 * 1000) {
          onStop();
          // 通知を表示
          new Notification('作業時間が8時間を超過しました', {
            body: 'タイマーを自動停止しました。必要に応じて新しいセッションを開始してください。',
          });
        } else {
          setElapsed(formatElapsedTime(currentElapsed));
        }
      }, 1000);
    }

    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [isRunning, startTime, calculateElapsed, onStop]);

  // コンポーネントマウント時に経過時間を再計算
  useEffect(() => {
    if (isRunning && startTime) {
      setElapsed(calculateElapsed());
    }
  }, []);

  if (!project) {
    return null;
  }

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography variant="subtitle1" color="primary" gutterBottom>
            Current Project
          </Typography>
          <Typography variant="h6">{project.name}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h4" sx={{ mx: 3 }}>
            {elapsed}
          </Typography>
          {isRunning ? (
            <IconButton onClick={onStop} color="secondary" size="large">
              <Stop />
            </IconButton>
          ) : (
            <IconButton onClick={onStart} color="primary" size="large">
              <PlayArrow />
            </IconButton>
          )}
        </Box>
      </Box>
    </Paper>
  );
};
