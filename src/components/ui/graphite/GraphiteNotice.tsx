import React from 'react';
import { Box } from '@mui/material';

/** フォーム内の注意書き。確認ダイアログを重ねる代わりに、その場で知らせる */
export const GraphiteNotice: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <Box
    sx={(theme) => ({
      display: 'flex',
      gap: 1.25,
      px: 1.5,
      py: 1.25,
      borderRadius: '9px',
      fontSize: 12.5,
      lineHeight: 1.55,
      color: 'text.primary',
      bgcolor: `color-mix(in srgb, ${theme.palette.warning.main} 10%, transparent)`,
    })}
  >
    <Box
      aria-hidden
      sx={{
        flex: 'none',
        width: 16,
        height: 16,
        mt: '1px',
        borderRadius: '50%',
        bgcolor: 'warning.main',
        color: 'background.default',
        fontSize: 11,
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      !
    </Box>
    <Box>{children}</Box>
  </Box>
);
