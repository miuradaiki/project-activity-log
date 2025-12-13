import React, { useState } from 'react';
import { Box, TextField, Button, Fade } from '@mui/material';
import { Check, Close } from '@mui/icons-material';
import { useLanguage } from '../../../contexts/LanguageContext';

interface NoteEditorProps {
  isEditing: boolean;
  onSave: (note: string) => void;
  onCancel: () => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  isEditing,
  onSave,
  onCancel,
}) => {
  const { t } = useLanguage();
  const [note, setNote] = useState<string>('');

  const handleSave = () => {
    if (note.trim()) {
      onSave(note);
    }
    setNote('');
    onCancel();
  };

  const handleCancel = () => {
    setNote('');
    onCancel();
  };

  if (!isEditing) return null;

  return (
    <Fade in={isEditing}>
      <Box sx={{ px: 3, pb: 3, pt: 0 }}>
        <TextField
          fullWidth
          multiline
          rows={2}
          variant="outlined"
          placeholder={t('timer.description')}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          autoFocus
          sx={{ mb: 1 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button
            variant="text"
            size="small"
            onClick={handleCancel}
            startIcon={<Close fontSize="small" />}
          >
            {t('projects.cancel')}
          </Button>
          <Button
            variant="contained"
            size="small"
            color="primary"
            onClick={handleSave}
            startIcon={<Check fontSize="small" />}
          >
            {t('actions.save')}
          </Button>
        </Box>
      </Box>
    </Fade>
  );
};
