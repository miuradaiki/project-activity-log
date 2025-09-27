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
  Badge,
  Tooltip,
  Typography,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dashboard as DashboardIcon,
  ListAlt as ProjectsIcon,
  Timer as TimerIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { useLanguage } from '../../../contexts/LanguageContext';
import {
  MotionBox,
  fadeInUp,
  slideInLeft,
  stagger,
} from '../modern/StyledComponents';

// ドロワーの幅設定
export const DRAWER_WIDTH = 240;
export const CLOSED_DRAWER_WIDTH = 60;

// Modern styled components
const ModernDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    background:
      theme.palette.mode === 'dark'
        ? 'linear-gradient(180deg, #1A1F2E 0%, #0F1419 100%)'
        : 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
    backdropFilter: 'blur(20px)',
    borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    boxShadow:
      theme.custom?.shadows?.medium || '0 10px 40px -15px rgba(0,0,0,0.15)',
  },
}));

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  borderRadius: theme.custom?.borderRadius?.sm || 8,
  margin: theme.spacing(0.5, 1),
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    transform: 'translateX(8px)',
    '&::before': {
      transform: 'scaleX(1)',
    },
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    background:
      theme.custom?.gradients?.primary ||
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    transform: 'scaleX(0)',
    transformOrigin: 'left',
    transition: 'transform 0.3s ease',
  },
  '&.Mui-selected': {
    background:
      theme.custom?.gradients?.primary ||
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#FFFFFF',
    boxShadow: theme.custom?.shadows?.soft || '0 2px 20px 0 rgba(0,0,0,0.1)',
    transform: 'translateX(8px)',
    '&:hover': {
      background:
        theme.custom?.gradients?.primary ||
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      filter: 'brightness(1.1)',
    },
    '& .MuiListItemIcon-root': {
      color: '#FFFFFF',
    },
    '& .MuiListItemText-primary': {
      fontWeight: 600,
    },
    '&::before': {
      transform: 'scaleX(1)',
    },
  },
}));

const ModernIconWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 40,
  height: 40,
  borderRadius: theme.custom?.borderRadius?.sm || 8,
  transition: 'all 0.3s ease',
  position: 'relative',
}));

const SidebarHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  background: alpha(theme.palette.primary.main, 0.05),
  backdropFilter: 'blur(10px)',
}));

const BrandText = styled(Typography)(({ theme }) => ({
  fontWeight: 800,
  fontSize: '1.2rem',
  background:
    theme.custom?.gradients?.primary ||
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  letterSpacing: '-0.02em',
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

  // Modern menu item rendering with animations
  const renderMenuItem = (
    item: {
      id: string;
      text: string;
      icon: React.ReactNode;
    },
    index: number
  ) => (
    <motion.div
      key={item.id}
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      transition={{ delay: index * 0.1 }}
    >
      <ListItem disablePadding>
        <Tooltip title={!open ? item.text : ''} placement="right" arrow>
          <StyledListItemButton
            selected={activePage === item.id}
            onClick={() => onNavigate(item.id)}
            sx={{
              justifyContent: open ? 'initial' : 'center',
              px: open ? 2 : 1.5,
              py: 1.5,
            }}
          >
            <ModernIconWrapper
              sx={{
                minWidth: open ? 40 : 'auto',
                mr: open ? 2 : 'auto',
              }}
            >
              {item.icon}
            </ModernIconWrapper>
            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  style={{ width: '100%' }}
                >
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: '0.95rem',
                      fontWeight: activePage === item.id ? 600 : 500,
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </StyledListItemButton>
        </Tooltip>
      </ListItem>
    </motion.div>
  );

  // Modern drawer content with animations
  const drawer = (
    <>
      <SidebarHeader>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: open ? 'space-between' : 'center',
          }}
        >
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <BrandText variant="h6">Project Log</BrandText>
              </motion.div>
            )}
          </AnimatePresence>
          <IconButton
            onClick={onToggle}
            sx={{
              color: 'primary.main',
              '&:hover': {
                background: alpha(theme.palette.primary.main, 0.1),
                transform: 'scale(1.1)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            <motion.div
              animate={{ rotate: open ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {open ? <ChevronLeftIcon /> : <MenuIcon />}
            </motion.div>
          </IconButton>
        </Box>
      </SidebarHeader>

      <MotionBox
        variants={stagger}
        initial="initial"
        animate="animate"
        sx={{ flexGrow: 1, pt: 2 }}
      >
        <List>
          {mainMenuItems.map((item, index) => renderMenuItem(item, index))}
        </List>
      </MotionBox>

      <Divider
        sx={{
          mx: 2,
          borderColor: alpha(theme.palette.divider, 0.1),
          '&::before, &::after': {
            borderColor: alpha(theme.palette.divider, 0.1),
          },
        }}
      />

      <List sx={{ pb: 2 }}>
        {renderMenuItem(settingsMenuItem, mainMenuItems.length)}
      </List>
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
        <ModernDrawer
          variant="temporary"
          open={open}
          onClose={onToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
            },
            zIndex: theme.zIndex.appBar + 100,
          }}
        >
          {drawer}
        </ModernDrawer>
      </>
    );
  }

  // Modern desktop layout
  return (
    <ModernDrawer
      variant="permanent"
      sx={{
        width: open ? DRAWER_WIDTH : CLOSED_DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? DRAWER_WIDTH : CLOSED_DRAWER_WIDTH,
          boxSizing: 'border-box',
          transition: theme.transitions.create('width', {
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            duration: theme.transitions.duration.complex,
          }),
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {drawer}
    </ModernDrawer>
  );
};
