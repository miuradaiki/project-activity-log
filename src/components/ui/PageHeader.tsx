import React from 'react';
import { Box, Typography } from '@mui/material';

interface PageHeaderProps {
  title: string;
  subtitle?: React.ReactNode;
  /** ページの主要アクション。1画面に1つを基本とする */
  action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  action,
}) => (
  <Box
    component="header"
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      flexWrap: 'wrap',
      gap: 2,
      mb: 2.75,
    }}
  >
    <Box>
      <Typography
        variant="h4"
        component="h1"
        sx={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em' }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography sx={{ color: 'text.secondary', fontSize: 13, mt: 0.5 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
    {action && (
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>{action}</Box>
    )}
  </Box>
);
