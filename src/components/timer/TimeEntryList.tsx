import React, { useState } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  Paper,
  Typography,
  Box,
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { TimeEntry, Project } from '../../types';
import { DeleteConfirmDialog } from '../DeleteConfirmDialog';

interface TimeEntryListProps {
  timeEntries: TimeEntry[];
  projects: Project[];
  onDeleteTimeEntry: (id: string) => void;
  onEditTimeEntry: (timeEntry: TimeEntry) => void;
}

export const TimeEntryList: React.FC<TimeEntryListProps> = ({
  timeEntries,
  projects,
  onDeleteTimeEntry,
  onEditTimeEntry,
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<TimeEntry | null>(null);

  const formatDuration = (startTime: string, endTime: string | null) => {
    const start = new Date(startTime).getTime();
    const end = endTime ? new Date(endTime).getTime() : new Date().getTime();
    const diff = end - start;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) {
      console.warn(`Project not found for ID: ${projectId}`);
    }
    return project ? project.name : 'Unknown Project';
  };

  const handleDeleteClick = (entry: TimeEntry) => {
    setEntryToDelete(entry);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (entryToDelete) {
      onDeleteTimeEntry(entryToDelete.id);
    }
    setDeleteDialogOpen(false);
    setEntryToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setEntryToDelete(null);
  };

  const sortedEntries = [...timeEntries].sort(
    (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );

  return (
    <>
      <Paper elevation={2} sx={{ p: 2 }}>
        <Typography variant="h6" component="div" gutterBottom>
          作業履歴
        </Typography>
        <List>
          {sortedEntries.map((entry) => (
            <ListItem
              key={entry.id}
              secondaryAction={
                <Box>
                  <IconButton 
                    edge="end" 
                    aria-label="edit"
                    onClick={() => onEditTimeEntry(entry)}
                    sx={{ mr: 1 }}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton 
                    edge="end" 
                    aria-label="delete"
                    onClick={() => handleDeleteClick(entry)}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              }
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1" component="div">
                      {getProjectName(entry.projectId)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" component="div">
                      {formatDuration(entry.startTime, entry.endTime)}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Box component="div">
                    <Typography variant="body2" component="div">
                      {formatTime(entry.startTime)} - {entry.endTime ? formatTime(entry.endTime) : 'Running'}
                    </Typography>
                    {entry.description && (
                      <Typography variant="body2" color="text.secondary" component="div">
                        {entry.description}
                      </Typography>
                    )}
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        title="作業記録の削除"
        message={`${getProjectName(entryToDelete?.projectId || '')}の作業記録を削除してもよろしいですか？\nこの操作は取り消せません。`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </>
  );
};