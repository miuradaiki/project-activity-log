import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, IconButton } from '@mui/material';
import { PlayArrow, Stop } from '@mui/icons-material';
import { Project } from '../../types';

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

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isRunning && startTime) {
      intervalId = setInterval(() => {
        const start = new Date(startTime).getTime();
        const now = new Date().getTime();
        const diff = now - start;

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setElapsed(
          `${hours.toString().padStart(2, '0')}:${minutes
            .toString()
            .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRunning, startTime]);

  if (!project) {
    return null;
  }

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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