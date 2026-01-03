import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Slider,
  TextField,
  InputAdornment,
} from '@mui/material';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { ProjectTargetDialogProps } from './types';

export const ProjectTargetDialog: React.FC<ProjectTargetDialogProps> = ({
  open,
  project,
  baseMonthlyHours,
  onClose,
  onSave,
}) => {
  const { t } = useLanguage();
  const [newMonthlyCapacity, setNewMonthlyCapacity] = useState(
    project.monthlyCapacity * 100
  );

  useEffect(() => {
    if (open) {
      setNewMonthlyCapacity(project.monthlyCapacity * 100);
    }
  }, [open, project.monthlyCapacity]);

  const calculateMonthlyHours = (allocation: number) => {
    return Math.round((allocation / 100) * baseMonthlyHours * 10) / 10;
  };

  const handleSave = () => {
    onSave(newMonthlyCapacity / 100);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('projects.monthly.target')}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, mb: 4 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {t('projects.name')}: {project.name}
          </Typography>

          <Box sx={{ mt: 3 }}>
            <Typography id="monthly-capacity-slider" gutterBottom>
              {t('projects.utilization')}: {newMonthlyCapacity.toFixed(0)}%
            </Typography>
            <Slider
              value={newMonthlyCapacity}
              onChange={(_event, newValue) =>
                setNewMonthlyCapacity(newValue as number)
              }
              aria-labelledby="monthly-capacity-slider"
              valueLabelDisplay="auto"
              step={5}
              marks
              min={0}
              max={100}
              sx={{ mt: 2, mb: 4 }}
            />

            <TextField
              label={t('projects.monthly.target')}
              type="number"
              value={calculateMonthlyHours(newMonthlyCapacity)}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    {t('units.hours')}
                  </InputAdornment>
                ),
              }}
              variant="outlined"
              fullWidth
              size="small"
              helperText={`${t('projects.utilization')}${t('settings.monthly.hours.example', { hours: baseMonthlyHours })}`}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('projects.cancel')}</Button>
        <Button onClick={handleSave} variant="contained">
          {t('actions.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
