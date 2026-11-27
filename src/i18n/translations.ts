/**
 * 翻訳リソース
 *
 * ## ネームスペース命名規則
 *
 * ### 画面別ネームスペース
 * - `nav.*`        - ナビゲーションメニュー
 * - `dashboard.*`  - ダッシュボード画面
 * - `projects.*`   - プロジェクト管理画面
 * - `timer.*`      - タイマー画面
 * - `settings.*`   - 設定画面
 * - `calendar.*`   - カレンダーコンポーネント
 *
 * ### 機能別ネームスペース
 * - `actions.*`    - 共通アクション（ボタンラベルなど）
 * - `units.*`      - 単位（時間、分、秒など）
 * - `time.*`       - 時間表現（昨日、今週など）
 * - `format.*`     - フォーマット文字列
 *
 * ### その他
 * - `app.*`        - アプリケーション全般
 * - `language.*`   - 言語設定
 *
 * ## キー命名規則
 * - すべてのキーはドット区切りを使用: `namespace.category.name`
 * - 小文字とドットのみ使用（キャメルケース禁止）
 * - 階層は最大3レベルまで推奨
 */
export const translations = {
  ja: {
    // ===== 共通 =====
    'app.name': 'プロジェクト活動ログ',

    // ===== ナビゲーション =====
    'nav.dashboard': 'レポート',
    'nav.projects': 'プロジェクト',
    'nav.timer': '今日',
    'nav.settings': '設定',

    // ===== ダッシュボード =====

    // ===== プロジェクト =====
    'projects.new': '新しいプロジェクト',
    'projects.edit': 'プロジェクトを編集',
    'projects.name.required': 'プロジェクト名を入力してください',
    'projects.description': '説明',
    'projects.cancel': 'キャンセル',
    'projects.delete': '削除',
    'projects.archive': 'アーカイブ',
    'projects.unarchive': 'アーカイブ解除',
    'projects.delete.confirm': 'プロジェクトを削除してもよろしいですか？',
    'projects.delete.warning':
      'この操作は取り消せません。関連するすべての作業記録も削除されます。',
    'projects.filter.all': 'すべて',
    'projects.filter.active': '進行中',
    'projects.filter.warning': '注意',
    'projects.filter.completed': '超過',
    'projects.filter.tracking': '追跡のみ',
    'projects.sort.name': '名前順',
    'projects.sort.progress': '進捗順',
    'projects.sort.remaining': '残り時間順',
    'projects.search': 'プロジェクトを検索',
    'projects.tracking.cumulative': '今月の累計時間',
    'projects.tracking.label': '追跡のみ - 今月の累計時間',

    // ===== タイマー =====
    'timer.start': '開始',
    'timer.stop': '停止',
    'timer.manual': '作業時間を手動入力',
    'timer.manual.title': '作業時間の手動入力',
    'timer.manual.edit': '作業時間の編集',
    'timer.project': 'プロジェクト',
    'timer.start.date': '開始日',
    'timer.end.date': '終了日',
    'timer.start.time': '開始時間',
    'timer.end.time': '終了時間',
    'timer.description': ' ',
    'timer.history': '作業履歴',
    'timer.import.csv': 'CSVインポート',
    'timer.notification.maxtime': '作業時間が8時間を超過しました',
    'timer.notification.maxtime.body':
      'タイマーを自動停止しました。必要に応じて新しいセッションを開始してください。',
    'timer.export.success': 'CSVを書き出しました',
    'timer.export.error': 'エクスポートに失敗しました',

    // ===== 設定 =====
    'settings.title': '設定',
    'settings.monthly.hours': '月間基準時間',
    'settings.monthly.hours.description':
      '月間の基準作業時間を設定します。プロジェクトの稼働率計算に使用されます。',
    'settings.reset': 'デフォルトに戻す',
    'settings.save': '保存',
    'settings.language': '言語設定',
    'settings.language.description': 'アプリケーションの表示言語を選択します。',
    'settings.loading': '設定を読み込んでいます...',
    'settings.monthly.hours.saved': '月間基準時間を保存しました',
    'settings.save.error': '保存に失敗しました',
    'settings.reset.error': 'リセットに失敗しました',
    'settings.monthly.hours.example': '例: {base}h × 40% = {target}h',
    'settings.appearance': '外観設定',
    'settings.darkmode': 'ダークモード',
    'settings.darkmode.description': '画面の配色を切り替えます',
    'settings.monthly.hours.label': '月間時間',

    // ===== 共通アクション =====
    'actions.save': '保存',
    'actions.update': '更新',
    'actions.edit': '編集',
    'actions.search': '検索',
    'actions.add': '追加',
    'actions.export': 'エクスポート',

    // ===== 単位 =====
    'units.minutes': '分',
    'units.seconds': '秒',
    'units.days': '日',

    // ===== 時間表現 =====
    'time.yesterday': '昨日',
    'time.this.week': '今週',

    // ===== ダッシュボード（追加） =====

    // ===== カレンダー =====

    // ===== フォーマット =====

    // ===== アクセシビリティ =====
    'aria.sidebar.toggle': 'サイドバーの開閉',
    'aria.sidebar.open': 'サイドバーを開く',
    'aria.calendar.previous.month': '前の月へ',
    'aria.calendar.next.month': '次の月へ',
    'aria.week.previous': '前の週へ',
    'aria.week.next': '次の週へ',
    'aria.time.set.start': '現在時刻を開始時刻に設定',
    'aria.time.set.end': '現在時刻を終了時刻に設定',
    'aria.settings.info': '設定の詳細情報',
    'aria.language.switch': '言語を切り替え',
    'aria.timer.stop': 'タイマーを停止',
    'aria.timer.start': 'タイマーを開始',
    'aria.week.navigation': '週の移動',
    'aria.entry.edit': '作業記録を編集',
    'aria.entry.delete': '作業記録を削除',
    'aria.note.edit': 'メモを編集',
    'aria.project.menu': 'プロジェクトメニュー',
    'aria.project.add': 'プロジェクトを追加',
    'sidebar.month.progress': '今月の進捗',
    'sidebar.running': '計測中',
    'today.idle.title': '計測していません',
    'today.idle.hint': 'プロジェクトを選んで計測を始めましょう',
    'today.running.since': '計測中 · {time} から',
    'today.start.project': '{name} を開始',
    'today.stop.project': '{name} を停止',
    'today.hours.today': '今日の作業時間',
    'today.month': '今月',
    'today.pace': '必要ペース',
    'today.per.day': 'h / 日',
    'today.timeline': 'タイムライン',
    'today.pick.project': 'プロジェクトを選んで開始',
    'today.manual': '手動で記録',
    'today.over': '+{hours}h 超過',
    'today.projects': 'プロジェクト',
    'today.no.projects': 'まだプロジェクトがありません',
    'today.create.project': 'プロジェクトを作成',
    'settings.data': 'データ',
    'settings.import.title': 'CSV から取り込む',
    'settings.import.description': '取り込む前に自動でバックアップします。',
    'settings.import.button': 'ファイルを選ぶ…',
    'projects.subtitle':
      '{count}件 · 月間基準 {base}h のうち {percent}% を割り当て済み',
    'projects.col.project': 'プロジェクト',
    'projects.col.progress': '今月の進捗',
    'projects.col.hours': '実績 / 目標',
    'projects.col.remaining': '残り',
    'projects.utilization.value': '稼働率 {percent}%',
    'projects.tracking.only': '追跡のみ · 目標なし',
    'projects.no.target': '目標を設定していません',
    'projects.pace': 'あと {hours}h / 日',
    'projects.running': '計測中',
    'projects.archived.count': 'アーカイブ済み {count}件',
    'projects.empty': '条件に合うプロジェクトはありません',
    'projects.delete.ellipsis': '削除…',
    'reports.subtitle': '月間の進捗と週ごとの推移',
    'reports.month.label': '{y}年{m}月',
    'reports.worked': '作業時間',
    'reports.of.target': '目標の {percent}%',
    'reports.remaining.days': '残り営業日',
    'reports.until': '{date} まで',
    'reports.days': '日',
    'reports.pace': '必要ペース',
    'reports.pace.behind': '平均 {avg}h / 日 より多い',
    'reports.pace.ok': '平均 {avg}h / 日 で達成できます',
    'reports.this.week': '今週',
    'reports.last.week': '先週 {hours}h',
    'reports.daily.avg': '1日平均',
    'reports.weekdays': '平日 {count}日',
    'reports.weekly': '週ごとの作業時間（平日のみ）',
    'reports.by.project': 'プロジェクト別',
    'reports.tracking.suffix': '（追跡のみ）',
    'reports.no.data': 'この月の記録はありません',
    'import.success':
      '{entries}件の記録を取り込みました（新規プロジェクト {projects}件）',
    'import.error': '取り込みに失敗しました。ファイルの形式を確認してください',
    'settings.work.hours': '稼働時間',
    'settings.monthly.hours.help':
      'プロジェクトの目標時間は「基準時間 × 稼働率」で決まります。',
    'settings.per.month': 'h / 月',
    'settings.decrease': '減らす',
    'settings.increase': '増やす',
    'settings.appearance.language': '外観と言語',
    'settings.theme': 'テーマ',
    'settings.theme.hint': 'Alt + L でも切り替えられます',
    'settings.theme.light': 'ライト',
    'settings.theme.dark': 'ダーク',
    'settings.instant': '変更はすぐに保存されます',
    'actions.close': '閉じる',
    'timer.export.csv': 'CSV書き出し',
    'timer.discarded': '1分未満のため記録しませんでした',
    'undo.action': '元に戻す',
    'undo.entry.deleted': '作業記録を削除しました',
    'undo.project.archived': '「{name}」をアーカイブしました',
    'undo.project.deleted': '「{name}」と記録{count}件を削除しました',
    'projects.delete.title': '「{name}」を削除しますか？',
    'projects.delete.entries': '作業記録 {count}件（{hours}h）も削除されます。',
    'projects.delete.hint': '記録を残したい場合はアーカイブしてください。',
    'projects.delete.archive.instead': 'アーカイブにする',
    'timer.now': '今',
    'form.optional': '任意',
    'timer.manual.error.order': '終了は開始より後にしてください',
    'timer.manual.error.short': '1分以上の記録にしてください',
    'timer.manual.save.anyway': 'それでも保存',
    'timer.manual.fix.errors': 'エラーを直すと保存できます',
    'timer.manual.will.record': '記録されます',
    'timer.manual.split.notice':
      '日をまたぐ {hours}時間の記録です。日ごとに分けて保存されます。',
    'timer.manual.project.placeholder': 'プロジェクトを選択',
    'timer.manual.description.placeholder': '何をしたか',
    'timer.manual.end.date.fixed': '編集では日付をまたげません',
    'projects.form.name': '名前',
    'projects.form.description.placeholder': 'クライアント・目的など',
    'projects.form.allocation': '今月の配分',
    'projects.form.hours.unit': 'h / 月',
    'projects.form.allocation.of': '基準 {base}h の {percent}%',
    'projects.form.over':
      '全プロジェクトの配分が合計 {percent}% になります（基準を {hours}h 超えます）',
    'projects.form.color': '色',
    'projects.form.color.n': '色 {n}',
    'history.today': '今日',
    'history.yesterday': '昨日',
    'history.search.placeholder': 'プロジェクト・メモを検索',
    'history.search.aria': '作業履歴を検索',
    'history.filter.project': 'プロジェクトで絞り込む',
    'history.filter.all': 'すべてのプロジェクト',
    'history.empty': 'まだ作業記録がありません',
    'history.no.match': '該当する作業記録はありません',
    'history.more': 'さらに表示（残り {count} 件）',
    'history.unknown.project': '不明なプロジェクト',
    'settings.testmode.title': 'テストモード',
    'settings.testmode.badge': '開発用',
    'settings.testmode.use': 'テストデータを使う',
    'settings.testmode.description':
      '本番データは触らず、生成したデータで画面を確認します。',
    'settings.testmode.data': 'テストデータ',
    'settings.testmode.projects': 'プロジェクト',
    'settings.testmode.entries': '記録',
    'settings.testmode.regenerate': 'データを作り直す',
    'app.loading': '読み込み中',
  },
  en: {
    // ===== Common =====
    'app.name': 'Project Activity Log',

    // ===== Navigation =====
    'nav.dashboard': 'Reports',
    'nav.projects': 'Projects',
    'nav.timer': 'Today',
    'nav.settings': 'Settings',

    // ===== Dashboard =====

    // ===== Projects =====
    'projects.new': 'New Project',
    'projects.edit': 'Edit Project',
    'projects.name.required': 'Project name is required',
    'projects.description': 'Description',
    'projects.cancel': 'Cancel',
    'projects.delete': 'Delete',
    'projects.archive': 'Archive',
    'projects.unarchive': 'Unarchive',
    'projects.delete.confirm': 'Are you sure you want to delete this project?',
    'projects.delete.warning':
      'This action cannot be undone. All related work records will also be deleted.',
    'projects.filter.all': 'All',
    'projects.filter.active': 'Active',
    'projects.filter.warning': 'Warning',
    'projects.filter.completed': 'Over',
    'projects.filter.tracking': 'Tracking Only',
    'projects.sort.name': 'By Name',
    'projects.sort.progress': 'By Progress',
    'projects.sort.remaining': 'By Remaining Time',
    'projects.search': 'Search projects',
    'projects.tracking.cumulative': 'Cumulative Hours This Month',
    'projects.tracking.label': 'Tracking Only - Cumulative Hours This Month',

    // ===== Timer =====
    'timer.start': 'Start',
    'timer.stop': 'Stop',
    'timer.manual': 'Manual Time Entry',
    'timer.manual.title': 'Manual Time Entry',
    'timer.manual.edit': 'Edit Time Entry',
    'timer.project': 'Project',
    'timer.start.date': 'Start Date',
    'timer.end.date': 'End Date',
    'timer.start.time': 'Start Time',
    'timer.end.time': 'End Time',
    'timer.description': ' ',
    'timer.history': 'Work History',
    'timer.import.csv': 'Import CSV',
    'timer.notification.maxtime': 'Working time exceeded 8 hours',
    'timer.notification.maxtime.body':
      'Timer has been automatically stopped. Start a new session if needed.',
    'timer.export.success': 'Exported CSV',
    'timer.export.error': 'Failed to export time entries',

    // ===== Settings =====
    'settings.title': 'Settings',
    'settings.monthly.hours': 'Monthly Base Hours',
    'settings.monthly.hours.description':
      'Set the standard working hours per month. This is used to calculate project utilization rates.',
    'settings.reset': 'Reset to Default',
    'settings.save': 'Save',
    'settings.language': 'Language Settings',
    'settings.language.description':
      'Select the display language for the application.',
    'settings.loading': 'Loading settings...',
    'settings.monthly.hours.saved': 'Monthly base hours saved',
    'settings.save.error': 'Failed to save',
    'settings.reset.error': 'Failed to reset settings',
    'settings.monthly.hours.example': 'e.g. {base}h × 40% = {target}h',
    'settings.appearance': 'Appearance',
    'settings.darkmode': 'Dark Mode',
    'settings.darkmode.description': 'Switch the color scheme of the screen',
    'settings.monthly.hours.label': 'Monthly Hours',

    // ===== Common Actions =====
    'actions.save': 'Save',
    'actions.update': 'Update',
    'actions.edit': 'Edit',
    'actions.search': 'Search',
    'actions.add': 'Add',
    'actions.export': 'Export',

    // ===== Units =====
    'units.minutes': 'minutes',
    'units.seconds': 'seconds',
    'units.days': 'days',

    // ===== Time Expressions =====
    'time.yesterday': 'Yesterday',
    'time.this.week': 'This Week',

    // ===== Dashboard (Extended) =====

    // ===== Calendar =====

    // ===== Format =====

    // ===== Accessibility =====
    'aria.sidebar.toggle': 'Toggle sidebar',
    'aria.sidebar.open': 'Open sidebar',
    'aria.calendar.previous.month': 'Previous month',
    'aria.calendar.next.month': 'Next month',
    'aria.week.previous': 'Previous week',
    'aria.week.next': 'Next week',
    'aria.time.set.start': 'Set current time as start time',
    'aria.time.set.end': 'Set current time as end time',
    'aria.settings.info': 'Settings information',
    'aria.language.switch': 'Switch language',
    'aria.timer.stop': 'Stop timer',
    'aria.timer.start': 'Start timer',
    'aria.week.navigation': 'Week navigation',
    'aria.entry.edit': 'Edit time entry',
    'aria.entry.delete': 'Delete time entry',
    'aria.note.edit': 'Edit note',
    'aria.project.menu': 'Project menu',
    'aria.project.add': 'Add project',
    'sidebar.month.progress': 'This month',
    'sidebar.running': 'Tracking',
    'today.idle.title': 'Not tracking',
    'today.idle.hint': 'Pick a project to start tracking',
    'today.running.since': 'Tracking since {time}',
    'today.start.project': 'Start {name}',
    'today.stop.project': 'Stop {name}',
    'today.hours.today': 'Today',
    'today.month': 'This month',
    'today.pace': 'Required pace',
    'today.per.day': 'h / day',
    'today.timeline': 'Timeline',
    'today.pick.project': 'Start a project',
    'today.manual': 'Add entry',
    'today.over': '+{hours}h over',
    'today.projects': 'Projects',
    'today.no.projects': 'No projects yet',
    'today.create.project': 'Create project',
    'settings.data': 'Data',
    'settings.import.title': 'Import from CSV',
    'settings.import.description':
      'A backup is created automatically before importing.',
    'settings.import.button': 'Choose file…',
    'projects.subtitle': '{count} projects · {percent}% of {base}h allocated',
    'projects.col.project': 'Project',
    'projects.col.progress': 'This month',
    'projects.col.hours': 'Actual / Target',
    'projects.col.remaining': 'Left',
    'projects.utilization.value': '{percent}% allocation',
    'projects.tracking.only': 'Tracking only · no target',
    'projects.no.target': 'No target set',
    'projects.pace': '{hours}h / day to go',
    'projects.running': 'Tracking',
    'projects.archived.count': 'Archived ({count})',
    'projects.empty': 'No matching projects',
    'projects.delete.ellipsis': 'Delete…',
    'reports.subtitle': 'Monthly progress and weekly trend',
    'reports.month.label': '{m}/{y}',
    'reports.worked': 'Hours worked',
    'reports.of.target': '{percent}% of target',
    'reports.remaining.days': 'Working days left',
    'reports.until': 'until {date}',
    'reports.days': 'days',
    'reports.pace': 'Required pace',
    'reports.pace.behind': 'Above your {avg}h / day average',
    'reports.pace.ok': 'On track at {avg}h / day',
    'reports.this.week': 'This week',
    'reports.last.week': 'Last week {hours}h',
    'reports.daily.avg': 'Daily average',
    'reports.weekdays': '{count} weekdays',
    'reports.weekly': 'Hours per week (weekdays)',
    'reports.by.project': 'By project',
    'reports.tracking.suffix': '(tracking)',
    'reports.no.data': 'No entries this month',
    'import.success': 'Imported {entries} entries ({projects} new projects)',
    'import.error': 'Import failed. Check the file format.',
    'settings.work.hours': 'Work hours',
    'settings.monthly.hours.help':
      'Project targets are base hours × allocation.',
    'settings.per.month': 'h / month',
    'settings.decrease': 'Decrease',
    'settings.increase': 'Increase',
    'settings.appearance.language': 'Appearance & language',
    'settings.theme': 'Theme',
    'settings.theme.hint': 'Toggle with Alt + L',
    'settings.theme.light': 'Light',
    'settings.theme.dark': 'Dark',
    'settings.instant': 'Changes are saved automatically',
    'actions.close': 'Close',
    'timer.export.csv': 'Export CSV',
    'timer.discarded': 'Not recorded (under 1 minute)',
    'undo.action': 'Undo',
    'undo.entry.deleted': 'Entry deleted',
    'undo.project.archived': 'Archived "{name}"',
    'undo.project.deleted': 'Deleted "{name}" and {count} entries',
    'projects.delete.title': 'Delete "{name}"?',
    'projects.delete.entries':
      '{count} entries ({hours}h) will also be deleted. ',
    'projects.delete.hint': 'Archive it instead to keep the records.',
    'projects.delete.archive.instead': 'Archive instead',
    'timer.now': 'Now',
    'form.optional': 'optional',
    'timer.manual.error.order': 'End must be after start',
    'timer.manual.error.short': 'Entries must be at least 1 minute',
    'timer.manual.save.anyway': 'Save anyway',
    'timer.manual.fix.errors': 'Fix the errors to save',
    'timer.manual.will.record': 'will be recorded',
    'timer.manual.split.notice':
      'Spans multiple days — {hours}h record. It will be saved split by day.',
    'timer.manual.project.placeholder': 'Select a project',
    'timer.manual.description.placeholder': 'What did you work on?',
    'timer.manual.end.date.fixed': 'Editing cannot span days',
    'projects.form.name': 'Name',
    'projects.form.description.placeholder': 'Client, goal, etc.',
    'projects.form.allocation': 'Monthly allocation',
    'projects.form.hours.unit': 'h / month',
    'projects.form.allocation.of': '{percent}% of {base}h base',
    'projects.form.over':
      'Total allocation will be {percent}% ({hours}h over the base)',
    'projects.form.color': 'Color',
    'projects.form.color.n': 'Color {n}',
    'history.today': 'Today',
    'history.yesterday': 'Yesterday',
    'history.search.placeholder': 'Search projects or notes',
    'history.search.aria': 'Search work history',
    'history.filter.project': 'Filter by project',
    'history.filter.all': 'All projects',
    'history.empty': 'No work records yet',
    'history.no.match': 'No matching records',
    'history.more': 'Show more ({count} left)',
    'history.unknown.project': 'Unknown project',
    'settings.testmode.title': 'Test mode',
    'settings.testmode.badge': 'Dev',
    'settings.testmode.use': 'Use test data',
    'settings.testmode.description':
      'Preview the app with generated data without touching real data.',
    'settings.testmode.data': 'Test data',
    'settings.testmode.projects': 'projects',
    'settings.testmode.entries': 'entries',
    'settings.testmode.regenerate': 'Regenerate data',
    'app.loading': 'Loading',
  },
};
