import React, { useState } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import {
  Box,
  Typography,
  IconButton,
  useTheme,
  Tooltip,
  Card,
  alpha,
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { Project } from '../../../types';
import { useElapsedTime } from './hooks/useElapsedTime';
import { TimerDisplay } from './TimerDisplay';
import { TimerControls } from './TimerControls';
import { NoteEditor } from './NoteEditor';

interface TimerFocusProps {
  project: Project | null;
  isRunning: boolean;
  startTime: string | null;
  onStart: () => void;
  onStop: () => void;
  onPause?: () => void;
  onCancel?: () => void;
  onAddNote?: (note: string) => void;
}

export const TimerFocus: React.FC<TimerFocusProps> = ({
  project,
  isRunning,
  startTime,
  onStart,
  onStop,
  onPause,
  onCancel,
  onAddNote,
}) => {
  const theme = useTheme();
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const { elapsed, timerColor } = useElapsedTime({
    isRunning,
    startTime,
    onStop,
  });

  if (!project) {
    return (
      <Card
        elevation={2}
        sx={{
          p: 4,
          mb: 4,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 200,
          borderRadius: 2,
          mx: 'auto',
          maxWidth: 600,
        }}
      >
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {t('timer.project')} {t('timer.no.entries')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('timer.title')} {t('timer.description')}
        </Typography>
      </Card>
    );
  }

  const handleAddNote = (note: string) => {
    if (onAddNote) {
      onAddNote(note);
    }
  };

  return (
    <Card
      elevation={3}
      sx={{
        mb: 4,
        borderRadius: theme.shape.borderRadius,
        position: 'relative',
        overflow: 'hidden',
        bgcolor: 'background.paper',
        mx: 'auto',
        maxWidth: { xs: '100%', sm: 600, md: 700 },
        transition: 'all 0.3s ease-in-out',
        border: isRunning ? `1px solid ${alpha(timerColor, 0.3)}` : 'none',
        boxShadow: isRunning
          ? `0 0 20px ${alpha(timerColor, 0.2)}`
          : '0 8px 16px rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* Project Header */}
      <Box
        sx={{
          p: 3,
          pb: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          width="100%"
          sx={{ textAlign: 'center' }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: isRunning ? timerColor : 'grey.400',
              mr: 1.5,
              boxShadow: isRunning ? `0 0 10px ${timerColor}` : 'none',
              animation: isRunning ? 'pulse 1.5s infinite ease-in-out' : 'none',
              '@keyframes pulse': {
                '0%': { opacity: 0.5, transform: 'scale(0.8)' },
                '50%': { opacity: 1, transform: 'scale(1.2)' },
                '100%': { opacity: 0.5, transform: 'scale(0.8)' },
              },
            }}
          />
          <Typography
            variant="h6"
            fontWeight="medium"
            sx={{
              textAlign: 'center',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '100%',
            }}
          >
            {project.name}
          </Typography>
        </Box>

        {onAddNote && (
          <Tooltip title={t('timer.description')}>
            <IconButton
              onClick={() => setIsEditing(true)}
              color="primary"
              size="small"
              sx={{
                position: 'absolute',
                right: 16,
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Timer Display */}
      <Box sx={{ p: 4 }}>
        <TimerDisplay
          elapsed={elapsed}
          isRunning={isRunning}
          timerColor={timerColor}
        />

        <TimerControls
          isRunning={isRunning}
          onStart={onStart}
          onStop={onStop}
          onPause={onPause}
          onCancel={onCancel}
        />
      </Box>

      {/* Note Editor */}
      {onAddNote && (
        <NoteEditor
          isEditing={isEditing}
          onSave={handleAddNote}
          onCancel={() => setIsEditing(false)}
        />
      )}
    </Card>
  );
};
