/**
 * 画面移動のショートカット。App の割り当てと一覧の表示を同じ定義から作り、食い違いを防ぐ。
 * 並びはサイドバー（今日 / プロジェクト / レポート）にそろえる。
 */
export const NAV_SHORTCUTS = [
  { key: '1', page: 'timer' },
  { key: '2', page: 'projects' },
  { key: '3', page: 'dashboard' },
  { key: ',', page: 'settings' },
] as const;

/** 一覧に出すショートカット。App で実際に割り当てているものだけを載せる */
export const SHORTCUT_HELP: { keys: string; labelKey: string }[] = [
  ...NAV_SHORTCUTS.map(({ key, page }) => ({
    keys: `Ctrl+${key}`,
    labelKey: `nav.${page}`,
  })),
  { keys: 'Space', labelKey: 'shortcuts.timer.toggle' },
  { keys: 'Ctrl+N', labelKey: 'shortcuts.project.new' },
  { keys: 'Ctrl+/', labelKey: 'shortcuts.help' },
  { keys: 'Alt+L', labelKey: 'shortcuts.theme' },
];
