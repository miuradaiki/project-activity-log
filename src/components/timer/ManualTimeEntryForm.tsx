import React from 'react';
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
} from '@mui/material';
import { Project, TimeEntry } from '../../types';
import { differenceInMinutes } from 'date-fns';
import { useTimeEntryForm } from './hooks/useTimeEntryForm';
import { DateTimeFields, formatHoursAndMinutes } from './DateTimeFields';

interface ManualTimeEntryFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (timeEntry: TimeEntry) => void;
  projects: Project[];
  timeEntry?: TimeEntry;
}

export const ManualTimeEntryForm: React.FC<ManualTimeEntryFormProps> = ({
  open,
  onClose,
  onSave,
  projects,
  timeEntry,
}) => {
  const { t } = useLanguage();

  const {
    formState,
    setProjectId,
    setStartDate,
    setEndDate,
    setStartTime,
    setEndTime,
    setDescription,
    isEditing,
    isMultiDay,
    isFormValid,
    handleSetCurrentTime,
    handleSubmit,
    handleClose,
  } = useTimeEntryForm({
    timeEntry,
    onSave,
    onClose,
  });

  const getSubmitButtonLabel = (): string => {
    if (timeEntry) {
      return t('actions.update');
    }

    if (isMultiDay) {
      const durationMinutes = differenceInMinutes(
        new Date(`${formState.endDate}T${formState.endTime}`),
        new Date(`${formState.startDate}T${formState.startTime}`)
      );
      return `${formatHoursAndMinutes(durationMinutes)}を日別に保存`;
    }

    return t('actions.save');
  };

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
                value={formState.projectId}
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

            <DateTimeFields
              startDate={formState.startDate}
              endDate={formState.endDate}
              startTime={formState.startTime}
              endTime={formState.endTime}
              isEditing={isEditing}
              isMultiDay={isMultiDay}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              onStartTimeChange={setStartTime}
              onEndTimeChange={setEndTime}
              onSetCurrentTime={handleSetCurrentTime}
            />

            <TextField
              label={t('timer.description')}
              multiline
              rows={3}
              value={formState.description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>{t('projects.cancel')}</Button>
          <Button type="submit" variant="contained" disabled={!isFormValid}>
            {getSubmitButtonLabel()}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
