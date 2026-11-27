import React from 'react';
import { Box, Dialog } from '@mui/material';

interface GraphiteDialogProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
  /** フッター右側のボタン群 */
  actions: React.ReactNode;
  /** フッター左側の補足（所要時間など） */
  summary?: React.ReactNode;
  size?: 'sm' | 'md';
  /** 指定するとフォームとして描画し、Enter で送信できるようにする */
  onSubmit?: (e: React.FormEvent) => void;
}

const WIDTH = { sm: 400, md: 460 };

/** タイトル・本文・区切り線付きフッターの3段で統一したダイアログ */
export const GraphiteDialog: React.FC<GraphiteDialogProps> = ({
  open,
  onClose,
  title,
  subtitle,
  children,
  actions,
  summary,
  size = 'md',
  onSubmit,
}) => {
  const titleId = React.useId();
  const descId = React.useId();
  const content = (
    <>
      <Box
        id={titleId}
        component="h2"
        sx={{
          m: 0,
          px: 2.75,
          pt: 2.5,
          pb: 0.5,
          fontSize: 16,
          fontWeight: 600,
          letterSpacing: '-0.01em',
        }}
      >
        {title}
      </Box>
      {subtitle && (
        <Box
          id={descId}
          sx={{
            px: 2.75,
            fontSize: 12.5,
            lineHeight: 1.6,
            color: 'text.secondary',
          }}
        >
          {subtitle}
        </Box>
      )}
      {children && (
        <Box
          sx={{
            px: 2.75,
            py: 2.25,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.75,
          }}
        >
          {children}
        </Box>
      )}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2.75,
          py: 1.75,
          mt: children ? 0 : 1.5,
          borderTop: children ? 1 : 0,
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{
            mr: 'auto',
            fontSize: 12,
            color: 'text.secondary',
            minWidth: 0,
          }}
        >
          {summary}
        </Box>
        {actions}
      </Box>
    </>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby={titleId}
      aria-describedby={subtitle ? descId : undefined}
      slotProps={{
        paper: {
          sx: { width: WIDTH[size], maxWidth: 'calc(100vw - 32px)', m: 2 },
        },
      }}
    >
      {onSubmit ? (
        <Box component="form" onSubmit={onSubmit} noValidate>
          {content}
        </Box>
      ) : (
        content
      )}
    </Dialog>
  );
};
