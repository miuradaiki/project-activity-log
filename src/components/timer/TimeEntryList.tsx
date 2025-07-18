import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  Paper,
  Typography,
  Box,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Chip,
  InputAdornment,
  IconButton,
  SelectChangeEvent,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Search as SearchIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { TimeEntry, Project } from '../../types';
import { DeleteConfirmDialog } from '../DeleteConfirmDialog';
import { ExportButton } from '../ExportButton';
import { TimelineView } from '../ui/TimelineView';

interface TimeEntryListProps {
  timeEntries: TimeEntry[];
  projects: Project[];
  onDeleteTimeEntry: (id: string) => void;
  onEditTimeEntry: (timeEntry: TimeEntry) => void;
}

const ITEMS_PER_PAGE = 10;

export const TimeEntryList: React.FC<TimeEntryListProps> = ({
  timeEntries,
  projects,
  onDeleteTimeEntry,
  onEditTimeEntry,
}) => {
  const theme = useTheme();
  const { t } = useLanguage();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<TimeEntry | null>(null);
  const [page, setPage] = useState(1);
  const [filterProject, setFilterProject] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // 削除ダイアログの処理
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

  // フィルタリングとページネーション
  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  const handleProjectFilterChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setFilterProject(typeof value === 'string' ? value.split(',') : value);
    setPage(1); // フィルター変更時にページを1に戻す
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1); // 検索語句変更時にページを1に戻す
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  // エントリーのフィルタリング
  const filteredEntries = timeEntries.filter((entry) => {
    // プロジェクトフィルター
    const projectFilterPass =
      filterProject.length === 0 || filterProject.includes(entry.projectId);

    // 検索フィルター
    const project = projects.find((p) => p.id === entry.projectId);
    const searchFilterPass =
      searchTerm === '' ||
      (project &&
        project.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (entry.description &&
        entry.description.toLowerCase().includes(searchTerm.toLowerCase()));

    return projectFilterPass && searchFilterPass;
  });

  // エントリーをソート
  const sortedEntries = [...filteredEntries].sort(
    (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );

  // ページネーション
  const totalPages = Math.ceil(sortedEntries.length / ITEMS_PER_PAGE);
  const paginatedEntries = sortedEntries.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const getProjectName = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    return project ? project.name : 'Unknown Project';
  };

  return (
    <Paper elevation={2} sx={{ p: { xs: 2, md: 3 } }}>
      {/* ヘッダー部分 */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography variant="h6">{t('timer.history')}</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <ExportButton />
        </Box>
      </Box>

      {/* フィルターとビュー切替 */}
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
            mb: 2,
          }}
        >
          {/* 検索フィールド */}
          <OutlinedInput
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder={t('timer.search')}
            size="small"
            fullWidth
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            }
            endAdornment={
              searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={clearSearch} edge="end">
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              )
            }
            sx={{ flex: 1 }}
          />

          {/* プロジェクトフィルター */}
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="project-filter-label">
              {t('timer.project')}
            </InputLabel>
            <Select
              labelId="project-filter-label"
              multiple
              value={filterProject}
              onChange={handleProjectFilterChange}
              input={<OutlinedInput label={t('timer.project')} />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as string[]).map((value) => (
                    <Chip
                      key={value}
                      label={getProjectName(value)}
                      size="small"
                    />
                  ))}
                </Box>
              )}
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
        </Box>

        {/* タイトル */}
        <Box
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            p: 1,
            pl: 2,
            mb: 2,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <CalendarIcon fontSize="small" sx={{ mr: 1 }} />
          <Typography variant="subtitle1" fontWeight="medium">
            {t('timer.history.timeline')}
          </Typography>
        </Box>
      </Box>

      {/* タイムライン表示 */}
      <Box sx={{ minHeight: 300 }}>
        {filteredEntries.length > 0 ? (
          <TimelineView
            timeEntries={paginatedEntries}
            projects={projects}
            onEdit={onEditTimeEntry}
            onDelete={handleDeleteClick}
          />
        ) : (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 200,
            }}
          >
            <Typography variant="body1" color="text.secondary">
              {t('timer.no.entries')}
            </Typography>
          </Box>
        )}
      </Box>

      {/* ページネーション */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size={isMobile ? 'small' : 'medium'}
          />
        </Box>
      )}

      {/* 削除確認ダイアログ */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        title={t('timer.delete.confirm')}
        message={t('timer.delete.message')}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </Paper>
  );
};
