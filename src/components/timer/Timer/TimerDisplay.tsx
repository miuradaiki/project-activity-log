import React from 'react';
import { Typography } from '@mui/material';
import { motion } from 'framer-motion';

interface TimerDisplayProps {
  elapsed: string;
  isRunning: boolean;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  elapsed,
  isRunning,
}) => {
  return (
    <motion.div
      key={elapsed}
      initial={{ scale: 0.9, opacity: 0.8 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Typography
        variant="h3"
        sx={{
          color: '#FFFFFF',
          fontWeight: 800,
          fontFamily: 'monospace',
          textShadow: '0 2px 8px rgba(0,0,0,0.3)',
          letterSpacing: '0.02em',
          position: 'relative',
          fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' },
          whiteSpace: 'nowrap',
          textAlign: 'center',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -4,
            left: 0,
            right: 0,
            height: 2,
            background: 'rgba(255,255,255,0.3)',
            borderRadius: '1px',
            transform: isRunning ? 'scaleX(1)' : 'scaleX(0)',
            transformOrigin: 'left',
            transition: 'transform 0.3s ease',
          },
        }}
      >
        {elapsed}
      </Typography>
    </motion.div>
  );
};
