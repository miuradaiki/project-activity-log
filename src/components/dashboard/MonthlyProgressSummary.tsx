import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Grid,
  useTheme,
} from '@mui/material';
import { CalendarToday, Speed } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Project, TimeEntry } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { GlassCard } from '../ui/modern/StyledComponents';
import {
  calculateTotalMonthlyTarget,
  calculateRemainingWorkingDays,
} from '../../utils/analytics';
import { getDailyWorkHours } from '../../utils/analytics';
import { formatHours } from '../../utils/formatters/timeFormatters';

interface MonthlyProgressSummaryProps {
  projects: Project[];
  timeEntries: TimeEntry[];
}

export const MonthlyProgressSummary: React.FC<MonthlyProgressSummaryProps> = ({
  projects,
  timeEntries,
}) => {
  const theme = useTheme();
  const { t, language } = useLanguage();
  const { settings } = useSettingsContext();

  const isEnglish = language === 'en';

  // 今月の作業時間を計算
  const monthlyData = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const today = new Date();

    let totalHours = 0;
    const currentDate = new Date(startOfMonth);

    while (currentDate <= today) {
      totalHours += getDailyWorkHours(timeEntries, new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return totalHours;
  }, [timeEntries]);

  // 目標時間の合計
  const totalTargetHours = useMemo(() => {
    return calculateTotalMonthlyTarget(
      projects,
      settings.workHours.baseMonthlyHours
    );
  }, [projects, settings.workHours.baseMonthlyHours]);

  // 進捗率
  const progressPercentage = useMemo(() => {
    if (totalTargetHours === 0) return 0;
    return Math.min(Math.round((monthlyData / totalTargetHours) * 100), 100);
  }, [monthlyData, totalTargetHours]);

  // 残り営業日数
  const remainingDays = useMemo(() => {
    return calculateRemainingWorkingDays();
  }, []);

  // 必要なペース（残り時間 / 残り日数）
  const requiredPace = useMemo(() => {
    if (remainingDays === 0) return 0;
    const remainingHours = Math.max(0, totalTargetHours - monthlyData);
    return Number((remainingHours / remainingDays).toFixed(1));
  }, [totalTargetHours, monthlyData, remainingDays]);

  // 進捗バーの色を決定
  const getProgressColor = () => {
    if (progressPercentage >= 100) return theme.palette.success.main;
    if (progressPercentage >= 90) return theme.palette.warning.main;
    return theme.palette.primary.main;
  };

  // 月の表示
  const getMonthDisplay = () => {
    const now = new Date();
    if (isEnglish) {
      return now.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });
    }
    return `${now.getFullYear()}年${now.getMonth() + 1}月`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <GlassCard sx={{ p: { xs: 2, md: 3 } }}>
        {/* ヘッダー */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {t('dashboard.monthly.summary.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {getMonthDisplay()}
          </Typography>
        </Box>

        <Grid container spacing={3} alignItems="center">
          {/* 大きなプログレスリング */}
          <Grid
            size={{
              xs: 12,
              md: 4,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
              >
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                  {/* 背景の円 */}
                  <CircularProgress
                    variant="determinate"
                    value={100}
                    size={140}
                    thickness={4}
                    sx={{
                      color:
                        theme.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.1)'
                          : 'rgba(0,0,0,0.08)',
                    }}
                  />
                  {/* 進捗の円 */}
                  <CircularProgress
                    variant="determinate"
                    value={progressPercentage}
                    size={140}
                    thickness={4}
                    sx={{
                      color: getProgressColor(),
                      position: 'absolute',
                      left: 0,
                      '& .MuiCircularProgress-circle': {
                        strokeLinecap: 'round',
                        transition: 'stroke-dasharray 1s ease-out',
                      },
                    }}
                  />
                  {/* 中央のテキスト */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, type: 'spring' }}
                    >
                      <Typography
                        variant="h3"
                        sx={{
                          fontWeight: 700,
                          color: getProgressColor(),
                          lineHeight: 1,
                        }}
                      >
                        {progressPercentage}
                      </Typography>
                    </motion.div>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontWeight: 500 }}
                    >
                      %
                    </Typography>
                  </Box>
                </Box>
              </motion.div>
            </Box>
          </Grid>

          {/* 統計情報 */}
          <Grid
            size={{
              xs: 12,
              md: 8,
            }}
          >
            <Grid container spacing={2}>
              {/* 作業時間 / 目標時間 */}
              <Grid size={12}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    {t('dashboard.monthly.summary.worked')} /{' '}
                    {t('dashboard.monthly.summary.target')}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {formatHours(monthlyData)}h{' '}
                    <Typography
                      component="span"
                      variant="body1"
                      color="text.secondary"
                    >
                      / {formatHours(totalTargetHours)}h
                    </Typography>
                  </Typography>
                </Box>
              </Grid>

              {/* 残り営業日 */}
              <Grid size={6}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    border: `1px solid ${theme.palette.divider}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <CalendarToday
                    fontSize="small"
                    sx={{ color: theme.palette.text.secondary }}
                  />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {t('dashboard.monthly.summary.remaining.days')}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {remainingDays} {t('units.days')}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* 必要ペース */}
              <Grid size={6}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    border: `1px solid ${theme.palette.divider}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Speed
                    fontSize="small"
                    sx={{ color: theme.palette.text.secondary }}
                  />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {t('dashboard.monthly.summary.required.pace')}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {requiredPace}h{t('dashboard.monthly.summary.per.day')}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </GlassCard>
    </motion.div>
  );
};
