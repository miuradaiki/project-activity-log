import React, { useState, useEffect } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  Tooltip,
  IconButton,
  Typography,
  useTheme,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Language as LanguageIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { useLanguage } from '../../contexts/LanguageContext';

interface LanguageSwitcherProps {
  variant?: 'icon' | 'button';
  showText?: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'icon',
  showText = false,
}) => {
  const theme = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // 現在の言語をログ出力
  useEffect(() => {}, [language]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (newLanguage: 'ja' | 'en') => {
    console.log(`Language switcher: changing to ${newLanguage}`);
    setLanguage(newLanguage);
    handleClose();
  };

  if (variant === 'icon') {
    return (
      <>
        <Tooltip title={t('language')}>
          <IconButton
            onClick={handleClick}
            color="inherit"
            aria-controls={open ? 'language-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
          >
            <LanguageIcon />
          </IconButton>
        </Tooltip>
        <Menu
          id="language-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'language-button',
          }}
        >
          <MenuItem
            onClick={() => handleLanguageChange('ja')}
            selected={language === 'ja'}
          >
            {language === 'ja' && (
              <ListItemIcon>
                <CheckIcon fontSize="small" />
              </ListItemIcon>
            )}
            <ListItemText>{t('language.japanese')}</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => handleLanguageChange('en')}
            selected={language === 'en'}
          >
            {language === 'en' && (
              <ListItemIcon>
                <CheckIcon fontSize="small" />
              </ListItemIcon>
            )}
            <ListItemText>{t('language.english')}</ListItemText>
          </MenuItem>
        </Menu>
      </>
    );
  }

  return (
    <>
      <Button
        onClick={handleClick}
        variant="text"
        color="inherit"
        startIcon={<LanguageIcon />}
        size={showText ? 'medium' : 'small'}
      >
        {showText && <Typography variant="body2">{t('language')}</Typography>}
      </Button>
      <Menu
        id="language-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'language-button',
        }}
      >
        <MenuItem
          onClick={() => handleLanguageChange('ja')}
          selected={language === 'ja'}
        >
          {language === 'ja' && (
            <ListItemIcon>
              <CheckIcon fontSize="small" />
            </ListItemIcon>
          )}
          <ListItemText>{t('language.japanese')}</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => handleLanguageChange('en')}
          selected={language === 'en'}
        >
          {language === 'en' && (
            <ListItemIcon>
              <CheckIcon fontSize="small" />
            </ListItemIcon>
          )}
          <ListItemText>{t('language.english')}</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};
