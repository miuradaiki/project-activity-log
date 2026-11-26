import React from 'react';
import { Box, SxProps, Theme } from '@mui/material';

interface ProgressMeterProps {
  /** 実績 / 目標。1 を超える値もそのまま受け取る */
  ratio: number;
  color: string;
  label: string;
  height?: number;
  sx?: SxProps<Theme>;
}

/**
 * 全画面共通の進捗バー。超過時は全体を ratio として描き直し、
 * 目標を超えた分だけを error 色ではみ出させる。
 */
export const ProgressMeter: React.FC<ProgressMeterProps> = ({
  ratio,
  color,
  label,
  height = 4,
  sx,
}) => {
  const safe = Math.max(0, ratio);
  const isOver = safe > 1;
  const mainWidth = isOver ? (1 / safe) * 100 : safe * 100;
  const overWidth = isOver ? 100 - mainWidth : 0;

  return (
    <Box
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(safe * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      sx={[
        {
          display: 'flex',
          height,
          borderRadius: height,
          overflow: 'hidden',
          bgcolor: 'action.hover',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box sx={{ width: `${mainWidth}%`, bgcolor: color }} />
      {isOver && (
        <Box
          data-testid="progress-overflow"
          style={{ width: `${Math.round(overWidth * 10) / 10}%` }}
          sx={{ bgcolor: 'error.main' }}
        />
      )}
    </Box>
  );
};
