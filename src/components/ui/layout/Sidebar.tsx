import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Drawer,
  IconButton,
  useMediaQuery,
  useTheme,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  ListAlt as ProjectsIcon,
  Timer as TimerIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useLanguage } from '../../../contexts/LanguageContext';

// ドロワーの幅設定
export const DRAWER_WIDTH = 240;
export const CLOSED_DRAWER_WIDTH = 60;

// スタイル付きListItemButton
const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  margin: theme.spacing(0.5, 1),
  '&.Mui-selected': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.contrastText,
    },
  },
}));

export interface SidebarProps {
  open: boolean;
  onToggle: () => void;
  activePage: string;
  onNavigate: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  open,
  onToggle,
  activePage,
  onNavigate,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { t } = useLanguage();

  // ナビゲーションアイテム
  const mainMenuItems = [
    { id: 'dashboard', text: t('nav.dashboard'), icon: <DashboardIcon /> },
    { id: 'projects', text: t('nav.projects'), icon: <ProjectsIcon /> },
    { id: 'timer', text: t('nav.timer'), icon: <TimerIcon /> },
  ];

  // 設定メニュー項目
  const settingsMenuItem = {
    id: 'settings',
    text: t('nav.settings'),
    icon: <SettingsIcon />,
  };

  // メニュー項目のレンダリング
  const renderMenuItem = (item: {
    id: string;
    text: string;
    icon: React.ReactNode;
  }) => (
    <ListItem key={item.id} disablePadding>
      <StyledListItemButton
        selected={activePage === item.id}
        onClick={() => onNavigate(item.id)}
        sx={{
          justifyContent: open ? 'initial' : 'center',
          px: open ? 3 : 2.5,
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: open ? 36 : 'auto',
            mr: open ? 2 : 'auto',
            justifyContent: 'center',
          }}
        >
          {item.icon}
        </ListItemIcon>
        {open && <ListItemText primary={item.text} />}
      </StyledListItemButton>
    </ListItem>
  );

  // ドロワーの内容
  const drawer = (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: open ? 'space-between' : 'center',
          p: 2,
        }}
      >
        {open && (
          <Box sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
            {t('app.name')}
          </Box>
        )}
        <IconButton onClick={onToggle}>
          {open ? <ChevronLeftIcon /> : <MenuIcon />}
        </IconButton>
      </Box>

      <List sx={{ pt: 2, flexGrow: 1 }}>
        {mainMenuItems.map(renderMenuItem)}
      </List>

      <Divider sx={{ my: 1 }} />

      <List sx={{ mb: 2 }}>{renderMenuItem(settingsMenuItem)}</List>
    </>
  );

  // モバイル版レイアウト
  if (isMobile) {
    return (
      <>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={onToggle}
          sx={{
            position: 'fixed',
            top: 14, // 位置を調整
            left: 16, // 左余白を増やして位置を調整
            zIndex: 1200,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            boxShadow: 3,
            '&:hover': {
              bgcolor: 'primary.dark',
            },
          }}
        >
          <MenuIcon />
        </IconButton>
        <Drawer
          variant="temporary"
          open={open}
          onClose={onToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              boxShadow: 3,
            },
            zIndex: theme.zIndex.appBar + 100,
          }}
        >
          {drawer}
        </Drawer>
      </>
    );
  }

  // デスクトップ版レイアウト
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? DRAWER_WIDTH : CLOSED_DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? DRAWER_WIDTH : CLOSED_DRAWER_WIDTH,
          boxSizing: 'border-box',
          borderRight: `1px solid ${theme.palette.divider}`,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {drawer}
    </Drawer>
  );
};
