import React from 'react';
import { ButtonBase } from '@mui/material';

interface PlayToggleButtonProps {
  active: boolean;
  label: string;
  onClick: () => void;
}

/** 行内の開始/停止トグル。計測中は赤い■、それ以外は ▶ */
export const PlayToggleButton: React.FC<PlayToggleButtonProps> = ({
  active,
  label,
  onClick,
}) => (
  <ButtonBase
    onClick={onClick}
    aria-label={label}
    sx={(theme) => ({
      width: 28,
      height: 28,
      flex: 'none',
      borderRadius: '50%',
      border: `1px solid ${active ? 'transparent' : theme.custom.tokens.border2}`,
      bgcolor: active ? `${theme.palette.error.main}24` : 'transparent',
      '&:hover': {
        bgcolor: active ? `${theme.palette.error.main}33` : 'action.hover',
      },
      '&.Mui-focusVisible': { outline: 2, outlineColor: 'primary.main' },
      '&::after': active
        ? {
            content: '""',
            width: 8,
            height: 8,
            borderRadius: '2px',
            bgcolor: 'error.main',
          }
        : {
            content: '""',
            ml: '2px',
            borderLeft: `7px solid ${theme.palette.text.secondary}`,
            borderTop: '4.5px solid transparent',
            borderBottom: '4.5px solid transparent',
          },
    })}
  />
);
