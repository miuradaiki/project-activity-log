/** 経過時間を時計表記にする（例: 1:24:07 / 1:24）。時間に先頭ゼロは付けない */
export const formatClock = (ms: number, withSeconds = true): string => {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return withSeconds ? `${h}:${m}:${s}` : `${h}:${m}`;
};
