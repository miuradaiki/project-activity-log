import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  IconButton,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import { Update } from '@mui/icons-material';
import { Project, TimeEntry } from '../../types';
import { v4 as uuidv4 } from 'uuid';

interface ManualTimeEntryFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (timeEntry: TimeEntry) => void;
  projects: Project[];
  timeEntry?: TimeEntry;
}

// export defaultをexportに変更
export const ManualTimeEntryForm: React.FC<ManualTimeEntryFormProps> = ({
  open,
  onClose,
  onSave,
  projects,
  timeEntry,
}) => {
  const { t } = useLanguage();
  const [projectId, setProjectId] = useState<string>('');
  const [date, setDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('17:00');
  const [description, setDescription] = useState<string>('');

  useEffect(() => {
    if (timeEntry) {
      const startDate = new Date(timeEntry.startTime);
      const endDate = new Date(timeEntry.endTime);

      setProjectId(timeEntry.projectId);
      setDate(startDate.toISOString().split('T')[0]);
      setStartTime(startDate.toTimeString().slice(0, 5));
      setEndTime(endDate.toTimeString().slice(0, 5));
      setDescription(timeEntry.description || '');
    }
  }, [timeEntry]);

  const getCurrentTime = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  };

  const handleSetCurrentTime = (target: 'start' | 'end') => {
    const currentTime = getCurrentTime();
    if (target === 'start') {
      setStartTime(currentTime);
    } else {
      setEndTime(currentTime);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);
    const duration = endDateTime.getTime() - startDateTime.getTime();

    // 時間がマイナスまたは0の場合はエラー
    if (duration <= 0) {
      alert('終了時間は開始時間より後である必要があります。');
      return;
    }

    // 1分未満（60000ミリ秒）の場合はエラー
    if (duration < 60000) {
      alert('1分未満の時間エントリは保存できません。');
      return;
    }

    const timestamp = new Date().toISOString();

    const newTimeEntry: TimeEntry = {
      id: timeEntry?.id || uuidv4(),
      projectId,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      description,
      createdAt: timeEntry?.createdAt || timestamp,
      updatedAt: timestamp,
    };

    onSave(newTimeEntry);
    handleClose();
  };

  const handleClose = () => {
    setProjectId('');
    setDate(new Date().toISOString().split('T')[0]);
    setStartTime('09:00');
    setEndTime('17:00');
    setDescription('');
    onClose();
  };

  const isFormValid = projectId && date && startTime && endTime;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {timeEntry ? t('timer.manual.edit') : t('timer.manual.title')}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>{t('timer.project')}</InputLabel>
              <Select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                label={t('timer.project')}
                required
              >
                {projects
                  .filter((project) => !project.isArchived)
                  .map((project) => (
                    <MenuItem key={project.id} value={project.id}>
                      {project.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            <TextField
              label={t('timer.date')}
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label={t('timer.start.time')}
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title={t('timer.now.start')}>
                        <IconButton
                          onClick={() => handleSetCurrentTime('start')}
                          edge="end"
                          size="small"
                          sx={{ mr: -0.5, color: 'primary.main' }}
                        >
                          <Update fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label={t('timer.end.time')}
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title={t('timer.now.end')}>
                        <IconButton
                          onClick={() => handleSetCurrentTime('end')}
                          edge="end"
                          size="small"
                          sx={{ mr: -0.5, color: 'primary.main' }}
                        >
                          <Update fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <TextField
              label={t('timer.description')}
              multiline
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>{t('projects.cancel')}</Button>
          <Button type="submit" variant="contained" disabled={!isFormValid}>
            {timeEntry ? t('actions.update') : t('actions.save')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
