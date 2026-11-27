import React from 'react';
import { Box, Typography } from '@mui/material';
import { GraphiteCard } from '../ui/graphite/GraphiteCard';

export const SettingsGroup: React.FC<{
  title: string;
  /** 見出し横の小さな札（「開発用」など） */
  badge?: string;
  children: React.ReactNode;
}> = ({ title, badge, children }) => (
  <Box component="section" aria-label={title}>
    <Typography
      component="h2"
      sx={{
        fontSize: 13,
        fontWeight: 600,
        color: 'text.secondary',
        mb: 1.25,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}
    >
      {title}
      {badge && (
        <Box
          component="span"
          sx={(theme) => ({
            fontSize: 10.5,
            fontWeight: 500,
            px: 0.875,
            py: 0.25,
            borderRadius: '6px',
            color: 'warning.main',
            bgcolor: `color-mix(in srgb, ${theme.palette.warning.main} 14%, transparent)`,
          })}
        >
          {badge}
        </Box>
      )}
    </Typography>
    <GraphiteCard padding={0}>{children}</GraphiteCard>
  </Box>
);

export const SettingsRow: React.FC<{
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, description, children }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 3,
      px: 2.5,
      py: 2,
      '& + &': { borderTop: 1, borderColor: 'divider' },
    }}
  >
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ fontSize: 13.5, fontWeight: 500 }}>{title}</Typography>
      {description && (
        <Typography
          component="div"
          sx={{
            fontSize: 12.5,
            color: 'text.secondary',
            mt: 0.375,
            lineHeight: 1.5,
          }}
        >
          {description}
        </Typography>
      )}
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
      {children}
    </Box>
  </Box>
);
