import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Pagination,
  Tab,
  Tabs,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Chip,
  InputAdornment,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  FilterList as FilterIcon,
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
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<TimeEntry | null>(null);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline');
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
  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleViewModeChange = (_event: React.SyntheticEvent, newValue: 'timeline' | 'list') => {
    setViewMode(newValue);
  };

  const handleProjectFilterChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setFilterProject(event.target.value as string[]);
    setPage(1);  // フィルター変更時にページを1に戻す
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1);  // 検索語句変更時にページを1に戻す
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  // エントリーのフィルタリング
  const filteredEntries = timeEntries.filter(entry => {
    // プロジェクトフィルター
    const projectFilterPass = filterProject.length === 0 || filterProject.includes(entry.projectId);
    
    // 検索フィルター
    const project = projects.find(p => p.id === entry.projectId);
    const searchFilterPass = searchTerm === '' || 
      (project && project.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (entry.description && entry.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
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
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : 'Unknown Project';
  };

  return (
    <Paper elevation={2} sx={{ p: { xs: 2, md: 3 } }}>
      {/* ヘッダー部分 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h6">
          作業履歴
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <ExportButton />
        </Box>
      </Box>

      {/* フィルターとビュー切替 */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          gap: 2,
          mb: 2
        }}>
          {/* 検索フィールド */}
          <OutlinedInput
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="検索..."
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
                  <IconButton
                    size="small"
                    onClick={clearSearch}
                    edge="end"
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              )
            }
            sx={{ flex: 1 }}
          />

          {/* プロジェクトフィルター */}
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="project-filter-label">プロジェクト</InputLabel>
            <Select
              labelId="project-filter-label"
              multiple
              value={filterProject}
              onChange={handleProjectFilterChange}
              input={<OutlinedInput label="プロジェクト" />}
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
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* ビュータブ */}
        <Tabs
          value={viewMode}
          onChange={handleViewModeChange}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            icon={<CalendarIcon fontSize="small" />} 
            iconPosition="start"
            label={!isMobile ? "タイムライン" : undefined} 
            value="timeline" 
          />
          <Tab 
            icon={<FilterIcon fontSize="small" />} 
            iconPosition="start"
            label={!isMobile ? "リスト" : undefined} 
            value="list" 
          />
        </Tabs>
      </Box>

      {/* タイムラインまたはリスト表示 */}
      <Box sx={{ minHeight: 300 }}>
        {filteredEntries.length > 0 ? (
          <>
            {viewMode === 'timeline' ? (
              <TimelineView
                timeEntries={paginatedEntries}
                projects={projects}
                onEdit={onEditTimeEntry}
                onDelete={handleDeleteClick}
              />
            ) : (
              <Box>
                {/* TODO: リスト表示コンポーネント */}
                <Typography>リスト表示は開発中です...</Typography>
              </Box>
            )}
          </>
        ) : (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: 200 
          }}>
            <Typography variant="body1" color="text.secondary">
              該当する作業記録がありません
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
            size={isMobile ? "small" : "medium"}
          />
        </Box>
      )}

      {/* 削除確認ダイアログ */}
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