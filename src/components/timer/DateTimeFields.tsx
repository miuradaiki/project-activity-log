import React from 'react';
import { Box, ButtonBase, InputAdornment, TextField } from '@mui/material';
import { useLanguage } from '../../contexts/LanguageContext';
import { GraphiteField } from '../ui/graphite/GraphiteField';

interface DateTimeFieldsProps {
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  isEditing: boolean;
  error?: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onStartTimeChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
  onSetCurrentTime: (target: 'start' | 'end') => void;
}

const NowButton: React.FC<{ label: string; onClick: () => void }> = ({
  label,
  onClick,
}) => {
  const { t } = useLanguage();
  return (
    <InputAdornment position="end">
      <ButtonBase
        onClick={onClick}
        aria-label={label}
        sx={{
          px: 1,
          py: 0.25,
          borderRadius: '6px',
          fontSize: 11.5,
          color: 'text.secondary',
          bgcolor: 'action.hover',
        }}
      >
        {t('timer.now')}
      </ButtonBase>
    </InputAdornment>
  );
};

/** 開始・終了をそれぞれ「日付＋時刻」の1行で入力する */
export const DateTimeFields: React.FC<DateTimeFieldsProps> = ({
  startDate,
  endDate,
  startTime,
  endTime,
  isEditing,
  error,
  onStartDateChange,
  onEndDateChange,
  onStartTimeChange,
  onEndTimeChange,
  onSetCurrentTime,
}) => {
  const { t } = useLanguage();
  const row = { display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 1.5 };

  return (
    <>
      <Box sx={row}>
        <GraphiteField label={t('timer.start.date')} htmlFor="entry-start-date">
          <TextField
            id="entry-start-date"
            type="date"
            size="small"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            required
          />
        </GraphiteField>
        <GraphiteField label={t('timer.start.time')} htmlFor="entry-start-time">
          <TextField
            id="entry-start-time"
            type="time"
            size="small"
            value={startTime}
            onChange={(e) => onStartTimeChange(e.target.value)}
            required
            slotProps={{
              input: {
                endAdornment: (
                  <NowButton
                    label={t('aria.time.set.start')}
                    onClick={() => onSetCurrentTime('start')}
                  />
                ),
              },
            }}
          />
        </GraphiteField>
      </Box>
      <Box sx={row}>
        <GraphiteField
          label={t('timer.end.date')}
          htmlFor="entry-end-date"
          // 編集時は1件の記録として上書きするため、日をまたぐ変更はできない
          help={isEditing ? t('timer.manual.end.date.fixed') : undefined}
        >
          <TextField
            id="entry-end-date"
            type="date"
            size="small"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            disabled={isEditing}
            required
          />
        </GraphiteField>
        <GraphiteField label={t('timer.end.time')} htmlFor="entry-end-time">
          <TextField
            id="entry-end-time"
            type="time"
            size="small"
            value={endTime}
            onChange={(e) => onEndTimeChange(e.target.value)}
            required
            error={!!error}
            slotProps={{
              input: {
                endAdornment: (
                  <NowButton
                    label={t('aria.time.set.end')}
                    onClick={() => onSetCurrentTime('end')}
                  />
                ),
              },
            }}
          />
        </GraphiteField>
      </Box>
      {error && (
        <Box role="alert" sx={{ mt: -0.75, fontSize: 12, color: 'error.main' }}>
          {error}
        </Box>
      )}
    </>
  );
};
