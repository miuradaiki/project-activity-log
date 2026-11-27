import React, { useMemo, useState } from 'react';
import {
  Box,
  ButtonBase,
  IconButton,
  InputAdornment,
  MenuItem,
  OutlinedInput,
  Select,
  useTheme,
} from '@mui/material';
import {
  DeleteOutline as DeleteIcon,
  EditOutlined as EditIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { isToday, isYesterday } from 'date-fns';
import { Project, TimeEntry } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { GraphiteCard } from '../ui/graphite/GraphiteCard';
import { ExportButton } from '../ExportButton';
import { projectColorManager } from '../../utils/colorUtils';
import { calculateDuration } from '../../utils/analytics/common';
import { formatClock } from '../../utils/formatters/clock-format';
import { numberTypography } from '../../styles/modernTheme';
import { filterHistory, groupEntriesByDay } from './history-groups';

interface EntryHistoryProps {
  timeEntries: TimeEntry[];
  projects: Project[];
  onEdit: (entry: TimeEntry) => void;
  onDelete: (id: string) => void;
}

const PAGE_SIZE = 20;
const ROW_COLUMNS = '10px minmax(0,1.2fr) 110px minmax(0,1.6fr) 64px 64px';

export const EntryHistory: React.FC<EntryHistoryProps> = ({
  timeEntries,
  projects,
  onEdit,
  onDelete,
}) => {
  const theme = useTheme();
  const { t, language } = useLanguage();
  const [query, setQuery] = useState('');
  const [projectId, setProjectId] = useState<string>('');
  const [limit, setLimit] = useState(PAGE_SIZE);

  const filtered = useMemo(
    () => filterHistory(timeEntries, projects, query, projectId || null),
    [timeEntries, projects, query, projectId]
  );
  // 件数で区切ってから日ごとにまとめる（日の途中で切れても合計は表示分の合計）
  const groups = useMemo(() => {
    const sorted = [...filtered].sort(
      (a, b) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
    return groupEntriesByDay(sorted.slice(0, limit));
  }, [filtered, limit]);
  const remaining = Math.max(0, filtered.length - limit);

  const locale = language === 'en' ? 'en-US' : 'ja-JP';
  const timeOf = (iso: string) =>
    new Date(iso).toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
    });
  const projectName = (id: string) =>
    projects.find((p) => p.id === id)?.name ?? t('history.unknown.project');
  const dayLabel = (date: Date) =>
    isToday(date)
      ? t('history.today')
      : isYesterday(date)
        ? t('history.yesterday')
        : '';

  return (
    <GraphiteCard padding={0}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1.25,
          px: 2.5,
          py: 2,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Box
          component="h3"
          sx={{ m: 0, mr: 'auto', fontSize: 14, fontWeight: 600 }}
        >
          {t('timer.history')}
        </Box>
        <OutlinedInput
          size="small"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setLimit(PAGE_SIZE);
          }}
          placeholder={t('history.search.placeholder')}
          inputProps={{ 'aria-label': t('history.search.aria') }}
          startAdornment={
            <InputAdornment position="start">
              <SearchIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
            </InputAdornment>
          }
          sx={{ width: { xs: '100%', sm: 220 }, height: 32, fontSize: 12.5 }}
        />
        <Select
          size="small"
          value={projectId}
          displayEmpty
          onChange={(e) => {
            setProjectId(e.target.value);
            setLimit(PAGE_SIZE);
          }}
          inputProps={{ 'aria-label': t('history.filter.project') }}
          sx={{ width: 180, height: 32, fontSize: 12.5 }}
        >
          <MenuItem value="">{t('history.filter.all')}</MenuItem>
          {projects
            .filter((p) => !p.isArchived)
            .map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.name}
              </MenuItem>
            ))}
        </Select>
        <ExportButton />
      </Box>

      {groups.length === 0 ? (
        <Box
          sx={{
            py: 6,
            textAlign: 'center',
            fontSize: 13,
            color: 'text.secondary',
          }}
        >
          {timeEntries.length === 0
            ? t('history.empty')
            : t('history.no.match')}
        </Box>
      ) : (
        groups.map((g, gi) => {
          const label = dayLabel(g.date);
          const dateText = g.date.toLocaleDateString(locale, {
            month: 'long',
            day: 'numeric',
            weekday: 'short',
          });
          return (
            <Box
              key={g.key}
              role="group"
              aria-label={`${label} ${dateText}`.trim()}
              sx={{
                py: 0.75,
                borderTop: gi === 0 ? 0 : 1,
                borderColor: 'divider',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 1.25,
                  px: 2.5,
                  pt: 1.5,
                  pb: 0.75,
                  fontSize: 12,
                  color: 'text.secondary',
                }}
              >
                {label && (
                  <Box
                    component="b"
                    sx={{
                      color: 'text.primary',
                      fontWeight: 500,
                      fontSize: 12.5,
                    }}
                  >
                    {label}
                  </Box>
                )}
                {dateText}
                <Box
                  sx={{
                    ...numberTypography(theme),
                    fontWeight: 300,
                    ml: 'auto',
                    fontSize: 15,
                    color: 'text.primary',
                  }}
                >
                  {formatClock(g.totalMs, false)}
                </Box>
              </Box>
              <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
                {g.entries.map((e) => (
                  <Box
                    component="li"
                    key={e.id}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: '10px 1fr auto',
                        md: ROW_COLUMNS,
                      },
                      alignItems: 'center',
                      columnGap: 1.75,
                      px: 2.5,
                      minHeight: 46,
                      fontSize: 13,
                      borderTop: 1,
                      borderColor: 'divider',
                      '&:hover, &:focus-within': { bgcolor: 'action.hover' },
                      '&:hover .entry-actions, &:focus-within .entry-actions': {
                        opacity: 1,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '3px',
                        bgcolor: projectColorManager.getColorById(e.projectId),
                      }}
                    />
                    <Box
                      sx={{
                        minWidth: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {projectName(e.projectId)}
                    </Box>
                    <Box
                      sx={{
                        display: { xs: 'none', md: 'block' },
                        color: 'text.secondary',
                        fontSize: 12.5,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {timeOf(e.startTime)} – {timeOf(e.endTime)}
                    </Box>
                    <Box
                      sx={{
                        display: { xs: 'none', md: 'block' },
                        color: 'text.disabled',
                        fontSize: 12.5,
                        minWidth: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={e.description || undefined}
                    >
                      {e.description || '—'}
                    </Box>
                    <Box
                      sx={{
                        ...numberTypography(theme),
                        fontWeight: 300,
                        fontSize: 15,
                        textAlign: 'right',
                      }}
                    >
                      {formatClock(
                        calculateDuration(e.startTime, e.endTime),
                        false
                      )}
                    </Box>
                    <Box
                      className="entry-actions"
                      sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 0.25,
                        opacity: 0,
                        '@media (hover: none)': { opacity: 1 },
                      }}
                    >
                      <IconButton
                        size="small"
                        aria-label={t('aria.entry.edit')}
                        onClick={() => onEdit(e)}
                      >
                        <EditIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                      <IconButton
                        size="small"
                        aria-label={t('aria.entry.delete')}
                        onClick={() => onDelete(e.id)}
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          );
        })
      )}

      {remaining > 0 && (
        <ButtonBase
          onClick={() => setLimit((l) => l + PAGE_SIZE)}
          sx={{
            width: '100%',
            py: 1.5,
            borderTop: 1,
            borderColor: 'divider',
            fontSize: 12.5,
            color: 'text.secondary',
            '&:hover': { color: 'text.primary' },
          }}
        >
          {t('history.more', { count: remaining })}
        </ButtonBase>
      )}
    </GraphiteCard>
  );
};
