import React, { useEffect, useState, useCallback } from 'react';
import { Box, Typography, IconButton, useTheme } from '@mui/material';
import { PlayArrow, Stop } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { Project } from '../../types';
import { formatElapsedTime } from '../../utils/time';
import { GradientCard } from '../ui/modern/StyledComponents';

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

  const calculateElapsed = useCallback(() => {
    if (!startTime) return '00:00:00';
    const diff = new Date().getTime() - new Date(startTime).getTime();
    return formatElapsedTime(diff);
  }, [startTime]);

  useEffect(() => {
    let intervalId: number;

    if (isRunning && startTime) {
      // 初回計算
      setElapsed(calculateElapsed());

      // 1秒ごとに更新
      intervalId = window.setInterval(() => {
        const currentElapsed =
          new Date().getTime() - new Date(startTime).getTime();

        // 8時間（28800000ミリ秒）を超えた場合、タイマーを自動停止
        if (currentElapsed >= 8 * 60 * 60 * 1000) {
          onStop();
          // 通知を表示
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

  // コンポーネントマウント時に経過時間を再計算
  useEffect(() => {
    if (isRunning && startTime) {
      setElapsed(calculateElapsed());
    }
  }, [isRunning, startTime, calculateElapsed]);

  const theme = useTheme();

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
          p: 4, // パディングを増やして余裕を持たせる
          position: 'relative',
          overflow: 'visible !important',
          minHeight: '160px', // 2行のプロジェクト名とタイマーが収まるよう高さを調整
          borderRadius: 3, // より角丸を強調して視覚的な親しみやすさを向上
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
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* プロジェクト名を中央に配置 */}
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
                mx: 'auto', // 水平方向の中央寄せ
                px: { xs: 4, sm: 6, md: 8 }, // 十分な左右パディング
                maxWidth: 'calc(100% - 32px)', // 左右の余白を確保
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
                  whiteSpace: 'nowrap', // 1行表示に戻して確実に中央寄せ
                  mx: 'auto',
                  display: 'block', // webkit-boxを削除
                }}
                title={project.name}
              >
                {project.name}
              </Typography>
            </Box>
          </motion.div>

          {/* タイマーとボタンを下部に配置 */}
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
            {/* Modern timer display */}
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
                  textAlign: 'center', // タイマー表示を中央寄せ
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

            {/* Modern control button */}
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
          </Box>
        </Box>

        {/* Animated background particles for active state */}
        <AnimatePresence>
          {isRunning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                pointerEvents: 'none',
                overflow: 'hidden',
              }}
            >
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    x: Math.random() * 400,
                    y: Math.random() * 200,
                    scale: 0,
                  }}
                  animate={{
                    x: Math.random() * 400,
                    y: Math.random() * 200,
                    scale: [0, 1, 0],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                  style={{
                    position: 'absolute',
                    width: 4 + Math.random() * 8,
                    height: 4 + Math.random() * 8,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.3)',
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </GradientCard>
    </motion.div>
  );
};
