import React, { useState, useEffect, useCallback } from 'react';
import { TimeEntry } from '../../../types';
import { v4 as uuidv4 } from 'uuid';
import { isSameDay, differenceInHours } from 'date-fns';
import { createSplitEntries } from '../../../utils/timeEntryUtils';

interface FormState {
  projectId: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  description: string;
}

interface UseTimeEntryFormProps {
  timeEntry?: TimeEntry;
  onSave: (timeEntry: TimeEntry) => void;
  onClose: () => void;
}

interface UseTimeEntryFormReturn {
  formState: FormState;
  setProjectId: (value: string) => void;
  setStartDate: (value: string) => void;
  setEndDate: (value: string) => void;
  setStartTime: (value: string) => void;
  setEndTime: (value: string) => void;
  setDescription: (value: string) => void;
  isEditing: boolean;
  isMultiDay: boolean;
  isFormValid: boolean;
  handleSetCurrentTime: (target: 'start' | 'end') => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleClose: () => void;
}

const getDefaultFormState = (): FormState => {
  const today = new Date().toISOString().split('T')[0];
  return {
    projectId: '',
    startDate: today,
    endDate: today,
    startTime: '09:00',
    endTime: '17:00',
    description: '',
  };
};

export const useTimeEntryForm = ({
  timeEntry,
  onSave,
  onClose,
}: UseTimeEntryFormProps): UseTimeEntryFormReturn => {
  const [formState, setFormState] = useState<FormState>(getDefaultFormState());

  const isEditing = !!timeEntry;

  useEffect(() => {
    if (timeEntry) {
      const startDateTime = new Date(timeEntry.startTime);
      const endDateTime = new Date(timeEntry.endTime);

      setFormState({
        projectId: timeEntry.projectId,
        startDate: startDateTime.toISOString().split('T')[0],
        endDate: startDateTime.toISOString().split('T')[0],
        startTime: startDateTime.toTimeString().slice(0, 5),
        endTime: endDateTime.toTimeString().slice(0, 5),
        description: timeEntry.description || '',
      });
    } else {
      setFormState(getDefaultFormState());
    }
  }, [timeEntry]);

  const setProjectId = useCallback((value: string) => {
    setFormState((prev) => ({ ...prev, projectId: value }));
  }, []);

  const setStartDate = useCallback((value: string) => {
    setFormState((prev) => {
      const newEndDate =
        new Date(value) > new Date(prev.endDate) ? value : prev.endDate;
      return { ...prev, startDate: value, endDate: newEndDate };
    });
  }, []);

  const setEndDate = useCallback((value: string) => {
    setFormState((prev) => ({ ...prev, endDate: value }));
  }, []);

  const setStartTime = useCallback((value: string) => {
    setFormState((prev) => ({ ...prev, startTime: value }));
  }, []);

  const setEndTime = useCallback((value: string) => {
    setFormState((prev) => ({ ...prev, endTime: value }));
  }, []);

  const setDescription = useCallback((value: string) => {
    setFormState((prev) => ({ ...prev, description: value }));
  }, []);

  const handleSetCurrentTime = useCallback((target: 'start' | 'end') => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const currentDate = now.toISOString().split('T')[0];

    if (target === 'start') {
      setFormState((prev) => ({
        ...prev,
        startTime: currentTime,
        startDate: currentDate,
      }));
    } else {
      setFormState((prev) => ({
        ...prev,
        endTime: currentTime,
        endDate: currentDate,
      }));
    }
  }, []);

  const resetForm = useCallback(() => {
    setFormState(getDefaultFormState());
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const { projectId, startDate, endDate, startTime, endTime, description } =
        formState;
      const startDateTime = new Date(`${startDate}T${startTime}`);
      const endDateTime = new Date(`${endDate}T${endTime}`);
      const duration = endDateTime.getTime() - startDateTime.getTime();

      if (duration <= 0) {
        window.alert('終了時間は開始時間より後である必要があります。');
        return;
      }

      if (duration < 60000) {
        window.alert('1分未満の時間エントリは保存できません。');
        return;
      }

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

      const isMultiDay = !isSameDay(startDateTime, endDateTime);

      if (isMultiDay) {
        const splitEntries = createSplitEntries(
          projectId,
          startDateTime,
          endDateTime,
          description
        );
        splitEntries.forEach((entry) => onSave(entry));
      } else {
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
    },
    [formState, timeEntry, onSave, handleClose]
  );

  const isFormValid = Boolean(
    formState.projectId &&
      formState.startDate &&
      formState.endDate &&
      formState.startTime &&
      formState.endTime
  );

  const isMultiDay = !isSameDay(
    new Date(formState.startDate),
    new Date(formState.endDate)
  );

  return {
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
  };
};
