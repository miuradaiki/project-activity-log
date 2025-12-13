import React from 'react';
import { Button, Stack, alpha, useTheme } from '@mui/material';
import { PlayArrow, Pause, Check, Close } from '@mui/icons-material';
import { useLanguage } from '../../../contexts/LanguageContext';

interface TimerControlsProps {
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
  onPause?: () => void;
  onCancel?: () => void;
}

export const TimerControls: React.FC<TimerControlsProps> = ({
  isRunning,
  onStart,
  onStop,
  onPause,
  onCancel,
}) => {
  const theme = useTheme();
  const { t } = useLanguage();

  return (
    <Stack direction="row" spacing={2} sx={{ mt: 2 }} justifyContent="center">
      {!isRunning ? (
        <Button
          variant="contained"
          startIcon={<PlayArrow />}
          onClick={onStart}
          size="large"
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: 8,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.light, 0.8)})`,
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
            },
          }}
        >
          {t('timer.start')}
        </Button>
      ) : (
        <>
          <Button
            variant="contained"
            startIcon={<Check />}
            onClick={onStop}
            color="success"
            sx={{
              px: 3,
              borderRadius: 8,
              transition: 'transform 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
              },
            }}
          >
            {t('timer.stop')}
          </Button>

          {onPause && (
            <Button
              variant="outlined"
              startIcon={<Pause />}
              onClick={onPause}
              color="primary"
              sx={{
                px: 3,
                borderRadius: 8,
                borderWidth: 2,
                transition: 'transform 0.2s ease',
                '&:hover': {
                  borderWidth: 2,
                  transform: 'translateY(-2px)',
                },
              }}
            >
              {t('timer.manual.title')}
            </Button>
          )}

          {onCancel && (
            <Button
              variant="text"
              startIcon={<Close />}
              onClick={onCancel}
              color="inherit"
              sx={{
                px: 3,
                borderRadius: 8,
                '&:hover': {
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                },
              }}
            >
              {t('projects.cancel')}
            </Button>
          )}
        </>
      )}
    </Stack>
  );
};
