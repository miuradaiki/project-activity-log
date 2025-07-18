import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
  Button,
  Slide,
  useTheme,
  IconButton,
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import {
  Close as CloseIcon,
  EmojiEvents as TrophyIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { ConfettiEffect } from './ConfettiEffect';
import { Project } from '../../types';

// スライドトランジション
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface AchievementAlertProps {
  open: boolean;
  project?: Project;
  achievementType: 'completed' | 'milestone';
  milestoneName?: string;
  onClose: () => void;
}

/**
 * プロジェクト目標達成時の祝福アラートコンポーネント
 */
export const AchievementAlert: React.FC<AchievementAlertProps> = ({
  open,
  project,
  achievementType = 'completed',
  milestoneName,
  onClose,
}) => {
  const theme = useTheme();
  const [showConfetti, setShowConfetti] = useState(false);

  // ダイアログが開かれたときにコンフェッティを表示
  useEffect(() => {
    if (open) {
      setShowConfetti(true);
    } else {
      setShowConfetti(false);
    }
  }, [open]);

  // プロジェクト名の取得
  const projectName = project?.name || 'プロジェクト';

  // 達成タイプに応じたメッセージ
  const title =
    achievementType === 'completed'
      ? '目標達成おめでとうございます！'
      : 'マイルストーン達成！';

  const message =
    achievementType === 'completed'
      ? `${projectName}の月間目標を達成しました！素晴らしい成果です。`
      : `${projectName}が${milestoneName || 'マイルストーン'}に到達しました！`;

  return (
    <>
      {/* コンフェッティエフェクト */}
      <ConfettiEffect
        active={showConfetti}
        duration={5000}
        onComplete={() => setShowConfetti(false)}
      />

      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={onClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            position: 'relative',
            overflow: 'hidden',
          },
        }}
      >
        {/* 閉じるボタン */}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
            zIndex: 1,
          }}
        >
          <CloseIcon />
        </IconButton>

        {/* 背景のグラデーション */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100px',
            background: `linear-gradient(135deg, ${theme.palette.primary.main}88 0%, ${theme.palette.secondary.main}88 100%)`,
            zIndex: 0,
          }}
        />

        <DialogTitle sx={{ textAlign: 'center', pt: 5, pb: 2, zIndex: 1 }}>
          <Typography variant="h5" fontWeight="bold" color="white">
            {title}
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              py: 3,
            }}
          >
            {/* アイコン */}
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: theme.palette.background.paper,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: theme.shadows[4],
                mb: 3,
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': {
                    transform: 'scale(1)',
                    boxShadow: `0 0 0 0 ${
                      achievementType === 'completed'
                        ? theme.palette.primary.main + '80'
                        : theme.palette.secondary.main + '80'
                    }`,
                  },
                  '70%': {
                    transform: 'scale(1.05)',
                    boxShadow: `0 0 0 10px ${
                      achievementType === 'completed'
                        ? theme.palette.primary.main + '00'
                        : theme.palette.secondary.main + '00'
                    }`,
                  },
                  '100%': {
                    transform: 'scale(1)',
                    boxShadow: `0 0 0 0 ${
                      achievementType === 'completed'
                        ? theme.palette.primary.main + '00'
                        : theme.palette.secondary.main + '00'
                    }`,
                  },
                },
              }}
            >
              {achievementType === 'completed' ? (
                <TrophyIcon
                  sx={{
                    fontSize: 48,
                    color: theme.palette.primary.main,
                  }}
                />
              ) : (
                <CheckIcon
                  sx={{
                    fontSize: 48,
                    color: theme.palette.secondary.main,
                  }}
                />
              )}
            </Box>

            {/* メッセージ */}
            <Typography variant="body1" align="center" sx={{ mb: 3 }}>
              {message}
            </Typography>

            {/* 追加情報 */}
            {achievementType === 'completed' && (
              <Box
                sx={{
                  backgroundColor:
                    theme.palette.mode === 'light'
                      ? theme.palette.grey[100]
                      : theme.palette.grey[800],
                  borderRadius: 1,
                  p: 2,
                  mb: 3,
                  width: '100%',
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                >
                  この調子で次の目標も達成しましょう！
                  <br />
                  継続は力なり。
                </Typography>
              </Box>
            )}

            {/* 閉じるボタン */}
            <Button
              variant="contained"
              color={achievementType === 'completed' ? 'primary' : 'secondary'}
              onClick={onClose}
              sx={{
                minWidth: 120,
                borderRadius: 28,
                boxShadow: theme.shadows[3],
                '&:hover': {
                  boxShadow: theme.shadows[8],
                },
              }}
            >
              閉じる
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};
