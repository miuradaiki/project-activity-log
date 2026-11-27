import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
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

interface ToastState extends ToastOptions {
  id: number;
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => void;
}

const DEFAULT_DURATION = 4000;
const ACTION_DURATION = 8000;

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { t } = useLanguage();
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((options: ToastOptions) => {
    setToast({ ...options, id: Date.now() + Math.random() });
  }, []);

  const close = useCallback(() => setToast(null), []);

  useEffect(() => {
    if (!toast) return;
    const ms =
      toast.duration ?? (toast.action ? ACTION_DURATION : DEFAULT_DURATION);
    const timer = setTimeout(close, ms);
    return () => clearTimeout(timer);
  }, [toast, close]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast && (
        <GraphiteToast
          key={toast.id}
          message={toast.message}
          kind={toast.kind ?? 'info'}
          actionLabel={toast.action?.label}
          onAction={() => {
            close();
            toast.action?.onClick();
          }}
          onClose={close}
          closeLabel={t('actions.close')}
        />
      )}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => useContext(ToastContext);
