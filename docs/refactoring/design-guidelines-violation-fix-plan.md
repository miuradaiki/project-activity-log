# デザインガイドライン違反 修正計画

本ドキュメントは `docs/design-guidelines.md` に対する現状コードの違反箇所を整理し、修正計画を定義する。

## 1. 違反サマリー

| カテゴリ              | 違反件数 | 影響ファイル数 |
| --------------------- | -------- | -------------- |
| ハードコードされた色  | 40+      | 11             |
| グラデーション直書き  | 15+      | 5              |
| 白色（#FFFFFF）直書き | 10+      | 4              |

## 2. 違反詳細

### 2.1 ハードコードされた色

#### 高優先度（セマンティックカラーで置換可能）

| ファイル            | 行  | 現状              | 推奨修正                                            |
| ------------------- | --- | ----------------- | --------------------------------------------------- |
| `DailySummary.tsx`  | 112 | `color="#8B5CF6"` | `theme.palette.info.main` または カスタムカラー追加 |
| `DailySummary.tsx`  | 126 | `color="#F59E0B"` | `theme.palette.warning.main`                        |
| `WeeklySummary.tsx` | 246 | `fill="#8884d8"`  | `theme.palette.primary.main`                        |
| `WeeklySummary.tsx` | 259 | `'#CCCCCC'`       | `theme.palette.grey[400]`                           |

#### 中優先度（チャート・ヒートマップ用カラー）

| ファイル              | 行    | 現状                                 | 推奨修正                            |
| --------------------- | ----- | ------------------------------------ | ----------------------------------- |
| `ActivityHeatmap.tsx` | 25-40 | ヒートマップカラー配列をハードコード | `theme.custom.heatmapColors` を新設 |

### 2.2 グラデーション直書き

ガイドラインでは `theme.custom.gradients.primary` の使用を推奨しているが、フォールバック値として同じグラデーションを直書きしている箇所が多数存在。

| ファイル      | 行              | 現状                                                  |
| ------------- | --------------- | ----------------------------------------------------- |
| `Sidebar.tsx` | 69, 77, 84, 122 | `'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'` |
| `Timer.tsx`   | 89, 91          | `'linear-gradient(135deg, #00ACC1 0%, #26C6DA 100%)'` |
| `KPICard.tsx` | 159-160         | ライト/ダーク用グラデーション                         |

**問題点**: `theme.custom?.gradients?.primary \|\| 'linear-gradient(...)'` というパターンで、テーマが正しく設定されていればフォールバックは不要。

### 2.3 白色（#FFFFFF）直書き

| ファイル      | 行            | 現状               | 推奨修正                                                                 |
| ------------- | ------------- | ------------------ | ------------------------------------------------------------------------ |
| `Sidebar.tsx` | 78, 88        | `color: '#FFFFFF'` | `theme.palette.common.white` または `theme.palette.primary.contrastText` |
| `Timer.tsx`   | 168, 210, 257 | `color: '#FFFFFF'` | `theme.palette.common.white`                                             |

### 2.4 rgba直書き

| ファイル    | 行            | 現状                         | 推奨修正                                 |
| ----------- | ------------- | ---------------------------- | ---------------------------------------- |
| `Timer.tsx` | 153, 254, 261 | `'rgba(255, 255, 255, 0.8)'` | `alpha(theme.palette.common.white, 0.8)` |
| 複数        | -             | `'rgba(0, 0, 0, 0.3)'`       | `alpha(theme.palette.common.black, 0.3)` |

## 3. 修正計画

### Phase 1: テーマ拡張（影響: modernTheme.ts）

`theme.custom` に以下を追加:

```typescript
// modernTheme.ts に追加
custom: {
  // 既存の gradients, shadows, borderRadius...

  // 新規追加
  chartColors: [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.info.main,
    theme.palette.error.main,
  ],
  heatmapColors: {
    light: {
      0: theme.palette.grey[100],
      1: alpha(theme.palette.primary.light, 0.3),
      2: alpha(theme.palette.primary.main, 0.5),
      3: theme.palette.primary.main,
      4: theme.palette.primary.dark,
    },
    dark: {
      0: theme.palette.grey[800],
      1: alpha(theme.palette.primary.dark, 0.5),
      2: alpha(theme.palette.primary.main, 0.7),
      3: theme.palette.primary.main,
      4: theme.palette.primary.light,
    },
  },
}
```

