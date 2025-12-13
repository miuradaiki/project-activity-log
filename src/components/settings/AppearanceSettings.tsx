import React from 'react';
import {
  Box,
  Typography,
  Divider,
  Card,
  CardContent,
  useTheme,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Switch,
} from '@mui/material';
import {
  Translate as TranslateIcon,
  Brightness4,
  Brightness7,
} from '@mui/icons-material';
import { useLanguage } from '../../contexts/LanguageContext';

interface AppearanceSettingsProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onLanguageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({
  isDarkMode,
  onToggleTheme,
  onLanguageChange,
}) => {
  const theme = useTheme();
  const { language, t } = useLanguage();

  return (
    <Card
      elevation={1}
      sx={{
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[4],
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TranslateIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">{t('settings.appearance')}</Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />

        {/* Theme Toggle */}
        <Box sx={{ mb: 4 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {isDarkMode ? (
                <Brightness4 sx={{ mr: 1 }} />
              ) : (
                <Brightness7 sx={{ mr: 1 }} />
              )}
              <Typography variant="body1">{t('settings.darkmode')}</Typography>
            </Box>
            <Switch
              checked={isDarkMode}
              onChange={onToggleTheme}
              color="primary"
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {t('settings.darkmode.description')}
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Language Settings */}
        <Box>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {t('settings.language')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('settings.language.description')}
          </Typography>

          <FormControl component="fieldset">
            <RadioGroup
              aria-label="language"
              name="language"
              value={language}
              onChange={onLanguageChange}
            >
              <FormControlLabel
                value="ja"
                control={<Radio />}
                label={t('language.japanese')}
              />
              <FormControlLabel
                value="en"
                control={<Radio />}
                label={t('language.english')}
              />
            </RadioGroup>
          </FormControl>
        </Box>
      </CardContent>
    </Card>
  );
};
