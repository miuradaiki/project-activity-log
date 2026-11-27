import React, { useEffect, useState } from 'react';
import { Box, Button, ButtonBase, useTheme } from '@mui/material';
import { useLanguage } from '../../contexts/LanguageContext';
import { APP_CONSTANTS } from '../../constants';
import { numberTypography } from '../../styles/modernTheme';
import { SettingsGroup, SettingsRow } from './SettingsGroup';

const STEP = 5;
const { MIN_MONTHLY_HOURS: MIN, MAX_MONTHLY_HOURS: MAX } =
  APP_CONSTANTS.PROJECT;

interface WorkHoursSettingsProps {
  baseMonthlyHours: number;
  onCommit: (hours: number) => void;
  onReset: () => void;
}

export const WorkHoursSettings: React.FC<WorkHoursSettingsProps> = ({
  baseMonthlyHours,
  onCommit,
  onReset,
}) => {
  const theme = useTheme();
  const { t } = useLanguage();
  const commit = (hours: number) =>
    onCommit(Math.min(MAX, Math.max(MIN, hours)));
  // 入力中は下書きとして保持し、確定時にだけ保存する（途中の値で保存・巻き戻りしないように）
  const [draft, setDraft] = useState(String(baseMonthlyHours));
  useEffect(() => setDraft(String(baseMonthlyHours)), [baseMonthlyHours]);
  const commitDraft = () => {
    const v = Number(draft);
    if (draft.trim() === '' || !Number.isFinite(v)) {
      setDraft(String(baseMonthlyHours));
      return;
    }
    const clamped = Math.min(MAX, Math.max(MIN, Math.round(v)));
    setDraft(String(clamped));
    if (clamped !== baseMonthlyHours) onCommit(clamped);
  };
  const exampleTarget = Math.round(baseMonthlyHours * 0.4 * 10) / 10;

  const stepButton = (label: string, delta: number, disabled: boolean) => (
    <ButtonBase
      aria-label={label}
      disabled={disabled}
      onClick={() => commit(baseMonthlyHours + delta)}
      sx={{
        width: 32,
        height: '100%',
        color: 'text.secondary',
        fontSize: 16,
        '&.Mui-disabled': { opacity: 0.35 },
      }}
    >
      {delta > 0 ? '+' : '−'}
    </ButtonBase>
  );

  return (
    <SettingsGroup title={t('settings.work.hours')}>
      <SettingsRow
        title={t('settings.monthly.hours')}
        description={
          <>
            {t('settings.monthly.hours.help')}
            <br />
            {t('settings.monthly.hours.example', {
              base: baseMonthlyHours,
              target: exampleTarget,
            })}
          </>
        }
      >
        <Button variant="text" size="small" onClick={onReset}>
          {t('settings.reset')}
        </Button>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            height: 34,
            border: `1px solid ${theme.custom.tokens.border2}`,
            borderRadius: 2.25,
            overflow: 'hidden',
          }}
        >
          {stepButton(t('settings.decrease'), -STEP, baseMonthlyHours <= MIN)}
          <Box
            component="input"
            type="number"
            aria-label={t('settings.monthly.hours')}
            min={MIN}
            max={MAX}
            value={draft}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setDraft(e.target.value)
            }
            onBlur={commitDraft}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter') commitDraft();
            }}
            sx={{
              ...numberTypography(theme),
              fontWeight: 300,
              width: 64,
              height: '100%',
              textAlign: 'center',
              fontSize: 20,
              color: 'text.primary',
              bgcolor: 'transparent',
              border: 0,
              borderLeft: 1,
              borderRight: 1,
              borderColor: 'divider',
              outline: 'none',
              MozAppearance: 'textfield',
              '&::-webkit-inner-spin-button, &::-webkit-outer-spin-button': {
                WebkitAppearance: 'none',
                m: 0,
              },
            }}
          />
          {stepButton(t('settings.increase'), STEP, baseMonthlyHours >= MAX)}
        </Box>
        <Box sx={{ fontSize: 12.5, color: 'text.secondary' }}>
          {t('settings.per.month')}
        </Box>
      </SettingsRow>
    </SettingsGroup>
  );
};
