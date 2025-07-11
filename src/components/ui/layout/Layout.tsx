import React, { useEffect } from 'react';
import {
  Box,
  Toolbar,
  AppBar,
  IconButton,
  Typography,
  useTheme,
  Fab,
  Tooltip,
  useMediaQuery,
  CssBaseline,
  Chip,
} from '@mui/material';
import {
  Brightness4,
  Brightness7,
  Add as AddIcon,
  Science as ScienceIcon,
} from '@mui/icons-material';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Sidebar, DRAWER_WIDTH, CLOSED_DRAWER_WIDTH } from './Sidebar';
import { GlobalTimer } from '../global/GlobalTimer';
import { Project } from '../../../types';
import { useStorage } from '../../../hooks/useStorage';
import { isTestDataEnabled } from '../../../utils/env';

export interface LayoutProps {
  children: React.ReactNode;
  title: string;
  activePage: string;
  onNavigate: (page: string) => void;
  onToggleTheme: () => void;
  isDarkMode: boolean;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onAddButtonClick?: () => void;
  showAddButton?: boolean;
  addButtonTooltip?: string;
  // タイマー関連の新しいプロパティ
  activeProject?: Project | null;
  isTimerRunning?: boolean;
  startTime?: string | null;
  onStopTimer?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  title,
  activePage,
  onNavigate,
  onToggleTheme,
  isDarkMode,
  sidebarOpen,
  onToggleSidebar,
  onAddButtonClick,
  showAddButton = false,
  addButtonTooltip = '追加',
  // タイマー関連のプロパティ
  activeProject = null,
  isTimerRunning = false,
  startTime = null,
  onStopTimer = () => {},
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const currentDrawerWidth = sidebarOpen ? DRAWER_WIDTH : CLOSED_DRAWER_WIDTH;
  const { t, language } = useLanguage(); // 翻訳関数と言語をインポート
  const { isTestMode } = useStorage(); // テストモードの状態を取得

  // 現在の言語をログ出力
  useEffect(() => {
  }, [language]);

  // タイマー画面に遷移するハンドラー
  const handleTimerClick = () => {
    if (activePage !== 'timer') {
      onNavigate('timer');
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* サイドバー */}
      <Sidebar
        open={sidebarOpen}
        onToggle={onToggleSidebar}
        activePage={activePage}
        onNavigate={onNavigate}
      />

      {/* メインコンテンツ */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0,
          width: { sm: `calc(100% - ${currentDrawerWidth}px)` },
          ml: { xs: 0, md: 0 }  // サイドバーの幅に応じたマージンは必要ない（Drawerが固定のため）
        }}
      >
        {/* ヘッダー */}
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            width: { md: `calc(100% - ${currentDrawerWidth}px)` },
            ml: { md: `${currentDrawerWidth}px` },
            bgcolor: 'background.paper',
            color: 'text.primary',
            borderBottom: '1px solid',
            borderColor: 'divider',
            zIndex: (theme) => theme.zIndex.drawer - 1,
            transition: theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }}
        >
          <Toolbar>
            <Typography variant="h6" component="div" sx={{
              flexGrow: 1,
              ml: { xs: isMobile ? 5 : 0, md: 0 }, // モバイル表示時に左余白を追加
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}>
              {title}
              {isTestMode && isTestDataEnabled() && (
                <Chip
                  icon={<ScienceIcon />}
                  label="テストモード"
                  color="warning"
                  size="small"
                  sx={{ 
                    animation: 'pulse 2s ease-in-out infinite',
                    '@keyframes pulse': {
                      '0%': { opacity: 0.7 },
                      '50%': { opacity: 1 },
                      '100%': { opacity: 0.7 },
                    },
                  }}
                />
              )}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LanguageSwitcher variant="icon" />
              <IconButton onClick={onToggleTheme} color="inherit">
                {isDarkMode ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        {/* ツールバーの高さ分のスペース確保 */}
        <Toolbar />

        {/* コンテンツエリア */}
        <Box
          sx={{
            p: { xs: 2, md: 3 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: 'lg',
            }}
          >
            {children}
          </Box>
        </Box>

        {/* フローティングアクションボタン */}
        {showAddButton && onAddButtonClick && (
          <Tooltip title={addButtonTooltip}>
            <Fab
              color="primary"
              aria-label="add"
              onClick={onAddButtonClick}
              sx={{
                position: 'fixed',
                bottom: 24,
                right: isTimerRunning ? 90 : 24, // タイマーが実行中の場合、タイマーとの干渉を避けるために位置を調整
                boxShadow: theme.shadows[3],
              }}
            >
              <AddIcon />
            </Fab>
          </Tooltip>
        )}

        {/* グローバルタイマー */}
        <GlobalTimer
          project={activeProject}
          isRunning={isTimerRunning}
          startTime={startTime}
          onStop={onStopTimer}
          onClick={handleTimerClick}
        />
      </Box>
    </Box>
  );
};
