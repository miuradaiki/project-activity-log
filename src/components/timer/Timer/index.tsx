import React, { useEffect, useState, useCallback } from 'react';
import { Box, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { Project } from '../../../types';
import { formatElapsedTime } from '../../../utils/time';
import { GradientCard } from '../../ui/modern/StyledComponents';
import { TimerDisplay } from './TimerDisplay';
import { TimerControls } from './TimerControls';
import { TimerProjectInfo } from './TimerProjectInfo';
import { TimerBackground } from './TimerBackground';

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
  const theme = useTheme();

  const calculateElapsed = useCallback(() => {
    if (!startTime) return '00:00:00';
    const diff = new Date().getTime() - new Date(startTime).getTime();
    return formatElapsedTime(diff);
  }, [startTime]);

  useEffect(() => {
    let intervalId: number;

    if (isRunning && startTime) {
      setElapsed(calculateElapsed());

      intervalId = window.setInterval(() => {
        const currentElapsed =
          new Date().getTime() - new Date(startTime).getTime();

        if (currentElapsed >= 8 * 60 * 60 * 1000) {
          onStop();
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

  useEffect(() => {
    if (isRunning && startTime) {
      setElapsed(calculateElapsed());
    }
  }, [isRunning, startTime, calculateElapsed]);

  if (!project) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      style={{ marginBottom: '16px' }}
    >
      <GradientCard
        gradient={
          isRunning
            ? theme.custom?.gradients?.secondary ||
              'linear-gradient(135deg, #00ACC1 0%, #26C6DA 100%)'
            : theme.custom?.gradients?.primary ||
              'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }
        sx={{
          p: 4,
          position: 'relative',
          overflow: 'visible !important',
          minHeight: '160px',
          borderRadius: 3,
          transform: 'none !important',
          '&:hover': {
            transform: 'none !important',
            filter: 'brightness(1.05)',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: isRunning
              ? 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.1) 100%)'
              : 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            pointerEvents: 'none',
            borderRadius: 'inherit',
            zIndex: -1,
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <TimerProjectInfo project={project} isRunning={isRunning} />

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: { xs: 2, md: 3 },
              position: 'relative',
              zIndex: 1,
            }}
          >
            <TimerDisplay elapsed={elapsed} isRunning={isRunning} />
            <TimerControls
              isRunning={isRunning}
              onStart={onStart}
              onStop={onStop}
            />
          </Box>
        </Box>

        <TimerBackground isRunning={isRunning} />
      </GradientCard>
    </motion.div>
  );
};
