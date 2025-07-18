import React, { useState, useEffect } from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { formatDuration, intervalToDuration } from 'date-fns';

interface TimeTrackerProps {
  activeProjectId: string | null;
  startTime: string | null;
}

export const TimeTracker: React.FC<TimeTrackerProps> = ({
  activeProjectId,
  startTime,
}) => {
  const [duration, setDuration] = useState('00:00:00');

  useEffect(() => {
    if (!activeProjectId || !startTime) {
      setDuration('00:00:00');
      return;
    }

    const timer = setInterval(() => {
      const start = new Date(startTime);
      const now = new Date();
      const duration = intervalToDuration({ start, end: now });
      
      const formatted = formatDuration(duration, {
        format: ['hours', 'minutes', 'seconds'],
        zero: true,
        delimiter: ':',
      });
      
      setDuration(formatted);
    }, 1000);

    return () => clearInterval(timer);
  }, [activeProjectId, startTime]);

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Active Timer
      </Typography>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h3" component="div">
          {duration}
        </Typography>
      </Box>
    </Paper>
  );
};