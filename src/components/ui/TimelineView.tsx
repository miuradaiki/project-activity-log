import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  Box,
  Typography,
  Paper,
  useTheme,
  IconButton,
  Chip,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { TimeEntry, Project } from '../../types';
import { intervalToDuration } from 'date-fns';

interface TimelineViewProps {
  timeEntries: TimeEntry[];
  projects: Project[];
  onEdit: (entry: TimeEntry) => void;
  onDelete: (entry: TimeEntry) => void;
}

/**
 * 作業履歴をタイムライン形式で表示するコンポーネント
 */
export const TimelineView: React.FC<TimelineViewProps> = ({
  timeEntries,
  projects,
  onEdit,
  onDelete,
}) => {
  const theme = useTheme();
  const { t, language } = useLanguage();
  const isEnglish = language === 'en';

  // 日付をフォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    if (isEnglish) {
      // 英語形式: "Feb 28, 2025 (Fri)"
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        weekday: 'short',
      };
      return date.toLocaleDateString('en-US', options);
    } else {
      // 日本語形式: "2025/02/28(金)"
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        weekday: 'short',
      };
      return date.toLocaleDateString('ja-JP', options);
    }
  };

  // 時間をフォーマット
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(isEnglish ? 'en-US' : 'ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 作業時間を計算して表示
  const formatDuration = (startTime: string, endTime: string | null) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();

    // 時間と分を計算
    const duration = intervalToDuration({ start, end });
    const hours = duration.hours || 0;
    const minutes = duration.minutes || 0;

    // 言語に応じて形式を変える
    if (isEnglish) {
      if (hours === 0) {
        return `${minutes}m`;
      } else if (minutes === 0) {
        return `${hours}h`;
      } else {
        return `${hours}h ${minutes}m`;
      }
    } else {
      if (hours === 0) {
        return `${minutes}分`;
      } else if (minutes === 0) {
        return `${hours}時間`;
      } else {
        return `${hours}時間 ${minutes}分`;
      }
    }
  };

  // プロジェクト名を取得
  const getProject = (projectId: string) => {
    return projects.find((p) => p.id === projectId);
  };

  // 作業記録を日付ごとにグループ化
  const groupedEntries = timeEntries.reduce(
    (acc, entry) => {
      const date = formatDate(entry.startTime);
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(entry);
      return acc;
    },
    {} as Record<string, TimeEntry[]>
  );

  // 日付ごとにソート
  const sortedDates = Object.keys(groupedEntries).sort((a, b) => {
    // 日付文字列をDateオブジェクトに変換して比較
    const dateA = new Date(
      timeEntries.find((entry) => formatDate(entry.startTime) === a)
        ?.startTime || ''
    );
    const dateB = new Date(
      timeEntries.find((entry) => formatDate(entry.startTime) === b)
        ?.startTime || ''
    );
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <Box>
      {sortedDates.map((date, dateIndex) => (
        <Box key={date} sx={{ mb: 3 }}>
          {/* 日付ヘッダー */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mb: 2,
              mt: dateIndex > 0 ? 4 : 2,
            }}
          >
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: theme.palette.primary.main,
                mr: 1.5,
              }}
            />
            <Typography variant="h6">{date}</Typography>
          </Box>

          {/* タイムラインエントリー */}
          <Box sx={{ position: 'relative', ml: 0.7 }}>
            {/* タイムライン縦線 */}
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: 2,
                backgroundColor: theme.palette.divider,
                zIndex: 0,
              }}
            />

            {groupedEntries[date].map((entry, _index) => {
              const project = getProject(entry.projectId);
              const projectColor = theme.palette.primary.main;

              return (
                <Box key={entry.id} sx={{ position: 'relative', pl: 4, mb: 2 }}>
                  {/* タイムラインドット */}
                  <Box
                    sx={{
                      position: 'absolute',
                      left: -4,
                      top: 0,
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      backgroundColor: projectColor,
                      border: `2px solid ${theme.palette.background.paper}`,
                      zIndex: 1,
                    }}
                  />

                  {/* タイムラインエントリーカード */}
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2,
                      transition: 'box-shadow 0.2s',
                      '&:hover': {
                        boxShadow: theme.shadows[4],
                      },
                      borderLeft: `4px solid ${projectColor}`,
                    }}
                  >
                    {/* ヘッダー: プロジェクト名と時間 */}
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: 1,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="subtitle1" fontWeight="medium">
                          {project?.name || 'Unknown Project'}
                        </Typography>
                        <Chip
                          size="small"
                          label={formatDuration(entry.startTime, entry.endTime)}
                          icon={<TimeIcon fontSize="small" />}
                          sx={{ ml: 2, fontWeight: 'medium' }}
                        />
                      </Box>

                      <Box>
                        <Tooltip title={t('actions.edit')}>
                          <IconButton
                            size="small"
                            onClick={() => onEdit(entry)}
                            sx={{ ml: 1 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('projects.delete')}>
                          <IconButton
                            size="small"
                            onClick={() => onDelete(entry)}
                            sx={{ ml: 0.5 }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>

                    {/* 時間範囲 */}
                    <Typography variant="body2" color="text.secondary">
                      {formatTime(entry.startTime)} -{' '}
                      {entry.endTime
                        ? formatTime(entry.endTime)
                        : t('timer.title')}
                    </Typography>

                    {/* 説明（あれば） */}
                    {entry.description && (
                      <>
                        <Divider sx={{ my: 1.5 }} />
                        <Typography
                          variant="body2"
                          sx={{ mt: 1, whiteSpace: 'pre-line' }}
                        >
                          {entry.description}
                        </Typography>
                      </>
                    )}
                  </Paper>
                </Box>
              );
            })}
          </Box>
        </Box>
      ))}
    </Box>
  );
};
