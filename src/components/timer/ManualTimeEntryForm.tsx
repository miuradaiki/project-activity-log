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
  Typography,
  Alert,
} from '@mui/material';
import { Update, CalendarToday } from '@mui/icons-material';
import { Project, TimeEntry } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import {
  addDays,
  format,
  isSameDay,
  differenceInHours,
  differenceInMinutes,
} from 'date-fns';

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
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('17:00');
  const [description, setDescription] = useState<string>('');

  useEffect(() => {
    if (timeEntry) {
      const startDateTime = new Date(timeEntry.startTime);
      const endDateTime = new Date(timeEntry.endTime);

      setProjectId(timeEntry.projectId);
      setStartDate(startDateTime.toISOString().split('T')[0]);
      setEndDate(endDateTime.toISOString().split('T')[0]);
      setStartTime(startDateTime.toTimeString().slice(0, 5));
      setEndTime(endDateTime.toTimeString().slice(0, 5));
      setDescription(timeEntry.description || '');
    } else {
      // 新規作成時は初期値にリセット
      const today = new Date().toISOString().split('T')[0];
      setStartDate(today);
      setEndDate(today);
      setStartTime('09:00');
      setEndTime('17:00');
      setDescription('');
      setProjectId('');
    }
  }, [timeEntry]);

  const getCurrentTime = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  };

  // 分単位を時間・分形式に変換するヘルパー関数
  const formatHoursAndMinutes = (totalMinutes: number): string => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0) {
      return `${minutes}分`;
    } else if (minutes === 0) {
      return `${hours}時間`;
    } else {
      return `${hours}時間${minutes}分`;
    }
  };

  const handleSetCurrentTime = (target: 'start' | 'end') => {
    const currentTime = getCurrentTime();
    const currentDate = new Date().toISOString().split('T')[0];

    if (target === 'start') {
      setStartTime(currentTime);
      setStartDate(currentDate);
    } else {
      setEndTime(currentTime);
      setEndDate(currentDate);
    }
  };

  // 自動分割機能：日跨ぎエントリーを複数のエントリーに分割
  const createSplitEntries = (
    projectId: string,
    startDateTime: Date,
    endDateTime: Date,
    description: string
  ): TimeEntry[] => {
    const entries: TimeEntry[] = [];
    let currentStart = new Date(startDateTime);
    const timestamp = new Date().toISOString();

    while (currentStart < endDateTime) {
      const currentEnd = new Date(currentStart);
      currentEnd.setHours(23, 59, 59, 999); // その日の終わり

      if (currentEnd > endDateTime) {
        currentEnd.setTime(endDateTime.getTime());
      }

      const entry: TimeEntry = {
        id: uuidv4(),
        projectId,
        startTime: currentStart.toISOString(),
        endTime: currentEnd.toISOString(),
        description:
          entries.length === 0
            ? description
            : `${description} (${entries.length + 1}日目)`,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      entries.push(entry);

      // 次の日の開始時刻を設定
      currentStart = addDays(currentStart, 1);
      currentStart.setHours(0, 0, 0, 0);
    }

    return entries;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);
    const duration = endDateTime.getTime() - startDateTime.getTime();

    // 時間がマイナスまたは0の場合はエラー
    if (duration <= 0) {
      window.alert('終了時間は開始時間より後である必要があります。');
      return;
    }

    // 1分未満（60000ミリ秒）の場合はエラー
    if (duration < 60000) {
      window.alert('1分未満の時間エントリは保存できません。');
      return;
    }

    // 24時間を超える場合の警告
    const hours = differenceInHours(endDateTime, startDateTime);
    if (hours > 24) {
      const confirmResult = window.confirm(
        `${hours}時間の長時間記録になります。続行しますか？`
      );
      if (!confirmResult) {
        return;
      }
    }

    const timestamp = new Date().toISOString();

    // 編集の場合は単純に更新
    if (timeEntry) {
      const updatedTimeEntry: TimeEntry = {
        ...timeEntry,
        projectId,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        description,
        updatedAt: timestamp,
      };
      onSave(updatedTimeEntry);
      handleClose();
      return;
    }

    // 新規作成の場合
    const isMultiDay = !isSameDay(startDateTime, endDateTime);

    if (isMultiDay) {
      // 日跨ぎの場合は常に自動分割
      const splitEntries = createSplitEntries(
        projectId,
        startDateTime,
        endDateTime,
        description
      );

      // 複数のエントリーを順次保存
      splitEntries.forEach((entry) => onSave(entry));
    } else {
      // 通常の単一エントリー
      const newTimeEntry: TimeEntry = {
        id: uuidv4(),
        projectId,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        description,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      onSave(newTimeEntry);
    }

    handleClose();
  };

  const handleClose = () => {
    setProjectId('');
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
    setStartTime('09:00');
    setEndTime('17:00');
    setDescription('');
    onClose();
  };

  const isFormValid = projectId && startDate && endDate && startTime && endTime;
  const isMultiDay = !isSameDay(new Date(startDate), new Date(endDate));

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

            {/* 開始日・終了日フィールド */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label={t('timer.start.date') || '開始日'}
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  // 開始日が終了日より後の場合、終了日も同じ日に設定
                  if (new Date(e.target.value) > new Date(endDate)) {
                    setEndDate(e.target.value);
                  }
                }}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarToday fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label={t('timer.end.date') || '終了日'}
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarToday fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* 日跨ぎの警告表示 */}
            {isMultiDay && (
              <Alert severity="info" sx={{ mb: 1 }}>
                <Typography variant="body2">
                  {formatHoursAndMinutes(
                    differenceInMinutes(
                      new Date(`${endDate}T${endTime}`),
                      new Date(`${startDate}T${startTime}`)
                    )
                  )}
                  ({format(new Date(startDate), 'M/d')} -{' '}
                  {format(new Date(endDate), 'M/d')}) の記録になります。
                </Typography>
              </Alert>
            )}

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
            {timeEntry
              ? t('actions.update')
              : !timeEntry && isMultiDay
                ? `${formatHoursAndMinutes(differenceInMinutes(new Date(`${endDate}T${endTime}`), new Date(`${startDate}T${startTime}`)))}を日別に保存`
                : t('actions.save')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
