import React from 'react';
import {
  Box,
  Typography,
  Divider,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  InputAdornment,
  Slider,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useLanguage } from '../../contexts/LanguageContext';
import { APP_CONSTANTS } from '../../constants';
import { formatHours } from '../../utils/formatters/timeFormatters';

interface WorkHoursSettingsProps {
  baseMonthlyHours: number;
  onBaseMonthlyHoursChange: (value: number) => void;
  onSave: () => void;
  onReset: () => void;
}

export const WorkHoursSettings: React.FC<WorkHoursSettingsProps> = ({
  baseMonthlyHours,
  onBaseMonthlyHoursChange,
  onSave,
  onReset,
}) => {
  const theme = useTheme();
  const { t } = useLanguage();

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
          <AccessTimeIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">{t('settings.monthly.hours')}</Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />

        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography id="monthly-hours-slider" gutterBottom>
              {t('settings.monthly.hours')}
            </Typography>
            <Tooltip title={t('settings.monthly.hours.description')}>
              <IconButton
                size="small"
                sx={{ ml: 1 }}
                aria-label={t('aria.settings.info')}
              >
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          <Grid container spacing={2} alignItems="center">
            <Grid
              size={{
                xs: 12,
                md: 8,
              }}
            >
              <Slider
                value={baseMonthlyHours}
                onChange={(_, newValue) =>
                  onBaseMonthlyHoursChange(newValue as number)
                }
                aria-labelledby="monthly-hours-slider"
                valueLabelDisplay="auto"
                step={5}
                marks={[
                  { value: 100, label: '100h' },
                  { value: 140, label: '140h' },
                  { value: 180, label: '180h' },
                ]}
                min={APP_CONSTANTS.PROJECT.MIN_MONTHLY_HOURS}
                max={APP_CONSTANTS.PROJECT.MAX_MONTHLY_HOURS}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                md: 4,
              }}
            >
              <TextField
                label={t('settings.monthly.hours.label')}
                type="number"
                value={baseMonthlyHours}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (
                    value >= APP_CONSTANTS.PROJECT.MIN_MONTHLY_HOURS &&
                    value <= APP_CONSTANTS.PROJECT.MAX_MONTHLY_HOURS
                  ) {
                    onBaseMonthlyHoursChange(value);
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {t('units.hours')}
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
                size="small"
                fullWidth
              />
            </Grid>
          </Grid>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            {t('settings.monthly.hours.example', {
              hours: formatHours(baseMonthlyHours * 0.5),
            })}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={onReset}
          >
            {t('settings.reset')}
          </Button>
          <Button variant="contained" startIcon={<SaveIcon />} onClick={onSave}>
            {t('settings.save')}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};
