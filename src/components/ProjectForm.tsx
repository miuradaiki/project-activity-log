import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Slider,
  Alert,
} from '@mui/material';
import { Project } from '../types';

interface ProjectFormProps {
  open: boolean;
  project?: Project;
  projects?: Project[];
  onClose: () => void;
  onSave: (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const BASE_MONTHLY_HOURS = 140; // 基準となる月間時間

export const ProjectForm: React.FC<ProjectFormProps> = ({
  open,
  project,
  projects = [],
  onClose,
  onSave,
}) => {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [monthlyCapacity, setMonthlyCapacity] = useState(0);
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description);
      setMonthlyCapacity(project.monthlyCapacity);
    } else {
      setName('');
      setDescription('');
      setMonthlyCapacity(0);
    }
    setWarning(null);
  }, [project, open]);

  const calculateTotalCapacity = useCallback((capacity: number): number => {
    const otherProjectsCapacity = projects
      .filter(p => p.id !== project?.id && !p.isArchived) // アーカイブされたプロジェクトを除外
      .reduce((sum, p) => sum + p.monthlyCapacity, 0);
    return otherProjectsCapacity + capacity;
  }, [projects, project]);

  useEffect(() => {
    const totalCapacity = calculateTotalCapacity(monthlyCapacity);
    if (totalCapacity > 1) {
      setWarning(`${t('projects.utilization')}${(totalCapacity * 100).toFixed(1)}%。`);
    } else {
      setWarning(null);
    }
  }, [monthlyCapacity, calculateTotalCapacity]);

  const handleSave = () => {
    if (!name.trim()) {
      setWarning(t('projects.name.required'));
      return;
    }

    // 保存処理を実行
    onSave({
      name: name.trim(),
      description: description.trim(),
      monthlyCapacity,
    });

    handleClose();
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setMonthlyCapacity(0);
    setWarning(null);
    onClose();
  };

  const handleCapacityChange = (_: Event, newValue: number | number[]) => {
    setMonthlyCapacity(newValue as number);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {project ? t('projects.edit') : t('projects.new')}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label={t('projects.name')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            error={!name.trim() && warning !== null}
            helperText={!name.trim() && warning !== null ? t('projects.name.required') : ''}
          />

          <TextField
            label={t('projects.description')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={3}
            fullWidth
          />

          <Box sx={{ mt: 2 }}>
            <Typography gutterBottom>
              {t('projects.utilization')}: {(monthlyCapacity * 100).toFixed(1)}%
            </Typography>
            <Slider
              value={monthlyCapacity}
              onChange={handleCapacityChange}
              min={0}
              max={1}
              step={0.05}
              marks={[
                { value: 0, label: '0%' },
                { value: 0.25, label: '25%' },
                { value: 0.5, label: '50%' },
                { value: 0.75, label: '75%' },
                { value: 1, label: '100%' },
              ]}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${(value * 100).toFixed(1)}%`}
            />
            <Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>
              {t('projects.monthly.target')}: {(monthlyCapacity * BASE_MONTHLY_HOURS).toFixed(1)} {t('units.hours')}/{t('time.this.month')}
            </Typography>
          </Box>

          {warning && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              {warning}
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>{t('projects.cancel')}</Button>
        <Button onClick={handleSave} variant="contained">
          {t('actions.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};