import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { GraphiteDialog } from '../ui/graphite/GraphiteDialog';
import { useLanguage } from '../../contexts/LanguageContext';

/** App.tsx の shortcuts と同じものだけを載せる。効かないキーを表示しないため */
const SHORTCUTS: { keys: string; labelKey: string }[] = [
  { keys: 'Ctrl+1', labelKey: 'nav.timer' },
  { keys: 'Ctrl+2', labelKey: 'nav.projects' },
  { keys: 'Ctrl+3', labelKey: 'nav.dashboard' },
  { keys: 'Ctrl+,', labelKey: 'nav.settings' },
  { keys: 'Space', labelKey: 'shortcuts.timer.toggle' },
  { keys: 'Ctrl+N', labelKey: 'shortcuts.project.new' },
  { keys: 'Ctrl+/', labelKey: 'shortcuts.help' },
  { keys: 'Alt+L', labelKey: 'shortcuts.theme' },
];

const formatKeys = (keys: string) =>
  navigator.platform.toUpperCase().includes('MAC')
    ? keys.replace('Ctrl', '⌘').replace('Alt', '⌥')
    : keys;

interface KeyboardShortcutsProps {
  open: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsDialog: React.FC<KeyboardShortcutsProps> = ({
  open,
  onClose,
}) => {
  const { t } = useLanguage();

  return (
    <GraphiteDialog
      open={open}
      onClose={onClose}
      title={t('shortcuts.title')}
      actions={
        <Button variant="contained" onClick={onClose}>
          {t('shortcuts.close')}
        </Button>
      }
    >
      <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
        {SHORTCUTS.map(({ keys, labelKey }) => (
          <Box
            component="li"
            key={keys}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              py: 1,
              borderBottom: 1,
              borderColor: 'divider',
              '&:last-of-type': { borderBottom: 0 },
            }}
          >
            <Typography variant="body2">{t(labelKey)}</Typography>
            <Box
              component="kbd"
              sx={{
                px: 1,
                py: 0.25,
                borderRadius: 1,
                bgcolor: 'action.hover',
                color: 'text.secondary',
                fontFamily: 'monospace',
                fontSize: 12,
              }}
            >
              {formatKeys(keys)}
            </Box>
          </Box>
        ))}
      </Box>
    </GraphiteDialog>
  );
};
