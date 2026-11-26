import React from 'react';
import { Box, useTheme } from '@mui/material';
import { numberTypography } from '../../../styles/modernTheme';

interface StatValueProps {
  label: string;
  value: React.ReactNode;
  unit?: string;
  size?: number;
  children?: React.ReactNode;
}

/** ラベル＋大きな数字（Manrope ExtraLight）＋小さな単位 */
export const StatValue: React.FC<StatValueProps> = ({
  label,
  value,
  unit,
  size = 34,
  children,
}) => {
  const theme = useTheme();
  return (
    <Box>
      <Box sx={{ fontSize: 12, color: 'text.secondary', mb: 0.5 }}>{label}</Box>
      <Box sx={{ ...numberTypography(theme), fontSize: size, lineHeight: 1.1 }}>
        <span>{value}</span>
        {unit && (
          <Box
            component="small"
            sx={{
              fontFamily: theme.typography.fontFamily,
              fontSize: 13,
              color: 'text.secondary',
              letterSpacing: 0,
              ml: 0.5,
              fontWeight: 400,
            }}
          >
            {unit}
          </Box>
        )}
      </Box>
      {children}
    </Box>
  );
};
