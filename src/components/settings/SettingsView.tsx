import React, { useState, useCallback } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { isTestDataEnabled } from '../../utils/env';
import {
  Box,
  Paper,
  Typography,
  Divider,
  TextField,
  Button,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Grid,
  InputAdornment,
  Slider,
  IconButton,
  Tooltip,
  useTheme,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Info as InfoIcon,
  Translate as TranslateIcon,
  Science as ScienceIcon,
  DeleteSweep as DeleteSweepIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
} from '@mui/icons-material';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { useStorage } from '../../hooks/useStorage';
import { Project, TimeEntry } from '../../types';

/**
 * アプリケーション設定画面コンポーネント
 */
export const SettingsView: React.FC = () => {
  const theme = useTheme();
  const { settings, isLoading, updateBaseMonthlyHours } = useSettingsContext();
  const { language, setLanguage, t } = useLanguage();
  const {
    projects,
    timeEntries,
    setProjects,
    setTimeEntries,
    isTestMode,
    toggleTestMode,
    testDataStats,
  } = useStorage();

  // テストデータ機能の有効化フラグ（環境変数から取得）
  const testDataFeatureEnabled = isTestDataEnabled();

  // 月間基準時間の編集用ステート
  const [baseMonthlyHours, setBaseMonthlyHours] = useState<number>(
    settings?.workHours?.baseMonthlyHours || 140
  );

  // 通知用ステート
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  // 設定の変更を保存
  const handleSaveBaseMonthlyHours = async () => {
    try {
      await updateBaseMonthlyHours(baseMonthlyHours);
      showNotification(t('settings.monthly.hours.saved'), 'success');
    } catch (error) {
      showNotification(t('settings.save.error'), 'error');
    }
  };

  // 言語設定の変更
  const handleLanguageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLanguage(event.target.value as 'ja' | 'en');
    showNotification(t('settings.language.changed'), 'success');
  };

  // デフォルト設定にリセット
  const handleResetSettings = async () => {
    try {
      await updateBaseMonthlyHours(140); // デフォルト値にリセット
      setBaseMonthlyHours(140); // デフォルト値にリセット
      showNotification(t('settings.reset.success'), 'success');
    } catch (error) {
      showNotification(t('settings.reset.error'), 'error');
    }
  };

  // 通知表示
  const showNotification = (
    message: string,
    severity: 'success' | 'error' | 'info'
  ) => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  // 通知を閉じる
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false,
    });
  };

  // テストモードの切り替え
  const handleToggleTestMode = useCallback(() => {
    const newMode = !isTestMode;
    toggleTestMode(newMode);
    showNotification(
      newMode ? 'テストモードに切り替えました' : '通常モードに切り替えました',
      'success'
    );
  }, [isTestMode, toggleTestMode]);

  // テストデータを再生成する関数（テストモード時のみ）
  const handleRegenerateTestData = useCallback(async () => {
    try {
      const { generateTestData } = await import(
        '../../utils/testDataGenerator'
      );
      const { projects: newProjects, timeEntries: newTimeEntries } =
        generateTestData([], []);

      setProjects(newProjects);
      setTimeEntries(newTimeEntries);

      showNotification('テストデータを再生成しました', 'success');
    } catch (error) {
      console.error('テストデータ生成エラー:', error);
      const errorMessage =
        error instanceof Error ? error.message : '不明なエラー';
      showNotification(
        `テストデータの生成に失敗しました: ${errorMessage}`,
        'error'
      );
    }
  }, [setProjects, setTimeEntries]);

  // テストデータのクリアは不要になったので削除

  if (isLoading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography>{t('settings.loading')}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      <Typography variant="h5" fontWeight="medium" sx={{ mb: 3 }}>
        {t('settings.title')}
      </Typography>

      <Grid container spacing={3}>
        {/* 稼働時間設定カード */}
        <Grid item xs={12}>
          <Card
            elevation={1}
            sx={{
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[4],
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccessTimeIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  {t('settings.monthly.hours')}
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />

              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography id="monthly-hours-slider" gutterBottom>
                    {t('settings.monthly.hours')}
                  </Typography>
                  <Tooltip title={t('settings.monthly.hours.description')}>
                    <IconButton size="small" sx={{ ml: 1 }}>
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>

                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={8}>
                    <Slider
                      value={baseMonthlyHours}
                      onChange={(_, newValue) =>
                        setBaseMonthlyHours(newValue as number)
                      }
                      aria-labelledby="monthly-hours-slider"
                      valueLabelDisplay="auto"
                      step={5}
                      marks={[
                        { value: 100, label: '100h' },
                        { value: 140, label: '140h' },
                        { value: 180, label: '180h' },
                      ]}
                      min={80}
                      max={200}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      label="月間時間"
                      type="number"
                      value={baseMonthlyHours}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        if (value >= 80 && value <= 200) {
                          setBaseMonthlyHours(value);
                        }
                      }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            {t('units.hours')}
                          </InputAdornment>
                        ),
                      }}
                      variant="outlined"
                      size="small"
                      fullWidth
                    />
                  </Grid>
                </Grid>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 2 }}
                >
                  {t('settings.monthly.hours.example', {
                    hours: (baseMonthlyHours * 0.5).toFixed(1),
                  })}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={handleResetSettings}
                >
                  {t('settings.reset')}
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveBaseMonthlyHours}
                >
                  {t('settings.save')}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 言語設定カード */}
        <Grid item xs={12}>
          <Card
            elevation={1}
            sx={{
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[4],
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TranslateIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">{t('settings.language')}</Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />

              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {t('settings.language.description')}
                </Typography>

                <FormControl component="fieldset">
                  <RadioGroup
                    aria-label="language"
                    name="language"
                    value={language}
                    onChange={handleLanguageChange}
                  >
                    <FormControlLabel
                      value="ja"
                      control={<Radio />}
                      label={t('language.japanese')}
                    />
                    <FormControlLabel
                      value="en"
                      control={<Radio />}
                      label={t('language.english')}
                    />
                  </RadioGroup>
                </FormControl>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* テストデータカード（開発環境のみ） */}
        {testDataFeatureEnabled && (
          <Grid item xs={12}>
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
                  <ScienceIcon
                    sx={{ mr: 1, color: theme.palette.warning.main }}
                  />
                  <Typography variant="h6">テストモード（開発用）</Typography>
                  <Box sx={{ ml: 'auto' }}>
                    <IconButton
                      onClick={handleToggleTestMode}
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

                <Alert
                  severity={isTestMode ? 'warning' : 'info'}
                  sx={{ mb: 3 }}
                >
                  <Typography variant="body2">
                    {isTestMode
                      ? '現在テストモードで動作中です。実データは表示されず、変更も保存されません。'
                      : 'テストモードを有効にすると、実データとは完全に分離されたテスト環境で動作します。'}
                  </Typography>
                </Alert>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
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
                      onClick={handleRegenerateTestData}
                    >
                      テストデータを再生成
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* 通知 */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
          elevation={6}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
