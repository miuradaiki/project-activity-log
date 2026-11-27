import React from 'react';
import { Box, SxProps, Theme } from '@mui/material';

interface GraphiteCardProps {
  children: React.ReactNode;
  /** 左上にアクセント色の淡い光を敷く（ページの主役カードだけに使う） */
  glow?: boolean;
  padding?: number | string;
  component?: React.ElementType;
  sx?: SxProps<Theme>;
}

export const GraphiteCard: React.FC<GraphiteCardProps> = ({
  children,
  glow = false,
  padding = '22px 24px',
  component = 'section',
  sx,
}) => (
  <Box
    component={component}
    sx={[
      (theme) => ({
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        borderRadius: 3,
        boxShadow: theme.custom.tokens.cardShadow,
        p: padding,
        ...(glow && {
          backgroundImage: `radial-gradient(120% 140% at 0% 0%, ${theme.custom.tokens.glow}, transparent 55%)`,
        }),
      }),
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Box>
);
