import React from 'react';
import { Box, ButtonBase } from '@mui/material';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}

export const SegmentedControl = <T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: SegmentedControlProps<T>) => (
  <Box
    role="group"
    aria-label={ariaLabel}
    sx={{
      display: 'inline-flex',
      p: '3px',
      gap: '2px',
      borderRadius: 2.25,
      bgcolor: 'action.hover',
    }}
  >
    {options.map((o) => {
      const on = o.value === value;
      return (
        <ButtonBase
          key={o.value}
          onClick={() => onChange(o.value)}
          aria-pressed={on}
          sx={{
            px: 1.5,
            py: 0.625,
            borderRadius: 1.75,
            fontSize: 12.5,
            color: on ? 'text.primary' : 'text.secondary',
            fontWeight: on ? 500 : 400,
            bgcolor: on ? 'background.paper' : 'transparent',
            boxShadow: on ? '0 1px 2px rgba(0,0,0,0.12)' : 'none',
            '&.Mui-focusVisible': { outline: 2, outlineColor: 'primary.main' },
          }}
        >
          {o.label}
          {o.count !== undefined && (
            <Box component="small" sx={{ color: 'text.disabled', ml: 0.5 }}>
              {o.count}
            </Box>
          )}
        </ButtonBase>
      );
    })}
  </Box>
);
