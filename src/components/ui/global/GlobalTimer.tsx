import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import {
  Box,
  Typography,
  IconButton,
  useTheme,
  Tooltip,
  Paper,
  alpha,
  Fade,
} from '@mui/material';
import {
  Stop,
  TimerOutlined,
} from '@mui/icons-material';
import { Project } from '../../../types';
import { formatElapsedTime } from '../../../utils/time';

interface GlobalTimerProps {
  project: Project | null;
  isRunning: boolean;
  startTime: string | null;
  onStop: () => void;
  onClick?: () => void;
}

export const GlobalTimer: React.FC<GlobalTimerProps> = ({
  project,
  isRunning,
  startTime,
  onStop,
  onClick,
}) => {
  const theme = useTheme();
  const { t } = useLanguage();
  const [elapsed, setElapsed] = useState<string>('00:00:00');
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [expanded, setExpanded] = useState<boolean>(false);

  const calculateElapsed = useCallback(() => {
    if (!startTime) return { text: '00:00:00', ms: 0 };
    const diff = new Date().getTime() - new Date(startTime).getTime();
    return {
      text: formatElapsedTime(diff),
      ms: diff,
    };
  }, [startTime]);

  // タイマーの更新処理
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
  }, [isRunning, startTime, calculateElapsed, onStop, t]);

  // コンポーネントマウント時に経過時間を再計算
  useEffect(() => {
    if (isRunning && startTime) {
      const { text, ms } = calculateElapsed();
      setElapsed(text);
      setElapsedMs(ms);
    }
  }, [isRunning, startTime, calculateElapsed]);

  // タイマーの表示/非表示を制御
  useEffect(() => {
    if (isRunning) {
      setExpanded(true);
    }
  }, [isRunning]);

  // 経過時間に基づいて色を決定
  const getTimerColor = () => {
    const maxDuration = 8 * 60 * 60 * 1000; // 8時間（ミリ秒）
    const progress = Math.min((elapsedMs / maxDuration) * 100, 100);

    if (progress >= 90) return theme.palette.error.main;
    if (progress >= 75) return theme.palette.warning.main;
    return theme.palette.primary.main;
  };

  // プロジェクトが存在しないか、タイマーが動いていない場合は表示しない
  if (!project || !isRunning) {
    return null;
  }

  const timerColor = getTimerColor();

  return (
    <Fade in={expanded}>
      <Paper
        elevation={3}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24, // 左から右に変更
          zIndex: 1200,
          borderRadius: theme.shape.borderRadius,
          overflow: 'hidden',
          bgcolor: 'background.paper',
          border: `1px solid ${alpha(timerColor, 0.3)}`,
          boxShadow: `0 4px 12px ${alpha(timerColor, 0.2)}`,
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `0 6px 16px ${alpha(timerColor, 0.3)}`,
          },
          maxWidth: 300,
        }}
        onClick={onClick}
      >
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          {/* プロジェクト名とステータスインジケーター */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: timerColor,
                mr: 1,
                boxShadow: `0 0 10px ${timerColor}`,
                animation: 'pulse 1.5s infinite ease-in-out',
                '@keyframes pulse': {
                  '0%': { opacity: 0.5, transform: 'scale(0.8)' },
                  '50%': { opacity: 1, transform: 'scale(1.2)' },
                  '100%': { opacity: 0.5, transform: 'scale(0.8)' },
                },
              }}
            />
            <Box>
              <Typography
                variant="subtitle2"
                component="div"
                noWrap
                sx={{
                  maxWidth: 150,
                  fontWeight: 'bold',
                }}
              >
                {project.name}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <TimerOutlined
                  fontSize="inherit"
                  sx={{ mr: 0.5, color: timerColor }}
                />
                {elapsed}
              </Typography>
            </Box>
          </Box>

          {/* 停止ボタン */}
          <Tooltip title={t('timer.stop')}>
            <IconButton
              color="error"
              size="small"
              onClick={(e) => {
                e.stopPropagation(); // クリックイベントの伝播を止める
                onStop();
              }}
              sx={{
                bgcolor: alpha(theme.palette.error.main, 0.1),
                '&:hover': {
                  bgcolor: alpha(theme.palette.error.main, 0.2),
                },
              }}
            >
              <Stop fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>
    </Fade>
  );
};
