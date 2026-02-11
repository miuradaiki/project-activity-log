import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
  Button,
  useTheme,
  IconButton,
  Grid,
  Divider,
  Paper,
} from '@mui/material';
import {
  Close as CloseIcon,
  Keyboard as KeyboardIcon,
} from '@mui/icons-material';

// ショートカットの型定義
interface Shortcut {
  key: string; // キーの組み合わせ
  description: string; // 説明
  category: ShortcutCategory; // カテゴリ
}

// ショートカットのカテゴリ
type ShortcutCategory = 'navigation' | 'timer' | 'project' | 'general';

interface KeyboardShortcutsProps {
  open: boolean;
  onClose: () => void;
}

/**
 * キーボードショートカットヘルプダイアログ
 */
export const KeyboardShortcutsDialog: React.FC<KeyboardShortcutsProps> = ({
  open,
  onClose,
}) => {
  const theme = useTheme();

  // ショートカットリスト
  const shortcuts: Shortcut[] = [
    // ナビゲーション
    {
      key: 'Ctrl+1',
      description: 'ダッシュボード表示',
      category: 'navigation',
    },
    {
      key: 'Ctrl+2',
      description: 'プロジェクト一覧表示',
      category: 'navigation',
    },
    { key: 'Ctrl+3', description: 'タイマー画面表示', category: 'navigation' },
    { key: 'Ctrl+4', description: '作業履歴表示', category: 'navigation' },
    { key: 'Ctrl+,', description: '設定画面表示', category: 'navigation' },

    // タイマー操作
    { key: 'Space', description: 'タイマー開始/停止', category: 'timer' },
    { key: 'Esc', description: 'タイマー停止', category: 'timer' },
    { key: 'Ctrl+Enter', description: '作業記録の保存', category: 'timer' },
    { key: 'Ctrl+Alt+N', description: '手動入力モード切替', category: 'timer' },

    // プロジェクト操作
    { key: 'Ctrl+N', description: '新規プロジェクト作成', category: 'project' },
    {
      key: 'Ctrl+E',
      description: '選択したプロジェクトを編集',
      category: 'project',
    },
    {
      key: 'Ctrl+D',
      description: '選択したプロジェクトを削除',
      category: 'project',
    },

    // 一般操作
    { key: '?', description: 'ショートカット一覧表示', category: 'general' },
    {
      key: 'Ctrl+/',
      description: 'ショートカット一覧表示',
      category: 'general',
    },
    { key: 'Ctrl+H', description: 'ヘルプ表示', category: 'general' },
    { key: 'Alt+L', description: 'ダークモード切替', category: 'general' },
  ];

  // カテゴリーごとにショートカットをフィルタリング
  const getShortcutsByCategory = (category: ShortcutCategory) => {
    return shortcuts.filter((shortcut) => shortcut.category === category);
  };

  // カテゴリ名のマッピング
  const categoryNames: Record<ShortcutCategory, string> = {
    navigation: 'ナビゲーション',
    timer: 'タイマー',
    project: 'プロジェクト',
    general: '一般',
  };

  // Macの場合はCtrlの代わりにCommandを表示
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const formatKey = (key: string) => {
    if (isMac) {
      return key.replace('Ctrl', '⌘').replace('Alt', '⌥').replace('Shift', '⇧');
    }
    return key;
  };

  // ダイアログ内でのキーボードショートカットを無効化
  useEffect(() => {
    const preventDefaultForShortcuts = (e: KeyboardEvent) => {
      if (
        open &&
        ((e.ctrlKey &&
          ['1', '2', '3', '4', 'n', 'e', 'd', 'h', '/'].includes(e.key)) ||
          e.key === '?')
      ) {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', preventDefaultForShortcuts);
    return () => {
      window.removeEventListener('keydown', preventDefaultForShortcuts);
    };
  }, [open]);

  // ショートカットカードコンポーネント
  const ShortcutCard = ({ category }: { category: ShortcutCategory }) => {
    const categoryShortcuts = getShortcutsByCategory(category);

    return (
      <Paper
        elevation={1}
        sx={{
          p: 2,
          height: '100%',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[4],
          },
        }}
      >
        <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 2 }}>
          {categoryNames[category]}
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {categoryShortcuts.map((shortcut, index) => (
          <Box
            key={shortcut.key}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              mb: index < categoryShortcuts.length - 1 ? 1.5 : 0,
            }}
          >
            <Typography variant="body2">{shortcut.description}</Typography>
            <Typography
              variant="body2"
              sx={{
                backgroundColor:
                  theme.palette.mode === 'light'
                    ? theme.palette.grey[200]
                    : theme.palette.grey[800],
                px: 1,
                py: 0.5,
                borderRadius: 1,
                fontFamily: 'monospace',
                minWidth: 60,
                textAlign: 'center',
                fontWeight: 'medium',
              }}
            >
              {formatKey(shortcut.key)}
            </Typography>
          </Box>
        ))}
      </Paper>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          position: 'relative',
        },
      }}
    >
      {/* ヘッダー */}
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <KeyboardIcon sx={{ mr: 1.5, color: theme.palette.primary.main }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            キーボードショートカット
          </Typography>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ color: theme.palette.grey[500] }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pt: 0 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          以下のキーボードショートカットを使用して、より効率的に作業できます。
        </Typography>

        <Grid container spacing={3}>
          <Grid
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <ShortcutCard category="navigation" />
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <ShortcutCard category="timer" />
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <ShortcutCard category="project" />
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <ShortcutCard category="general" />
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button variant="outlined" onClick={onClose} sx={{ minWidth: 120 }}>
            閉じる
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

/**
 * アプリケーション全体のキーボードショートカットを管理するコンポーネント
 */
export const KeyboardShortcutsProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [showShortcutsDialog, setShowShortcutsDialog] = useState(false);

  // キーボードイベントのリスナー
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ダイアログが開いているときは何もしない
      if (showShortcutsDialog) return;

      // ショートカット一覧表示: ? または Ctrl+/
      if (e.key === '?' || (e.ctrlKey && e.key === '/')) {
        e.preventDefault();
        setShowShortcutsDialog(true);
      }

      // 他のショートカットはApp.tsxで処理
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showShortcutsDialog]);

  return (
    <>
      {children}
      <KeyboardShortcutsDialog
        open={showShortcutsDialog}
        onClose={() => setShowShortcutsDialog(false)}
      />
    </>
  );
};

/**
 * キーボードショートカットのフックを作成
 * App.tsxなどで使用するため
 */
export const useKeyboardShortcuts = () => {
  const [showShortcutsDialog, setShowShortcutsDialog] = useState(false);

  const openShortcutsDialog = () => {
    setShowShortcutsDialog(true);
  };

  const closeShortcutsDialog = () => {
    setShowShortcutsDialog(false);
  };

  return {
    showShortcutsDialog,
    openShortcutsDialog,
    closeShortcutsDialog,
  };
};
