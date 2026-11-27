import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  ButtonBase,
  Slider,
  TextField,
  useTheme,
} from '@mui/material';
import { useLanguage } from '../contexts/LanguageContext';
import { Project } from '../types';
import { PROJECT_COLORS, projectColorManager } from '../utils/colorUtils';
import { numberTypography } from '../styles/modernTheme';
import { GraphiteDialog } from './ui/graphite/GraphiteDialog';
import { GraphiteField } from './ui/graphite/GraphiteField';
import { GraphiteNotice } from './ui/graphite/GraphiteNotice';

interface ProjectFormProps {
  open: boolean;
  project?: Project;
  projects?: Project[];
  /** 設定の月間基準時間。配分を時間に換算して示すのに使う */
  baseMonthlyHours: number;
  onClose: () => void;
  onSave: (
    projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>
  ) => void;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

export const ProjectForm: React.FC<ProjectFormProps> = ({
  open,
  project,
  projects = [],
  baseMonthlyHours,
  onClose,
  onSave,
}) => {
  const theme = useTheme();
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [monthlyCapacity, setMonthlyCapacity] = useState(0);
  const [color, setColor] = useState<string>(PROJECT_COLORS[0]);
  const [nameError, setNameError] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(project?.name ?? '');
    setDescription(project?.description ?? '');
    setMonthlyCapacity(project?.monthlyCapacity ?? 0);
    // 既存プロジェクトは今表示されている色を引き継ぎ、保存時に固定する
    setColor(
      project
        ? (project.color ?? projectColorManager.getColorById(project.id))
        : projectColorManager.pickUnusedColor(projects)
    );
    setNameError(false);
    // projects は開いた時点の値で十分（入力中に色の候補が変わらないように）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project, open]);

  const totalCapacity =
    projects
      .filter((p) => p.id !== project?.id && !p.isArchived)
      .reduce((sum, p) => sum + p.monthlyCapacity, 0) + monthlyCapacity;

  const handleSave = () => {
    if (!name.trim()) {
      setNameError(true);
      return;
    }
    onSave({
      name: name.trim(),
      description: description.trim(),
      monthlyCapacity,
      isArchived: project?.isArchived ?? false,
      color,
    });
    onClose();
  };

  return (
    <GraphiteDialog
      open={open}
      onClose={onClose}
      onSubmit={(e) => {
        e.preventDefault();
        handleSave();
      }}
      title={project ? t('projects.edit') : t('projects.new')}
      actions={
        <>
          <Button onClick={onClose}>{t('projects.cancel')}</Button>
          <Button type="submit" variant="contained">
            {t('actions.save')}
          </Button>
        </>
      }
    >
      <GraphiteField
        label={t('projects.form.name')}
        htmlFor="project-name"
        error={nameError ? t('projects.name.required') : undefined}
      >
        <TextField
          id="project-name"
          size="small"
          autoFocus
          value={name}
          error={nameError}
          onChange={(e) => {
            setName(e.target.value);
            if (e.target.value.trim()) setNameError(false);
          }}
        />
      </GraphiteField>

      <GraphiteField
        label={t('projects.description')}
        htmlFor="project-description"
        optionalLabel={t('form.optional')}
      >
        <TextField
          id="project-description"
          size="small"
          placeholder={t('projects.form.description.placeholder')}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </GraphiteField>

      <GraphiteField label={t('projects.form.allocation')}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
          }}
        >
          <Box
            data-testid="allocation-hours"
            sx={{ ...numberTypography(theme), fontWeight: 300, fontSize: 28 }}
          >
            {round1(baseMonthlyHours * monthlyCapacity)}
            <Box
              component="span"
              sx={{
                fontFamily: theme.typography.fontFamily,
                fontSize: 12.5,
                letterSpacing: 0,
                color: 'text.secondary',
                ml: 0.5,
              }}
            >
              {t('projects.form.hours.unit')}
            </Box>
          </Box>
          <Box sx={{ fontSize: 12.5, color: 'text.secondary' }}>
            {t('projects.form.allocation.of', {
              base: baseMonthlyHours,
              percent: Math.round(monthlyCapacity * 100),
            })}
          </Box>
        </Box>
        <Slider
          value={monthlyCapacity}
          onChange={(_, v) => setMonthlyCapacity(v as number)}
          min={0}
          max={1}
          step={0.05}
          aria-label={t('projects.form.allocation')}
          getAriaValueText={(v) => `${Math.round(v * 100)}%`}
          sx={{
            color: 'text.primary',
            height: 4,
            py: 1.25,
            '& .MuiSlider-thumb': {
              width: 16,
              height: 16,
              bgcolor: 'background.paper',
              border: 2,
              borderColor: 'text.primary',
              boxShadow: 'none',
            },
            '& .MuiSlider-rail': {
              bgcolor: theme.custom.tokens.track,
              opacity: 1,
            },
          }}
        />
      </GraphiteField>

      {totalCapacity > 1 && (
        <GraphiteNotice>
          {t('projects.form.over', {
            percent: Math.round(totalCapacity * 100),
            hours: round1((totalCapacity - 1) * baseMonthlyHours),
          })}
        </GraphiteNotice>
      )}

      <GraphiteField label={t('projects.form.color')}>
        <Box
          role="radiogroup"
          aria-label={t('projects.form.color')}
          sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}
        >
          {PROJECT_COLORS.map((c, i) => (
            <ButtonBase
              key={c}
              role="radio"
              aria-checked={color === c}
              aria-label={t('projects.form.color.n', { n: i + 1 })}
              onClick={() => setColor(c)}
              sx={{
                width: 20,
                height: 20,
                borderRadius: '6px',
                bgcolor: c,
                outline: color === c ? 2 : 0,
                outlineStyle: 'solid',
                outlineColor: theme.palette.text.primary,
                outlineOffset: 2,
              }}
            />
          ))}
        </Box>
      </GraphiteField>
    </GraphiteDialog>
  );
};
