import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
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
} from '@mui/icons-material';
import { useSettingsContext } from '../../contexts/SettingsContext';

/**
 * アプリケーション設定画面コンポーネント
 */
export const SettingsView: React.FC = () => {
  const theme = useTheme();
  const { settings, isLoading, updateBaseMonthlyHours } = useSettingsContext();
  const { language, setLanguage, t } = useLanguage();
  
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
  const showNotification = (message: string, severity: 'success' | 'error' | 'info') => {
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
                <Typography variant="h6">{t('settings.monthly.hours')}</Typography>
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
                      onChange={(_, newValue) => setBaseMonthlyHours(newValue as number)}
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
                        endAdornment: <InputAdornment position="end">{t('units.hours')}</InputAdornment>,
                      }}
                      variant="outlined"
                      size="small"
                      fullWidth
                    />
                  </Grid>
                </Grid>
                
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  {t('settings.monthly.hours.example', { hours: (baseMonthlyHours * 0.5).toFixed(1) })}
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
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
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
