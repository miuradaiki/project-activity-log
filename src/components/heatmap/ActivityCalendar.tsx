import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  useTheme,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  SelectChangeEvent,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { TimeEntry, Project } from '../../types';
import { getDailyWorkHours } from '../../utils/analytics';

interface ActivityCalendarProps {
  timeEntries: TimeEntry[];
  _projects: Project[];
}

/**
 * ヒートマップカレンダーコンポーネント
 * 月ごとの作業活動を視覚的に表示する
 */
export const ActivityCalendar: React.FC<ActivityCalendarProps> = ({
  timeEntries,
  _projects,
}) => {
  const theme = useTheme();
  const currentDate = useMemo(() => new Date(), []);

  // 表示する年月を管理
  const [year, setYear] = useState(currentDate.getFullYear());
  const [month, setMonth] = useState(currentDate.getMonth());

  // 前の月へ移動
  const goToPreviousMonth = () => {
    if (month === 0) {
      setYear(year - 1);
      setMonth(11);
    } else {
      setMonth(month - 1);
    }
  };

  // 次の月へ移動
  const goToNextMonth = () => {
    if (month === 11) {
      setYear(year + 1);
      setMonth(0);
    } else {
      setMonth(month + 1);
    }
  };

  // 現在の日付が表示月と同じか確認（今日の日付をハイライトするため）
  const isCurrentMonth = useMemo(() => {
    return (
      currentDate.getFullYear() === year && currentDate.getMonth() === month
    );
  }, [currentDate, year, month]);

  // 月の日数と開始曜日を計算
  const daysInMonth = useMemo(
    () => new Date(year, month + 1, 0).getDate(),
    [year, month]
  );
  const firstDayOfMonth = useMemo(
    () => new Date(year, month, 1).getDay(),
    [year, month]
  );

  // 月名を取得（現在は使用していないが、将来的に使用予定）
  const _monthName = useMemo(() => {
    return new Date(year, month).toLocaleDateString('ja-JP', { month: 'long' });
  }, [year, month]);

  // 曜日の配列（日本語表記）
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];

  // カレンダーのデータを生成
  const calendarData = useMemo(() => {
    const data = [];
    let day = 1;
    const rows = Math.ceil((daysInMonth + firstDayOfMonth) / 7);

    for (let i = 0; i < rows; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        if ((i === 0 && j < firstDayOfMonth) || day > daysInMonth) {
          // 月の最初の週で、月の開始日より前の日付または月の最終日を超えた場合
          week.push(null);
        } else {
          const date = new Date(year, month, day);
          const isToday = isCurrentMonth && day === currentDate.getDate();

          // その日の作業時間を計算
          const hoursWorked = getDailyWorkHours(timeEntries, date);

          week.push({
            day,
            date,
            isToday,
            hoursWorked,
          });
          day++;
        }
      }
      data.push(week);
    }

    return data;
  }, [
    year,
    month,
    daysInMonth,
    firstDayOfMonth,
    timeEntries,
    isCurrentMonth,
    currentDate,
  ]);

  // 時間に応じた色の濃さを決定
  const getColorIntensity = (hours: number) => {
    if (hours === 0) return 0;

    // 最大8時間で最高濃度になるよう設定（調整可能）
    const maxHours = 8;
    const intensity = Math.min(1, hours / maxHours);
    return intensity;
  };

  // ヒートマップの色を生成
  const getHeatMapColor = (hours: number) => {
    if (hours === 0)
      return theme.palette.mode === 'light'
        ? theme.palette.grey[100]
        : theme.palette.grey[900];

    const intensity = getColorIntensity(hours);

    // テーマに応じて色を変更（ダークモード対応）
    if (theme.palette.mode === 'light') {
      // 青のグラデーション（ライトモード）
      return `rgba(59, 130, 246, ${0.2 + intensity * 0.8})`;
    } else {
      // 青のグラデーション（ダークモード）
      return `rgba(96, 165, 250, ${0.3 + intensity * 0.7})`;
    }
  };

  // 年の選択肢を生成（現在の年を中心に前後2年）
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [
      currentYear - 2,
      currentYear - 1,
      currentYear,
      currentYear + 1,
      currentYear + 2,
    ];
  }, []);

  // 月の選択肢
  const monthOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => i);
  }, []);

  // 年の変更ハンドラ
  const handleYearChange = (event: SelectChangeEvent<number>) => {
    setYear(Number(event.target.value));
  };

  // 月の変更ハンドラ
  const handleMonthChange = (event: SelectChangeEvent<number>) => {
    setMonth(Number(event.target.value));
  };

  // 合計時間を計算
  const totalHoursInMonth = useMemo(() => {
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59);

    return timeEntries
      .filter((entry) => {
        const entryDate = new Date(entry.startTime);
        return entryDate >= startOfMonth && entryDate <= endOfMonth;
      })
      .reduce((total, entry) => {
        const startTime = new Date(entry.startTime).getTime();
        const endTime = entry.endTime
          ? new Date(entry.endTime).getTime()
          : new Date().getTime();
        return total + (endTime - startTime) / (1000 * 60 * 60);
      }, 0);
  }, [timeEntries, year, month]);

  return (
    <Paper
      elevation={1}
      sx={{
        p: 3,
        transition: 'box-shadow 0.2s',
        '&:hover': {
          boxShadow: theme.shadows[4],
        },
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight="medium">
          活動カレンダー
        </Typography>
        <Typography variant="body2" color="text.secondary">
          作業時間の分布を視覚化
        </Typography>
      </Box>

      {/* カレンダーヘッダー */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={goToPreviousMonth} size="small">
            <ChevronLeftIcon />
          </IconButton>

          <Box sx={{ display: 'flex', mx: 1, alignItems: 'center' }}>
            <FormControl
              variant="outlined"
              size="small"
              sx={{ minWidth: 80, mr: 1 }}
            >
              <Select
                value={year}
                onChange={handleYearChange}
                displayEmpty
              >
                {yearOptions.map((yearOption) => (
                  <MenuItem key={yearOption} value={yearOption}>
                    {yearOption}年
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl variant="outlined" size="small" sx={{ minWidth: 80 }}>
              <Select
                value={month}
                onChange={handleMonthChange}
                displayEmpty
              >
                {monthOptions.map((monthOption) => (
                  <MenuItem key={monthOption} value={monthOption}>
                    {monthOption + 1}月
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <IconButton onClick={goToNextMonth} size="small">
            <ChevronRightIcon />
          </IconButton>
        </Box>

        <Typography variant="body2" fontWeight="medium">
          合計: {totalHoursInMonth.toFixed(1)}時間
        </Typography>
      </Box>

      {/* カレンダーグリッド */}
      <Box>
        {/* 曜日ヘッダー */}
        <Grid container spacing={1}>
          {weekdays.map((day, index) => (
            <Grid item xs={12 / 7} key={index}>
              <Box
                sx={{
                  textAlign: 'center',
                  fontWeight: 'medium',
                  color:
                    index === 0 || index === 6
                      ? theme.palette.error.main
                      : 'inherit',
                  mb: 1,
                }}
              >
                <Typography variant="caption">{day}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* カレンダー本体 */}
        {calendarData.map((week, rowIndex) => (
          <Grid container spacing={1} key={`week-${rowIndex}`}>
            {week.map((day, colIndex) => (
              <Grid item xs={12 / 7} key={`day-${rowIndex}-${colIndex}`}>
                {day ? (
                  <Tooltip
                    title={`${year}年${month + 1}月${day.day}日: ${day.hoursWorked.toFixed(1)}時間`}
                    arrow
                  >
                    <Box
                      sx={{
                        height: 36,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: getHeatMapColor(day.hoursWorked),
                        borderRadius: '4px',
                        border: day.isToday
                          ? `2px solid ${theme.palette.primary.main}`
                          : '1px solid transparent',
                        position: 'relative',
                        transition: 'transform 0.1s',
                        '&:hover': {
                          transform: 'scale(1.05)',
                          boxShadow: theme.shadows[2],
                        },
                      }}
                    >
                      <Typography
                        variant="caption"
                        fontWeight={day.isToday ? 'bold' : 'regular'}
                        sx={{
                          color:
                            day.hoursWorked > 4 &&
                            theme.palette.mode === 'light'
                              ? 'white'
                              : 'inherit',
                        }}
                      >
                        {day.day}
                      </Typography>
                    </Box>
                  </Tooltip>
                ) : (
                  <Box
                    sx={{
                      height: 36,
                      backgroundColor: 'transparent',
                    }}
                  />
                )}
              </Grid>
            ))}
          </Grid>
        ))}
      </Box>

      {/* 凡例 */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          mt: 3,
          alignItems: 'center',
        }}
      >
        <Typography variant="caption" sx={{ mr: 1 }}>
          活動レベル:
        </Typography>
        {[0, 2, 4, 6, 8].map((hour, index) => (
          <Tooltip key={index} title={`${hour}時間`} arrow>
            <Box
              sx={{
                width: 20,
                height: 20,
                backgroundColor: getHeatMapColor(hour),
                borderRadius: '4px',
                mx: 0.5,
                border: `1px solid ${theme.palette.divider}`,
              }}
            />
          </Tooltip>
        ))}
      </Box>
    </Paper>
  );
};
