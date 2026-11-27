import React from 'react';
import { Box, ButtonBase, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

export type ToastKind = 'info' | 'success' | 'error';

interface GraphiteToastProps {
  message: string;
  kind: ToastKind;
  actionLabel?: string;
  onAction?: () => void;
  onClose: () => void;
  closeLabel: string;
}

const ICONS: Record<ToastKind, string> = {
  info: 'i',
  success: '✓',
  error: '!',
};

/** 画面下中央に出す通知。帯は塗らず、種類は小さなアイコンの色だけで示す */
export const GraphiteToast: React.FC<GraphiteToastProps> = ({
  message,
  kind,
  actionLabel,
  onAction,
  onClose,
  closeLabel,
}) => (
  <Box
    role={kind === 'error' ? 'alert' : 'status'}
    sx={{
      pointerEvents: 'auto',
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      minWidth: 340,
      maxWidth: 'calc(100vw - 32px)',
      py: 1.25,
      pl: 2,
      pr: 1,
      borderRadius: '11px',
      bgcolor: 'text.primary',
      color: 'background.default',
      fontSize: 13,
      boxShadow: '0 24px 64px rgba(0,0,0,.35)',
      '@keyframes toast-in': {
        from: { opacity: 0, transform: 'translateY(8px)' },
        to: { opacity: 1, transform: 'none' },
      },
      animation: 'toast-in .18s ease-out',
    }}
  >
    <Box
      aria-hidden
      sx={{
        width: 16,
        height: 16,
        flex: 'none',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 10,
        fontWeight: 700,
        color: '#fff',
        bgcolor:
          kind === 'success'
            ? 'success.main'
            : kind === 'error'
              ? 'error.main'
              : 'text.secondary',
      }}
    >
      {ICONS[kind]}
    </Box>
    <Box sx={{ mr: 'auto' }}>{message}</Box>
    {actionLabel && onAction && (
      <ButtonBase
        onClick={onAction}
        sx={(theme) => ({
          px: 1.25,
          py: 0.625,
          borderRadius: '7px',
          fontWeight: 600,
          fontSize: 13,
          color: 'background.default',
          bgcolor: `color-mix(in srgb, ${theme.palette.background.default} 14%, transparent)`,
        })}
      >
        {actionLabel}
      </ButtonBase>
    )}
    <IconButton
      size="small"
      aria-label={closeLabel}
      onClick={onClose}
      sx={{ color: 'inherit', opacity: 0.55 }}
    >
      <CloseIcon sx={{ fontSize: 16 }} />
    </IconButton>
  </Box>
);
