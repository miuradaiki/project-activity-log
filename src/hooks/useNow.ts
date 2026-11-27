import { useEffect, useState } from 'react';

/** 表示用の現在時刻（ミリ秒）。intervalMs ごとに再描画させる */
export const useNow = (intervalMs: number, enabled = true): number => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!enabled) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs, enabled]);
  return now;
};
