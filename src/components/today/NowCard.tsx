import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, useTheme } from '@mui/material';
import { PlayArrowRounded as PlayIcon } from '@mui/icons-material';
import { Project } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { numberTypography } from '../../styles/modernTheme';
import { formatClock } from '../../utils/formatters';
import { projectColorManager } from '../../utils/colorUtils';
import { GraphiteCard } from '../ui/graphite/GraphiteCard';
import { StopButton } from '../ui/graphite/StopButton';

interface NowCardProps {
  activeProject: Project | null;
  isRunning: boolean;
  startTime: string | null;
  recentProjects: Project[];
  onStart: (project: Project) => void;
  onStop: () => void;
}

/** 表示専用の1秒ティッカー。自動停止はレイアウト側が担う */
const useNow = (enabled: boolean) => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!enabled) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [enabled]);
  return now;
};

const formatTime = (iso: string) => {
  const d = new Date(iso);
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export const NowCard: React.FC<NowCardProps> = ({
  activeProject,
  isRunning,
  startTime,
  recentProjects,
  onStart,
  onStop,
}) => {
  const theme = useTheme();
  const { t } = useLanguage();
  const running = isRunning && !!activeProject && !!startTime;
  const now = useNow(running);

  if (!running) {
    return (
      <GraphiteCard
        glow
        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        <Box>
          <Typography sx={{ fontSize: 15, fontWeight: 500 }}>
            {t('today.idle.title')}
          </Typography>
          <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 0.5 }}>
            {t('today.idle.hint')}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {recentProjects.map((project) => (
            <Button
              key={project.id}
              variant="outlined"
              onClick={() => onStart(project)}
              aria-label={t('today.start.project', { name: project.name })}
              startIcon={<PlayIcon sx={{ color: 'text.secondary' }} />}
              sx={{ borderRadius: 999, pl: 1.25 }}
            >
              <Box
                component="span"
                aria-hidden
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '3px',
                  mr: 1,
                  bgcolor: projectColorManager.getColorById(project.id),
                }}
              />
              {project.name}
            </Button>
          ))}
        </Box>
      </GraphiteCard>
    );
  }

  const elapsed = now - new Date(startTime).getTime();

  return (
    <GraphiteCard glow>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          fontSize: 12,
          color: 'text.secondary',
        }}
      >
        <Box
          aria-hidden
          sx={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            bgcolor: 'error.main',
            boxShadow: (th) => `0 0 0 4px ${th.palette.error.main}2E`,
          }}
        />
        {t('today.running.since', { time: formatTime(startTime) })}
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mt: 1.75,
          fontSize: 15,
          fontWeight: 500,
        }}
      >
        <Box
          aria-hidden
          sx={{
            width: 8,
            height: 8,
            borderRadius: '3px',
            bgcolor: projectColorManager.getColorById(activeProject.id),
          }}
        />
        {activeProject.name}
      </Box>
      <Box
        role="timer"
        aria-live="off"
        sx={{
          ...numberTypography(theme),
          fontSize: { xs: 56, md: 76 },
          lineHeight: 1,
          mt: 1.25,
          mb: 2.25,
        }}
      >
        {formatClock(elapsed)}
      </Box>
      <StopButton onClick={onStop} label={t('timer.stop')} />
    </GraphiteCard>
  );
};
