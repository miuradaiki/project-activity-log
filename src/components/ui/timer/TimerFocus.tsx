import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import {
  Box,
  Typography,
  IconButton,
  TextField,
  useTheme,
  Fade,
  Tooltip,
  Card,
  CardContent,
  alpha,
  Button,
  Stack,
} from '@mui/material';
import {
  PlayArrow,
  Stop,
  Pause,
  Check,
  Close,
  Edit as EditIcon,
  TimerOutlined,
} from '@mui/icons-material';
import { Project } from '../../../types';
import { formatElapsedTime } from '../../../utils/time';

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
  const [elapsed, setElapsed] = useState<string>('00:00:00');
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [note, setNote] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const calculateElapsed = useCallback(() => {
    if (!startTime) return { text: '00:00:00', ms: 0 };
    const diff = new Date().getTime() - new Date(startTime).getTime();
    return {
      text: formatElapsedTime(diff),
      ms: diff,
    };
  }, [startTime]);

  useEffect(() => {
    let intervalId: number;

    if (isRunning && startTime) {
      // 初回計算
      const { text, ms } = calculateElapsed();
      setElapsed(text);
      setElapsedMs(ms);

      // 1秒ごとに更新
      intervalId = window.setInterval(() => {
        const currentElapsed =
          new Date().getTime() - new Date(startTime).getTime();

        // 8時間（28800000ミリ秒）を超えた場合、タイマーを自動停止
        if (currentElapsed >= 8 * 60 * 60 * 1000) {
          onStop();
          // 通知を表示
          new Notification(t('timer.notification.maxtime'), {
            body: t('timer.notification.maxtime.body'),
          });
        } else {
          setElapsed(formatElapsedTime(currentElapsed));
          setElapsedMs(currentElapsed);
        }
      }, 1000);
    }

    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [isRunning, startTime, calculateElapsed, onStop]);

  // コンポーネントマウント時に経過時間を再計算
  useEffect(() => {
    if (isRunning && startTime) {
      const { text, ms } = calculateElapsed();
      setElapsed(text);
      setElapsedMs(ms);
    }
  }, []);

  // 経過時間に基づいて色を決定
  const getTimerColor = () => {
    const maxDuration = 8 * 60 * 60 * 1000; // 8時間（ミリ秒）
    const progress = Math.min((elapsedMs / maxDuration) * 100, 100);

    if (progress >= 90) return theme.palette.error.main;
    if (progress >= 75) return theme.palette.warning.main;
    return theme.palette.primary.main;
  };

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

  const timerColor = getTimerColor();

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
      {/* プロジェクト情報ヘッダー */}
      <Box
        sx={{
          p: 3,
          pb: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box display="flex" alignItems="center">
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
          <Typography variant="h6" fontWeight="medium">
            {project.name}
          </Typography>
        </Box>

        {onAddNote && (
          <Tooltip title={t('timer.description')}>
            <IconButton
              onClick={() => setIsEditing(true)}
              color="primary"
              size="small"
              sx={{ ml: 1 }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* タイマーディスプレイ */}
      <Box
        sx={{
          p: 4,
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

        {/* タイマーコントロール */}
        <Stack
          direction="row"
          spacing={2}
          sx={{ mt: 2 }}
          justifyContent="center"
        >
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
      </Box>

      {/* メモ入力フィールド */}
      {isEditing && onAddNote && (
        <Fade in={isEditing}>
          <Box sx={{ px: 3, pb: 3, pt: isEditing ? 0 : 3 }}>
            <TextField
              fullWidth
              multiline
              rows={2}
              variant="outlined"
              placeholder={t('timer.description')}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              autoFocus
              sx={{ mb: 1 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button
                variant="text"
                size="small"
                onClick={() => {
                  setIsEditing(false);
                  setNote('');
                }}
                startIcon={<Close fontSize="small" />}
              >
                {t('projects.cancel')}
              </Button>
              <Button
                variant="contained"
                size="small"
                color="primary"
                onClick={() => {
                  if (note.trim()) {
                    onAddNote(note);
                    setNote('');
                  }
                  setIsEditing(false);
                }}
                startIcon={<Check fontSize="small" />}
              >
                {t('actions.save')}
              </Button>
            </Box>
          </Box>
        </Fade>
      )}
    </Card>
  );
};
