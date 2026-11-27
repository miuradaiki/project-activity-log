import { createContext, useContext } from 'react';
import { useStorage } from '../hooks/useStorage';

export type StorageValue = ReturnType<typeof useStorage>;

/**
 * App の useStorage を画面間で共有する。
 * 画面ごとに useStorage を呼ぶと状態が別々になり、変更が反映されず、古い状態で保存し直されるため。
 */
const StorageContext = createContext<StorageValue | null>(null);

export const StorageProvider = StorageContext.Provider;

export const useStorageContext = (): StorageValue => {
  const value = useContext(StorageContext);
  if (!value) {
    throw new Error(
      'useStorageContext は StorageProvider の中で使ってください'
    );
  }
  return value;
};
