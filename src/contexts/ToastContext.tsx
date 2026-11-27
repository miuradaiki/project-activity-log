import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Box } from '@mui/material';
import {
  GraphiteToast,
  ToastKind,
} from '../components/ui/graphite/GraphiteToast';
import { useLanguage } from './LanguageContext';

export interface ToastOptions {
  message: string;
  kind?: ToastKind;
  action?: { label: string; onClick: () => void };
  /** ミリ秒。取り消し付きの通知は読んで押す時間が要るので長めにする */
  duration?: number;
}

interface ToastItem extends ToastOptions {
  id: number;
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => void;
}

const DEFAULT_DURATION = 4000;
const ACTION_DURATION = 8000;
/**
 * 置き換えではなく重ねて出す。続けて削除したとき、前の「元に戻す」が
 * 消えて取り消せなくなるのを防ぐため
 */
const MAX_TOASTS = 3;

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

let nextId = 0;

const TimedToast: React.FC<{
  toast: ToastItem;
  onDismiss: (id: number) => void;
  closeLabel: string;
}> = ({ toast, onDismiss, closeLabel }) => {
  useEffect(() => {
    const ms =
      toast.duration ?? (toast.action ? ACTION_DURATION : DEFAULT_DURATION);
    const timer = setTimeout(() => onDismiss(toast.id), ms);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  return (
    <GraphiteToast
      message={toast.message}
      kind={toast.kind ?? 'info'}
      actionLabel={toast.action?.label}
      onAction={() => {
        onDismiss(toast.id);
        toast.action?.onClick();
      }}
      onClose={() => onDismiss(toast.id)}
      closeLabel={closeLabel}
    />
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { t } = useLanguage();
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((options: ToastOptions) => {
    setToasts((prev) =>
      [...prev, { ...options, id: nextId++ }].slice(-MAX_TOASTS)
    );
  }, []);

  const dismiss = useCallback(
    (id: number) => setToasts((prev) => prev.filter((x) => x.id !== id)),
    []
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toasts.length > 0 && (
        <Box
          sx={(theme) => ({
            position: 'fixed',
            left: '50%',
            bottom: theme.spacing(3),
            transform: 'translateX(-50%)',
            zIndex: theme.zIndex.snackbar,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
            pointerEvents: 'none',
          })}
        >
          {toasts.map((toast) => (
            <TimedToast
              key={toast.id}
              toast={toast}
              onDismiss={dismiss}
              closeLabel={t('actions.close')}
            />
          ))}
        </Box>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => useContext(ToastContext);
