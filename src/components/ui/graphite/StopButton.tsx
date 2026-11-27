import React from 'react';
import { Box, ButtonBase } from '@mui/material';

interface StopButtonProps {
  onClick: () => void;
  label: string;
}

/** 停止はアプリ全体でこの形（アウトラインのピル＋赤い■）に統一する */
export const StopButton: React.FC<StopButtonProps> = ({ onClick, label }) => (
  <ButtonBase
    onClick={onClick}
    sx={(theme) => ({
      height: 40,
      pl: 1.75,
      pr: 2.25,
      gap: 1,
      borderRadius: 999,
      border: `1px solid ${theme.custom.tokens.border2}`,
      color: 'text.primary',
      fontSize: 13,
      fontWeight: 500,
      '&:hover': { bgcolor: 'action.hover' },
      '&.Mui-focusVisible': { outline: 2, outlineColor: 'primary.main' },
    })}
  >
    <Box
      aria-hidden
      sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: 'error.main' }}
    />
    {label}
  </ButtonBase>
);
