import React from 'react';
import { IconButton } from '@mui/material';
import { PlayArrow, Stop } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../../contexts/LanguageContext';

interface TimerControlsProps {
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
}

export const TimerControls: React.FC<TimerControlsProps> = ({
  isRunning,
  onStart,
  onStop,
}) => {
  const { t } = useLanguage();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={isRunning ? 'stop' : 'play'}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 0, rotate: 180 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <IconButton
          onClick={isRunning ? onStop : onStart}
          aria-label={isRunning ? t('aria.timer.stop') : t('aria.timer.start')}
          sx={{
            width: 64,
            height: 64,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: '#FFFFFF',
            fontSize: '2rem',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              transform: 'translateY(-2px)',
            },
            '&:active': {
              transform: 'scale(0.95)',
            },
            ...(isRunning && {
              animation: 'pulse-ring 2s infinite',
              '@keyframes pulse-ring': {
                '0%': {
                  boxShadow: '0 0 0 0 rgba(255, 255, 255, 0.5)',
                },
                '70%': {
                  boxShadow: '0 0 0 20px rgba(255, 255, 255, 0)',
                },
                '100%': {
                  boxShadow: '0 0 0 0 rgba(255, 255, 255, 0)',
                },
              },
            }),
          }}
        >
          <motion.div
            animate={{
              rotate: isRunning ? [0, 360] : 0,
            }}
            transition={{
              duration: isRunning ? 2 : 0.5,
              repeat: isRunning ? Infinity : 0,
              ease: 'linear',
            }}
          >
            {isRunning ? <Stop /> : <PlayArrow />}
          </motion.div>
        </IconButton>
      </motion.div>
    </AnimatePresence>
  );
};
