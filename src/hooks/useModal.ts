import { useState, useCallback } from 'react';

export interface Modal<T = undefined> {
  isOpen: boolean;
  data: T | undefined;
  open: (data?: T) => void;
  close: () => void;
}

export const useModal = <T = undefined>(): Modal<T> => {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<T | undefined>(undefined);

  const open = useCallback((modalData?: T) => {
    setData(modalData);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setData(undefined);
  }, []);

  return {
    isOpen,
    data,
    open,
    close,
  };
};
