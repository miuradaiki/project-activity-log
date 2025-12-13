import React from 'react';
import { Box, Typography, alpha } from '@mui/material';
import { TimerOutlined } from '@mui/icons-material';

interface TimerDisplayProps {
  elapsed: string;
  isRunning: boolean;
  timerColor: string;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  elapsed,
  isRunning,
  timerColor,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        background: isRunning
          ? `linear-gradient(to bottom, ${alpha(timerColor, 0.03)}, transparent)`
          : 'none',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <TimerOutlined
          sx={{
            fontSize: 32,
            mr: 2,
            color: isRunning ? timerColor : 'text.secondary',
          }}
        />
        <Typography
          variant="h2"
          component="div"
          sx={{
            fontWeight: 'bold',
            fontFamily: 'monospace',
            letterSpacing: 2,
            color: isRunning ? timerColor : 'text.primary',
            transition: 'color 0.3s ease',
          }}
        >
          {elapsed}
        </Typography>
      </Box>
    </Box>
  );
};
