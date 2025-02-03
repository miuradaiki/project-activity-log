import React, { useState, useEffect } from 'react';
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
  const [projectId, setProjectId] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
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
        {timeEntry ? '作業時間の編集' : '作業時間の手動入力'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>プロジェクト</InputLabel>
              <Select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                label="プロジェクト"
                required
              >
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="日付"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="開始時間"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="現在時刻を開始時刻にセット">
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
                label="終了時間"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="現在時刻を終了時刻にセット">
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
              label="説明"
              multiline
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>キャンセル</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!isFormValid}
          >
            {timeEntry ? '更新' : '保存'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
