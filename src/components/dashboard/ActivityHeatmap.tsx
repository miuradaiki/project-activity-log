import React, { useMemo } from 'react';
import { Box, Typography, Tooltip, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { TimeEntry } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { GlassCard } from '../ui/modern/StyledComponents';
import {
  generateHeatmapData,
  getRolling12MonthRange,
  HeatmapDay,
} from '../../utils/analytics/heatmap';

interface ActivityHeatmapProps {
  timeEntries: TimeEntry[];
  onDayClick?: (date: Date, hours: number) => void;
}

// ヒートマップのカラーを動的に生成（テーマのプライマリカラーを使用）
const getHeatmapColors = (theme: ReturnType<typeof useTheme>) => {
  const isDark = theme.palette.mode === 'dark';

  if (isDark) {
    // ダークモード: 暗い→明るいへのグラデーション
    return {
      0: '#1f2937', // grey-800
      1: '#1e3a8a', // blue-900
      2: '#2563eb', // blue-600
      3: '#3b82f6', // blue-500 (primary)
      4: '#60a5fa', // blue-400
    };
  }

  // ライトモード: 薄い→濃いへのグラデーション
  return {
    0: '#f3f4f6', // grey-100
    1: '#bfdbfe', // blue-200
    2: '#60a5fa', // blue-400
    3: '#3b82f6', // blue-500 (primary)
    4: '#1d4ed8', // blue-700 (primary.dark)
  };
};

// 月の短縮名
const MONTH_NAMES = {
  en: [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ],
  ja: [
    '1月',
    '2月',
    '3月',
    '4月',
    '5月',
    '6月',
    '7月',
    '8月',
    '9月',
    '10月',
    '11月',
    '12月',
  ],
};

// 曜日ラベル（月、水、金のみ表示）
const DAY_LABELS = {
  en: ['', 'Mon', '', 'Wed', '', 'Fri', ''],
  ja: ['', '月', '', '水', '', '金', ''],
};

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({
  timeEntries,
  onDayClick,
}) => {
  const theme = useTheme();
  const { t, language } = useLanguage();

  const isEnglish = language === 'en';
  const colors = getHeatmapColors(theme);

  // ヒートマップデータを生成
  const { heatmapData, monthLabels } = useMemo(() => {
    const { start, end } = getRolling12MonthRange();
    const data = generateHeatmapData(timeEntries, start, end);

    // 月ラベルの位置を計算
    const labels: { month: number; weekIndex: number }[] = [];
    let currentMonth = -1;

    data.forEach((week, weekIndex) => {
      const firstValidDay = week.days.find(
        (day): day is HeatmapDay => day !== null
      );
      if (firstValidDay) {
        const month = firstValidDay.date.getMonth();
        if (month !== currentMonth) {
          labels.push({ month, weekIndex });
          currentMonth = month;
        }
      }
    });

    return { heatmapData: data, monthLabels: labels };
  }, [timeEntries]);

  // 日付をフォーマット
  const formatDate = (date: Date): string => {
    if (isEnglish) {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日（${['日', '月', '火', '水', '木', '金', '土'][date.getDay()]}）`;
  };

  // ツールチップの内容
  const getTooltipContent = (day: HeatmapDay): string => {
    const dateStr = formatDate(day.date);
    const hoursStr = isEnglish
      ? `${day.hours.toFixed(1)} hours`
      : `${day.hours.toFixed(1)}時間`;
    return `${dateStr}: ${hoursStr}`;
  };

  const cellSize = 12;
  const cellGap = 3;
  const dayLabelWidth = 30;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <GlassCard
        sx={{
          p: { xs: 2, md: 3 },
          overflow: 'hidden',
        }}
      >
        {/* ヘッダー */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {t('dashboard.heatmap.title')}
          </Typography>

          {/* 凡例 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {t('dashboard.heatmap.less')}
            </Typography>
            {[0, 1, 2, 3, 4].map((level) => (
              <Box
                key={level}
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '2px',
                  bgcolor: colors[level as keyof typeof colors],
                }}
              />
            ))}
            <Typography variant="caption" color="text.secondary">
              {t('dashboard.heatmap.more')}
            </Typography>
          </Box>
        </Box>

        {/* ヒートマップ本体 */}
        <Box
          sx={{
            overflowX: 'auto',
            overflowY: 'hidden',
            pb: 1,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              minWidth: 'fit-content',
            }}
          >
            {/* 月ラベル */}
            <Box
              sx={{
                display: 'flex',
                ml: `${dayLabelWidth}px`,
                mb: 0.5,
              }}
            >
              {monthLabels.map(({ month, weekIndex }, index) => {
                const nextLabelIndex = monthLabels[index + 1]?.weekIndex;
                const width = nextLabelIndex
                  ? (nextLabelIndex - weekIndex) * (cellSize + cellGap)
                  : 4 * (cellSize + cellGap);

                return (
                  <Box
                    key={`${month}-${weekIndex}`}
                    sx={{
                      width: width,
                      flexShrink: 0,
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: '10px' }}
                    >
                      {isEnglish
                        ? MONTH_NAMES.en[month]
                        : MONTH_NAMES.ja[month]}
                    </Typography>
                  </Box>
                );
              })}
            </Box>

            {/* グリッド本体 */}
            <Box sx={{ display: 'flex' }}>
              {/* 曜日ラベル */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: `${dayLabelWidth}px`,
                  flexShrink: 0,
                }}
              >
                {(isEnglish ? DAY_LABELS.en : DAY_LABELS.ja).map(
                  (label, index) => (
                    <Box
                      key={index}
                      sx={{
                        height: cellSize + cellGap,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: '10px' }}
                      >
                        {label}
                      </Typography>
                    </Box>
                  )
                )}
              </Box>

              {/* 週のカラム */}
              <Box sx={{ display: 'flex', gap: `${cellGap}px` }}>
                {heatmapData.map((week, weekIndex) => (
                  <Box
                    key={weekIndex}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: `${cellGap}px`,
                    }}
                  >
                    {week.days.map((day, dayIndex) => (
                      <Tooltip
                        key={dayIndex}
                        title={day ? getTooltipContent(day) : ''}
                        arrow
                        placement="top"
                        disableHoverListener={!day}
                      >
                        <Box
                          onClick={() => {
                            if (day && onDayClick) {
                              onDayClick(day.date, day.hours);
                            }
                          }}
                          sx={{
                            width: cellSize,
                            height: cellSize,
                            borderRadius: '2px',
                            bgcolor: day ? colors[day.level] : 'transparent',
                            cursor: day && onDayClick ? 'pointer' : 'default',
                            transition: 'transform 0.1s, box-shadow 0.1s',
                            '&:hover': day
                              ? {
                                  transform: 'scale(1.2)',
                                  boxShadow: `0 0 4px ${colors[day.level]}`,
                                }
                              : {},
                          }}
                          aria-label={
                            day
                              ? `${formatDate(day.date)}: ${day.hours.toFixed(1)}${isEnglish ? ' hours' : '時間'}`
                              : undefined
                          }
                        />
                      </Tooltip>
                    ))}
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      </GlassCard>
    </motion.div>
  );
};
