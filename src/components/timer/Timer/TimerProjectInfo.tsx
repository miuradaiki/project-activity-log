import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { Project } from '../../../types';

interface TimerProjectInfoProps {
  project: Project;
  isRunning: boolean;
}

export const TimerProjectInfo: React.FC<TimerProjectInfoProps> = ({
  project,
  isRunning,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      style={{
        position: 'relative',
        zIndex: 2,
        marginBottom: '16px',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          mx: 'auto',
          px: { xs: 4, sm: 6, md: 8 },
          maxWidth: 'calc(100% - 32px)',
          width: '100%',
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontWeight: 500,
            fontSize: '0.9rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            mb: 1,
            textAlign: 'center',
            width: '100%',
          }}
        >
          {isRunning ? 'Currently Working On' : 'Selected Project'}
        </Typography>
        <Typography
          variant="h5"
          sx={{
            color: '#FFFFFF',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.4rem' },
            textAlign: 'center',
            lineHeight: 1.3,
            width: '100%',
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            mx: 'auto',
            display: 'block',
          }}
          title={project.name}
        >
          {project.name}
        </Typography>
      </Box>
    </motion.div>
  );
};
