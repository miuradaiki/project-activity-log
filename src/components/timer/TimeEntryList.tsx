import React, { useState } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  Paper,
  Typography,
  Box,
  Pagination,
  Divider,
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

const ITEMS_PER_PAGE = 5;

export const TimeEntryList: React.FC<TimeEntryListProps> = ({
  timeEntries,
  projects,
  onDeleteTimeEntry,
  onEditTimeEntry,
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<TimeEntry | null>(null);
  const [page, setPage] = useState(1);

  const formatDuration = (startTime: string, endTime: string | null) => {
    const start = new Date(startTime).getTime();
    const end = endTime ? new Date(endTime).getTime() : new Date().getTime();
    const diff = end - start;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', { 
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'short'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ja-JP', { 
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
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

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  // エントリーを日付でソート
  const sortedEntries = [...timeEntries].sort(
    (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );

  // ページネーション用にエントリーを分割
  const totalPages = Math.ceil(sortedEntries.length / ITEMS_PER_PAGE);
  const paginatedEntries = sortedEntries.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  // 日付ごとにエントリーをグループ化
  const groupedEntries = paginatedEntries.reduce((acc, entry) => {
    const date = formatDate(entry.startTime);
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(entry);
    return acc;
  }, {} as Record<string, TimeEntry[]>);

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        作業履歴
      </Typography>
      <List>
        {Object.entries(groupedEntries).map(([date, entries], groupIndex) => (
          <React.Fragment key={date}>
            {groupIndex > 0 && <Divider />}
            <ListItem>
              <Typography variant="subtitle2" color="text.secondary">
                {date}
              </Typography>
            </ListItem>
            {entries.map((entry) => (
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
                      <Box component="span">
                        {getProjectName(entry.projectId)}
                      </Box>
                      <Box component="span" sx={{ color: 'text.secondary' }}>
                        {formatDuration(entry.startTime, entry.endTime)}
                      </Box>
                    </Box>
                  }
                  secondary={
                    <>
                      <Box component="span" sx={{ display: 'block' }}>
                        {formatTime(entry.startTime)} - {entry.endTime ? formatTime(entry.endTime) : 'Running'}
                      </Box>
                      {entry.description && (
                        <Box component="span" sx={{ display: 'block', color: 'text.secondary' }}>
                          {entry.description}
                        </Box>
                      )}
                    </>
                  }
                />
              </ListItem>
            ))}
          </React.Fragment>
        ))}
      </List>

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        title="作業記録の削除"
        message={`${getProjectName(entryToDelete?.projectId || '')}の作業記録を削除してもよろしいですか？\nこの操作は取り消せません。`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </Paper>
  );
};