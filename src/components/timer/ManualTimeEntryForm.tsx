import React from 'react';
import {
  Box,
  Button,
  MenuItem,
  Select,
  TextField,
  useTheme,
} from '@mui/material';
import { useLanguage } from '../../contexts/LanguageContext';
import { Project, TimeEntry } from '../../types';
import { useTimeEntryForm } from './hooks/useTimeEntryForm';
import { DateTimeFields } from './DateTimeFields';
import { GraphiteDialog } from '../ui/graphite/GraphiteDialog';
import { GraphiteField } from '../ui/graphite/GraphiteField';
import { GraphiteNotice } from '../ui/graphite/GraphiteNotice';
import { formatClock } from '../../utils/formatters/clock-format';
import { numberTypography } from '../../styles/modernTheme';
import { projectColorManager } from '../../utils/colorUtils';

interface ManualTimeEntryFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (timeEntry: TimeEntry) => void;
  projects: Project[];
  timeEntry?: TimeEntry;
  /** 重なりの確認に使う */
  timeEntries?: TimeEntry[];
}

const ERROR_KEYS = {
  endBeforeStart: 'timer.manual.error.order',
  tooShort: 'timer.manual.error.short',
  overlap: 'timer.manual.error.overlap',
} as const;

const Swatch: React.FC<{ projectId: string }> = ({ projectId }) => (
  <Box
    component="span"
    sx={{
      width: 8,
      height: 8,
      borderRadius: '3px',
      flex: 'none',
      bgcolor: projectColorManager.getColorById(projectId),
    }}
  />
);

export const ManualTimeEntryForm: React.FC<ManualTimeEntryFormProps> = ({
  open,
  onClose,
  onSave,
  projects,
  timeEntry,
  timeEntries,
}) => {
  const theme = useTheme();
  const { t } = useLanguage();
  const form = useTimeEntryForm({
    open,
    timeEntry,
    timeEntries,
    onSave,
    onClose,
  });
  const { formState, validationError, isLongRecord, isMultiDay, isEditing } =
    form;
  const hours = Math.round((form.durationMs / 3600_000) * 10) / 10;

  const submitLabel = isEditing
    ? t('actions.update')
    : isLongRecord
      ? t('timer.manual.save.anyway')
      : t('actions.save');

  return (
    <GraphiteDialog
      open={open}
      onClose={form.handleClose}
      onSubmit={form.handleSubmit}
      title={isEditing ? t('timer.manual.edit') : t('timer.manual.title')}
      summary={
        validationError ? (
          t('timer.manual.fix.errors')
        ) : (
          <>
            <Box
              component="span"
              sx={{
                ...numberTypography(theme),
                fontSize: 18,
                color: 'text.primary',
                mr: 0.5,
              }}
            >
              {formatClock(form.durationMs, false)}
            </Box>
            {t('timer.manual.will.record')}
          </>
        )
      }
      actions={
        <>
          <Button onClick={form.handleClose}>{t('projects.cancel')}</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!form.isFormValid}
          >
            {submitLabel}
          </Button>
        </>
      }
    >
      <GraphiteField label={t('timer.project')}>
        <Select
          size="small"
          value={formState.projectId}
          onChange={(e) => form.setProjectId(e.target.value)}
          displayEmpty
          inputProps={{ 'aria-label': t('timer.project') }}
          renderValue={(id) => {
            const project = projects.find((p) => p.id === id);
            if (!project)
              return (
                <Box component="span" sx={{ color: 'text.disabled' }}>
                  {t('timer.manual.project.placeholder')}
                </Box>
              );
            return (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Swatch projectId={project.id} />
                {project.name}
              </Box>
            );
          }}
        >
          {projects
            .filter((p) => !p.isArchived)
            .map((p) => (
              <MenuItem key={p.id} value={p.id} sx={{ gap: 1 }}>
                <Swatch projectId={p.id} />
                {p.name}
              </MenuItem>
            ))}
        </Select>
      </GraphiteField>

      <DateTimeFields
        startDate={formState.startDate}
        endDate={formState.endDate}
        startTime={formState.startTime}
        endTime={formState.endTime}
        error={validationError ? t(ERROR_KEYS[validationError]) : undefined}
        onStartDateChange={form.setStartDate}
        onEndDateChange={form.setEndDate}
        onStartTimeChange={form.setStartTime}
        onEndTimeChange={form.setEndTime}
        onSetCurrentTime={form.handleSetCurrentTime}
      />

      {isMultiDay && !validationError && (
        <GraphiteNotice>
          {t('timer.manual.split.notice', { hours })}
        </GraphiteNotice>
      )}

      <GraphiteField
        label={t('timer.manual.note')}
        htmlFor="entry-description"
        optionalLabel={t('form.optional')}
      >
        <TextField
          id="entry-description"
          multiline
          minRows={2}
          size="small"
          placeholder={t('timer.manual.description.placeholder')}
          value={formState.description}
          onChange={(e) => form.setDescription(e.target.value)}
        />
      </GraphiteField>
    </GraphiteDialog>
  );
};
