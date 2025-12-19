import React from 'react';
import {
  Box,
  Typography,
  Divider,
  Button,
  Alert,
  Card,
  CardContent,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  Science as ScienceIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
} from '@mui/icons-material';

interface TestModeSettingsProps {
  isTestMode: boolean;
  testDataStats: { projectCount: number; timeEntryCount: number };
  onToggleTestMode: () => void;
  onRegenerateTestData: () => void;
}

export const TestModeSettings: React.FC<TestModeSettingsProps> = ({
  isTestMode,
  testDataStats,
  onToggleTestMode,
  onRegenerateTestData,
}) => {
  const theme = useTheme();

  return (
    <Card
      elevation={1}
      sx={{
        transition: 'transform 0.2s, box-shadow 0.2s',
        backgroundColor:
          theme.palette.mode === 'dark'
            ? 'rgba(255, 152, 0, 0.08)'
            : 'rgba(255, 152, 0, 0.04)',
        borderColor: theme.palette.warning.main,
        borderWidth: 1,
        borderStyle: 'solid',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[4],
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <ScienceIcon sx={{ mr: 1, color: theme.palette.warning.main }} />
          <Typography variant="h6">テストモード（開発用）</Typography>
          <Box sx={{ ml: 'auto' }}>
            <IconButton
              onClick={onToggleTestMode}
              color={isTestMode ? 'warning' : 'default'}
              size="large"
            >
              {isTestMode ? (
                <ToggleOnIcon fontSize="large" />
              ) : (
                <ToggleOffIcon fontSize="large" />
              )}
            </IconButton>
          </Box>
        </Box>
        <Divider sx={{ mb: 3 }} />

        <Alert severity={isTestMode ? 'warning' : 'info'} sx={{ mb: 3 }}>
          <Typography variant="body2">
            {isTestMode
              ? '現在テストモードで動作中です。実データは表示されず、変更も保存されません。'
              : 'テストモードを有効にすると、実データとは完全に分離されたテスト環境で動作します。'}
          </Typography>
        </Alert>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {isTestMode ? (
            <>
              テストモードで動作中です。
              <Box component="span" sx={{ display: 'block', mt: 1 }}>
                プロジェクト数: {testDataStats.projectCount} / 作業履歴:{' '}
                {testDataStats.timeEntryCount}
              </Box>
            </>
          ) : (
            'テストモードを有効にすると、デモ用のサンプルデータでアプリケーションを操作できます。'
          )}
        </Typography>

        {isTestMode && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="warning"
              startIcon={<ScienceIcon />}
              onClick={onRegenerateTestData}
            >
              テストデータを再生成
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
