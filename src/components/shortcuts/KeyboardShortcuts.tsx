import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { GraphiteDialog } from '../ui/graphite/GraphiteDialog';
import { useLanguage } from '../../contexts/LanguageContext';
import { SHORTCUT_HELP } from './shortcut-definitions';

interface KeyboardShortcutsProps {
  open: boolean;
  onClose: () => void;
}

const isMac = () => navigator.platform.toUpperCase().includes('MAC');

// 割り当ては Control キーなので、Mac でも ⌘ ではなく ⌃ と表示する
const formatKeys = (keys: string) =>
  isMac() ? keys.replace('Ctrl+', '⌃').replace('Alt+', '⌥') : keys;

/** キーボードショートカットの一覧ダイアログ */
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
      size="sm"
      actions={
        <Button variant="contained" onClick={onClose}>
          {t('actions.close')}
        </Button>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {SHORTCUT_HELP.map(({ keys, labelKey }) => (
          <Box
            key={keys}
            data-testid="shortcut-row"
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Typography variant="body2">{t(labelKey)}</Typography>
            <Box
              component="kbd"
              sx={(theme) => ({
                px: 1,
                py: 0.25,
                borderRadius: 1,
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: 'action.hover',
                color: 'text.secondary',
                fontFamily: theme.typography.fontFamily,
                fontSize: 12,
                fontVariantNumeric: 'tabular-nums',
              })}
            >
              {formatKeys(keys)}
            </Box>
          </Box>
        ))}
      </Box>
    </GraphiteDialog>
  );
};
