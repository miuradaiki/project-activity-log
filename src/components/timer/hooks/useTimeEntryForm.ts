import React, { useState, useEffect, useCallback } from 'react';
import { TimeEntry } from '../../../types';
import { isSameDay, differenceInHours, format } from 'date-fns';
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
  /** 開くたびに初期値（今日の日付）を作り直すために使う */
  open?: boolean;
  timeEntry?: TimeEntry;
  onSave: (timeEntry: TimeEntry) => void;
  onClose: () => void;
}

export type TimeEntryValidationError = 'endBeforeStart' | 'tooShort';

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
  /** 入力中の値から常に計算する。alert で止める代わりにフォーム内に表示するため */
  validationError: TimeEntryValidationError | null;
  durationMs: number;
  /** 24時間を超える記録。確認ダイアログの代わりに注意を出し、ボタン文言で同意を取る */
  isLongRecord: boolean;
  handleSetCurrentTime: (target: 'start' | 'end') => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleClose: () => void;
}

// toISOString は UTC の日付になり、JST 0〜9時に前日へずれるためローカル時刻で作る
const toLocalDate = (d: Date): string => format(d, 'yyyy-MM-dd');

const MIN_DURATION_MS = 60_000;

const getValidationError = (
  durationMs: number
): TimeEntryValidationError | null => {
  if (Number.isNaN(durationMs)) return null;
  if (durationMs <= 0) return 'endBeforeStart';
  if (durationMs < MIN_DURATION_MS) return 'tooShort';
  return null;
};

const getDefaultFormState = (): FormState => {
  const today = toLocalDate(new Date());
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
  open,
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
        startDate: toLocalDate(startDateTime),
        endDate: toLocalDate(endDateTime),
        startTime: startDateTime.toTimeString().slice(0, 5),
        endTime: endDateTime.toTimeString().slice(0, 5),
        description: timeEntry.description || '',
      });
    } else {
      setFormState(getDefaultFormState());
    }
  }, [timeEntry, open]);

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
    const currentDate = toLocalDate(now);

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
      const durationMs = endDateTime.getTime() - startDateTime.getTime();
      if (Number.isNaN(durationMs) || getValidationError(durationMs)) return;

      const timestamp = new Date().toISOString();
      const entries = createSplitEntries(
        projectId,
        startDateTime,
        endDateTime,
        description
      );
      if (timeEntry) {
        // 最初の日の分は元の記録として上書きし、翌日以降の分を新しい記録として追加する
        entries[0] = {
          ...timeEntry,
          projectId,
          startTime: entries[0].startTime,
          endTime: entries[0].endTime,
          description,
          updatedAt: timestamp,
        };
      }
      entries.forEach((entry) => onSave(entry));

      handleClose();
    },
    [formState, timeEntry, onSave, handleClose]
  );

  const startAt = new Date(`${formState.startDate}T${formState.startTime}`);
  const endAt = new Date(`${formState.endDate}T${formState.endTime}`);
  const durationMs = endAt.getTime() - startAt.getTime();
  const validationError = getValidationError(durationMs);
  const isLongRecord =
    !validationError && differenceInHours(endAt, startAt) > 24;

  const isFormValid = Boolean(
    formState.projectId &&
    formState.startDate &&
    formState.endDate &&
    formState.startTime &&
    formState.endTime &&
    !validationError
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
    validationError,
    durationMs: Number.isNaN(durationMs) ? 0 : durationMs,
    isLongRecord,
    handleSetCurrentTime,
    handleSubmit,
    handleClose,
  };
};