### Phase 2: コンポーネント修正

#### 2.1 Sidebar.tsx

```typescript
// Before
color: '#FFFFFF',

// After
color: theme.palette.common.white,
// または
color: theme.palette.primary.contrastText,
```

フォールバック削除:

```typescript
// Before
background: theme.custom?.gradients?.primary || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',

// After（テーマが確実に存在する場合）
background: theme.custom.gradients.primary,
```

#### 2.2 Timer.tsx

```typescript
// Before
color: '#FFFFFF',

// After
color: theme.palette.common.white,
```

```typescript
// Before
sx={{ color: 'rgba(255, 255, 255, 0.8)' }}

// After
sx={{ color: alpha(theme.palette.common.white, 0.8) }}
```

#### 2.3 ActivityHeatmap.tsx

```typescript
// Before
const getHeatmapColors = (theme: Theme) => {
  const isDark = theme.palette.mode === 'dark';
  if (isDark) {
    return {
      0: '#1f2937',
      // ...
    };
  }
  // ...
};

// After
const getHeatmapColors = (theme: Theme) => {
  return theme.palette.mode === 'dark'
    ? theme.custom.heatmapColors.dark
    : theme.custom.heatmapColors.light;
};
```

#### 2.4 DailySummary.tsx

```typescript
// Before
<KPICard color="#8B5CF6" />
<KPICard color="#F59E0B" />

// After
<KPICard color={theme.palette.info.main} />
<KPICard color={theme.palette.warning.main} />
```

### Phase 3: 型定義更新

```typescript
// modernTheme.ts の Theme 型拡張
declare module '@mui/material/styles' {
  interface Theme {
    custom: {
      // 既存...
      chartColors: string[];
      heatmapColors: {
        light: Record<number, string>;
        dark: Record<number, string>;
      };
    };
  }
}
```

## 4. 修正対象ファイル一覧

| ファイル                                               | Phase | 修正内容                                    |
| ------------------------------------------------------ | ----- | ------------------------------------------- |
| `src/styles/modernTheme.ts`                            | 1     | chartColors, heatmapColors 追加             |
| `src/components/ui/layout/Sidebar.tsx`                 | 2     | #FFFFFF → theme.palette, フォールバック削除 |
| `src/components/timer/Timer.tsx`                       | 2     | #FFFFFF → theme.palette, rgba → alpha()     |
| `src/components/dashboard/ActivityHeatmap.tsx`         | 2     | ハードコード色 → theme.custom.heatmapColors |
| `src/components/dashboard/DailySummary.tsx`            | 2     | ハードコード色 → theme.palette              |
| `src/components/dashboard/WeeklySummary.tsx`           | 2     | #8884d8 → theme.palette.primary.main        |
| `src/components/ui/KPICard.tsx`                        | 2     | グラデーション → theme.custom.gradients     |
| `src/components/ui/project/ProjectCard.tsx`            | 2     | rgba → alpha()                              |
| `src/components/ui/project/ProjectCardActions.tsx`     | 2     | ハードコード色確認・修正                    |
| `src/components/ui/project/ProjectProgressSection.tsx` | 2     | rgba → alpha()                              |
| `src/components/dashboard/MonthlySummary.tsx`          | 2     | ハードコード色確認・修正                    |

## 5. テスト計画

各 Phase 完了後:

1. **ライトモード確認**: 全画面で色が正しく表示されることを確認
2. **ダークモード確認**: 全画面で色が正しく表示されることを確認
3. **既存テスト実行**: `npm test` が全てパスすることを確認

## 6. 備考

- フォールバック値（`|| 'hardcoded-value'`）は、テーマが確実に提供される環境では不要
- ただし、StyledComponents 内のフォールバックは、テーマ読み込み前のレンダリング対策として残す選択肢もある
- Recharts などサードパーティライブラリの fill プロパティは、テーマから値を取得して渡す形式に統一
