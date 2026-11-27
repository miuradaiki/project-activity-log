import React from 'react';
import { Box } from '@mui/material';

interface GraphiteFieldProps {
  label: React.ReactNode;
  /** 入力要素の id。ラベルのクリックと支援技術での読み上げを結びつける */
  htmlFor?: string;
  optionalLabel?: string;
  help?: React.ReactNode;
  error?: React.ReactNode;
  children: React.ReactNode;
}

/** 入力欄の上にラベル、下に補足かエラーを置くフォーム項目 */
export const GraphiteField: React.FC<GraphiteFieldProps> = ({
  label,
  htmlFor,
  optionalLabel,
  help,
  error,
  children,
}) => (
  <Box
    sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, minWidth: 0 }}
  >
    <Box
      component="label"
      htmlFor={htmlFor}
      sx={{ fontSize: 12, fontWeight: 500, color: 'text.secondary' }}
    >
      {label}
      {optionalLabel && (
        <Box
          component="span"
          sx={{ ml: 0.75, fontWeight: 400, color: 'text.disabled' }}
        >
          {optionalLabel}
        </Box>
      )}
    </Box>
    {children}
    {(error || help) && (
      <Box
        sx={{ fontSize: 12, color: error ? 'error.main' : 'text.disabled' }}
        role={error ? 'alert' : undefined}
      >
        {error ?? help}
      </Box>
    )}
  </Box>
);
