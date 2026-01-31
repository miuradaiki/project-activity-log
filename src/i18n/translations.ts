// 翻訳リソース
export const translations = {
  ja: {
    // 共通
    'app.name': 'プロジェクト活動ログ',
    language: '言語',
    'language.japanese': '日本語',
    'language.english': '英語',

    // ナビゲーション
    'nav.dashboard': 'ダッシュボード',
    'nav.projects': 'プロジェクト',
    'nav.timer': 'タイマー',
    'nav.settings': '設定',

    // ダッシュボード
    'dashboard.daily.title': '本日の活動',
    'dashboard.daily.total': '合計時間',
    'dashboard.daily.longest': '最も長い作業時間',
    'dashboard.daily.average': '平均作業時間',
    'dashboard.weekly.title': '週間サマリー',
    'dashboard.weekly.byproject': 'プロジェクト別時間',
    'dashboard.monthly.title': '月間サマリー',
    'dashboard.monthly.total': '合計時間',
    'dashboard.progress.title': 'プロジェクト進捗',
    'dashboard.progress.subtitle': '月間目標に対する進捗状況',

    // プロジェクト
    'projects.new': '新しいプロジェクト',
    'projects.edit': 'プロジェクトを編集',
    'projects.name': 'プロジェクト名',
    'projects.name.required': 'プロジェクト名を入力してください',
    'projects.description': '説明',
    'projects.utilization': '稼働率',
    'projects.monthly.target': '月間目標時間',
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

    // タイマー
    'timer.title': ' ',
    'timer.start': '開始',
    'timer.stop': '停止',
    'timer.manual': '作業時間を手動入力',
    'timer.manual.title': '作業時間の手動入力',
    'timer.manual.edit': '作業時間の編集',
    'timer.now.start': '現在時刻を開始時刻にセット',
    'timer.now.end': '現在時刻を終了時刻にセット',
    'timer.project': 'プロジェクト',
    'timer.start.date': '開始日',
    'timer.end.date': '終了日',
    'timer.start.time': '開始時間',
    'timer.end.time': '終了時間',
    'timer.description': ' ',
    'timer.history': '作業履歴',
    'timer.history.timeline': 'タイムライン',
    'timer.import.csv': 'CSVインポート',
    'timer.search': '検索...',
    'timer.no.entries': 'タイマーを開始してください',
    'timer.delete.confirm': '作業記録の削除',
    'timer.delete.message':
      'の作業記録を削除してもよろしいですか？\nこの操作は取り消せません。',
    'timer.notification.maxtime': '作業時間が8時間を超過しました',
    'timer.notification.maxtime.body':
      'タイマーを自動停止しました。必要に応じて新しいセッションを開始してください。',

    // 設定
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
    'settings.reset.success': '設定をデフォルトに戻しました',
    'settings.reset.error': 'リセットに失敗しました',
    'settings.language.changed': '言語設定を変更しました',
    'settings.monthly.hours.example':
      'に基づく月間目標時間（基準: {hours}時間/月）',
    'settings.appearance': '外観設定',
    'settings.darkmode': 'ダークモード',
    'settings.darkmode.description': '画面の配色を切り替えます',
    'settings.monthly.hours.label': '月間時間',

    // 共通アクション
    'actions.save': '保存',
    'actions.update': '更新',
    'actions.edit': '編集',
    'actions.search': '検索',
    'actions.add': '追加',
    'actions.export': 'エクスポート',

    // 単位と時間
    'units.hours': '時間',
    'units.minutes': '分',
    'units.seconds': '秒',
    'time.yesterday': '昨日',
    'time.this.week': '今週',
    'time.this.month': '今月',
    'timer.export.success': '作業記録のエクスポートが完了しました',
    'timer.export.error': 'エクスポートに失敗しました',

    // Monthly Progress Summary
    'dashboard.monthly.summary.title': '月間進捗サマリー',
    'dashboard.monthly.summary.worked': '作業時間',
    'dashboard.monthly.summary.target': '目標時間',
    'dashboard.monthly.summary.remaining.days': '残り営業日',
    'dashboard.monthly.summary.required.pace': '必要ペース',
    'dashboard.monthly.summary.vs.last.month': '先月比',
    'dashboard.monthly.summary.per.day': '/日',

    // Activity Heatmap
    'dashboard.heatmap.title': '活動ヒートマップ',
    'dashboard.heatmap.less': '少ない',
    'dashboard.heatmap.more': '多い',
    'dashboard.heatmap.hours': '{hours}時間',

    // Calendar
    'calendar.title': '活動カレンダー',
    'calendar.subtitle': '作業時間の分布を視覚化',
    'calendar.total': '合計: {hours}時間',
    'calendar.activity.level': '活動レベル:',

    // Dashboard Monthly Extended
    'dashboard.monthly.year': '年',
    'dashboard.monthly.month': '月',
    'dashboard.monthly.tab.projects': 'プロジェクト分布',
    'dashboard.monthly.tab.weekly': '週別推移',
    'dashboard.monthly.week': '週',
    'dashboard.monthly.week.nth': '第{n}週',
    'dashboard.monthly.no.activity': 'この月の稼働データがありません',
    'dashboard.monthly.no.projects': 'この月のプロジェクトデータがありません',

    // Previous Month
    'dashboard.previous.title': '先月の稼働状況',
    'dashboard.previous.total': '合計時間:',
    'dashboard.previous.no.data': '先月の稼働データがありません',

    // Units Extended
    'units.days': '日',

    // Format
    'format.duration.hours.minutes': '{hours}時間{minutes}分',
    'format.duration.hours': '{hours}時間',
    'format.duration.minutes': '{minutes}分',
    'timer.multiday.notice':
      '{duration} ({startDate} - {endDate}) の記録になります。',
  },
  en: {
    // Common
    'app.name': 'Project Activity Log',
    language: 'Language',
    'language.japanese': 'Japanese',
    'language.english': 'English',

    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.projects': 'Projects',
    'nav.timer': 'Timer',
    'nav.settings': 'Settings',

    // Dashboard
    'dashboard.daily.title': "Today's Activity",
    'dashboard.daily.total': 'Total Time',
    'dashboard.daily.longest': 'Longest Work Session',
    'dashboard.daily.average': 'Average Work Session',
    'dashboard.weekly.title': 'Weekly Summary',
    'dashboard.weekly.byproject': 'Hours by Project',
    'dashboard.monthly.title': 'Monthly Summary',
    'dashboard.monthly.total': 'Total Hours',
    'dashboard.progress.title': 'Project Progress',
    'dashboard.progress.subtitle': 'Progress against monthly targets',

    // Projects
    'projects.new': 'New Project',
    'projects.edit': 'Edit Project',
    'projects.name': 'Project Name',
    'projects.name.required': 'Project name is required',
    'projects.description': 'Description',
    'projects.utilization': 'Utilization Rate',
    'projects.monthly.target': 'Monthly Target Hours',
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
    'projects.filter.completed': 'Excess',
    'projects.filter.tracking': 'Tracking Only',
    'projects.sort.name': 'By Name',
    'projects.sort.progress': 'By Progress',
    'projects.sort.remaining': 'By Remaining Time',
    'projects.search': 'Search projects',
    'projects.tracking.cumulative': 'Cumulative Hours This Month',
    'projects.tracking.label': 'Tracking Only - Cumulative Hours This Month',

    // Timer
    'timer.title': ' ',
    'timer.start': 'Start',
    'timer.stop': 'Stop',
    'timer.manual': 'Manual Time Entry',
    'timer.manual.title': 'Manual Time Entry',
    'timer.manual.edit': 'Edit Time Entry',
    'timer.now.start': 'Set current time as start time',
    'timer.now.end': 'Set current time as end time',
    'timer.project': 'Project',
    'timer.start.date': 'Start Date',
    'timer.end.date': 'End Date',
    'timer.start.time': 'Start Time',
    'timer.end.time': 'End Time',
    'timer.description': ' ',
    'timer.history': 'Work History',
    'timer.history.timeline': 'Timeline',
    'timer.import.csv': 'Import CSV',
    'timer.search': 'Search...',
    'timer.no.entries': 'No work records found',
    'timer.delete.confirm': 'Delete Work Record',
    'timer.delete.message':
      'Are you sure you want to delete this work record for? This action cannot be undone.',
    'timer.notification.maxtime': 'Working time exceeded 8 hours',
    'timer.notification.maxtime.body':
      'Timer has been automatically stopped. Start a new session if needed.',

    // Settings
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
    'settings.reset.success': 'Settings reset to default',
    'settings.reset.error': 'Failed to reset settings',
    'settings.language.changed': 'Language changed',
    'settings.monthly.hours.example':
      ' based monthly target (baseline: {hours} hours/month)',
    'settings.appearance': 'Appearance',
    'settings.darkmode': 'Dark Mode',
    'settings.darkmode.description': 'Switch the color scheme of the screen',
    'settings.monthly.hours.label': 'Monthly Hours',

    // Common Actions
    'actions.save': 'Save',
    'actions.update': 'Update',
    'actions.edit': 'Edit',
    'actions.search': 'Search',
    'actions.add': 'Add',
    'actions.export': 'Export',

    // Units and Time
    'units.hours': 'hours',
    'units.minutes': 'minutes',
    'units.seconds': 'seconds',
    'time.yesterday': 'Yesterday',
    'time.this.week': 'This Week',
    'time.this.month': 'This Month',
    'timer.export.success': 'Time entries exported successfully',
    'timer.export.error': 'Failed to export time entries',

    // Monthly Progress Summary
    'dashboard.monthly.summary.title': 'Monthly Progress Summary',
    'dashboard.monthly.summary.worked': 'Hours Worked',
    'dashboard.monthly.summary.target': 'Target Hours',
    'dashboard.monthly.summary.remaining.days': 'Working Days Left',
    'dashboard.monthly.summary.required.pace': 'Required Pace',
    'dashboard.monthly.summary.vs.last.month': 'vs Last Month',
    'dashboard.monthly.summary.per.day': '/day',

    // Activity Heatmap
    'dashboard.heatmap.title': 'Activity Heatmap',
    'dashboard.heatmap.less': 'Less',
    'dashboard.heatmap.more': 'More',
    'dashboard.heatmap.hours': '{hours} hours',

    // Calendar
    'calendar.title': 'Activity Calendar',
    'calendar.subtitle': 'Visualize work time distribution',
    'calendar.total': 'Total: {hours} hours',
    'calendar.activity.level': 'Activity Level:',

    // Dashboard Monthly Extended
    'dashboard.monthly.year': 'Year',
    'dashboard.monthly.month': 'Month',
    'dashboard.monthly.tab.projects': 'Project Distribution',
    'dashboard.monthly.tab.weekly': 'Weekly Trend',
    'dashboard.monthly.week': 'Week',
    'dashboard.monthly.week.nth': 'Week {n}',
    'dashboard.monthly.no.activity': 'No activity data for this month',
    'dashboard.monthly.no.projects': 'No project data for this month',

    // Previous Month
    'dashboard.previous.title': 'Previous Month Activity',
    'dashboard.previous.total': 'Total Hours:',
    'dashboard.previous.no.data': 'No activity data for the previous month',

    // Units Extended
    'units.days': 'days',

    // Format
    'format.duration.hours.minutes': '{hours}h {minutes}m',
    'format.duration.hours': '{hours}h',
    'format.duration.minutes': '{minutes}m',
    'timer.multiday.notice':
      'This will be a {duration} entry ({startDate} - {endDate}).',
  },
};
