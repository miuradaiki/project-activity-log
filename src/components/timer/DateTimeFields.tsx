import React from 'react';
import {
  Box,
  TextField,
  IconButton,
  InputAdornment,
  Tooltip,
  Typography,
  Alert,
} from '@mui/material';
import { Update, CalendarToday } from '@mui/icons-material';
import { format, differenceInMinutes } from 'date-fns';
import { useLanguage } from '../../contexts/LanguageContext';

interface DateTimeFieldsProps {
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  isEditing: boolean;
  isMultiDay: boolean;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onStartTimeChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
  onSetCurrentTime: (target: 'start' | 'end') => void;
}

const formatHoursAndMinutes = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes}分`;
  } else if (minutes === 0) {
    return `${hours}時間`;
  } else {
    return `${hours}時間${minutes}分`;
  }
};

export const DateTimeFields: React.FC<DateTimeFieldsProps> = ({
  startDate,
  endDate,
  startTime,
  endTime,
  isEditing,
  isMultiDay,
  onStartDateChange,
  onEndDateChange,
  onStartTimeChange,
  onEndTimeChange,
  onSetCurrentTime,
}) => {
  const { t } = useLanguage();

  const durationMinutes = differenceInMinutes(
    new Date(`${endDate}T${endTime}`),
    new Date(`${startDate}T${startTime}`)
  );

  const formatDuration = (totalMinutes: number): string => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0) {
      return t('format.duration.minutes', { minutes: String(minutes) });
    } else if (minutes === 0) {
      return t('format.duration.hours', { hours: String(hours) });
    } else {
      return t('format.duration.hours.minutes', {
        hours: String(hours),
        minutes: String(minutes),
      });
    }
  };

  return (
    <>
      {/* Date Fields */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          label={t('timer.start.date')}
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          fullWidth
          required
          InputLabelProps={{ shrink: true }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <CalendarToday fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          label={t('timer.end.date')}
          type="date"
          value={endDate}
          onChange={(e) => {
            if (!isEditing) {
              onEndDateChange(e.target.value);
            }
          }}
          fullWidth
          required
          disabled={isEditing}
          InputLabelProps={{ shrink: true }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <CalendarToday fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Multi-day Warning */}
      {isMultiDay && (
        <Alert severity="info" sx={{ mb: 1 }}>
          <Typography variant="body2">
            {t('timer.multiday.notice', {
              duration: formatDuration(durationMinutes),
              startDate: format(new Date(startDate), 'M/d'),
              endDate: format(new Date(endDate), 'M/d'),
            })}
          </Typography>
        </Alert>
      )}

      {/* Time Fields */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          label={t('timer.start.time')}
          type="time"
          value={startTime}
          onChange={(e) => onStartTimeChange(e.target.value)}
          fullWidth
          required
          InputLabelProps={{ shrink: true }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title={t('timer.now.start')}>
                  <IconButton
                    onClick={() => onSetCurrentTime('start')}
                    edge="end"
                    size="small"
                    sx={{ mr: -0.5, color: 'primary.main' }}
                  >
                    <Update fontSize="small" />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
          }}
        />

        <TextField
          label={t('timer.end.time')}
          type="time"
          value={endTime}
          onChange={(e) => onEndTimeChange(e.target.value)}
          fullWidth
          required
          InputLabelProps={{ shrink: true }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title={t('timer.now.end')}>
                  <IconButton
                    onClick={() => onSetCurrentTime('end')}
                    edge="end"
                    size="small"
                    sx={{ mr: -0.5, color: 'primary.main' }}
                  >
                    <Update fontSize="small" />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
          }}
        />
      </Box>
    </>
  );
};

export { formatHoursAndMinutes };
