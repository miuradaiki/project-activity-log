# Design Guidelines

本ドキュメントは、Project Activity Log のUI実装における統一的なデザイン規約を定義する。

## 1. カラーシステム

### 1.1 セマンティックカラー

```typescript
// 常に theme.palette を使用し、ハードコードしない
const theme = useTheme();

// ✅ Good
theme.palette.primary.main; // メインアクション、選択状態
theme.palette.secondary.main; // アクティブなタイマー、進行中の状態
theme.palette.success.main; // 成功、正常状態、上昇トレンド
theme.palette.warning.main; // 警告（90%以上の進捗など）
theme.palette.error.main; // エラー、100%超過、下降トレンド
theme.palette.info.main; // 情報、アーカイブ状態
theme.palette.text.primary; // メインテキスト
theme.palette.text.secondary; // 補助テキスト

// ❌ Bad
('#3B82F6'); // ハードコードされた色
('blue'); // 名前による色指定
```

### 1.2 モード対応（ライト/ダーク）

```typescript
// ✅ 常にテーマモードを意識したスタイリング
sx={{
  background: theme.palette.mode === 'dark'
    ? 'rgba(26, 31, 46, 0.4)'
    : 'rgba(255, 255, 255, 0.7)',
  color: theme.palette.text.primary,
}}

// ✅ グラデーションも同様
background: theme.palette.mode === 'dark'
  ? 'linear-gradient(135deg, #FFFFFF, #B0B3B8)'
  : 'linear-gradient(135deg, #1A1F2E, #374151)',
```

### 1.3 透明度の使用

```typescript
import { alpha } from '@mui/material/styles';

// ✅ alpha関数で透明度を制御
alpha(theme.palette.primary.main, 0.1); // 背景ハイライト（10%）
alpha(theme.palette.primary.main, 0.08); // ホバー状態（8%）
alpha(theme.palette.primary.main, 0.3); // ボーダー（30%）

// ❌ rgba直書きは避ける（テーマカラーと不一致になる）
('rgba(0, 0, 0, 0.1)');
```

## 2. スペーシングシステム

### 2.1 基本単位

テーマのspacing関数（8px単位）を使用する。

```typescript
// ✅ Good - テーマのspacing
sx={{
  p: 2,    // 16px
  mb: 3,   // 24px
  mt: 1.5, // 12px（0.5単位も可）
}}

// ✅ theme.spacing()関数も使用可
margin: theme.spacing(2)  // 16px

// ❌ Bad - ピクセル直指定
sx={{
  padding: '16px',
  marginBottom: '24px',
}}
```

### 2.2 標準スペーシング値

| 用途               | 値           | ピクセル |
| ------------------ | ------------ | -------- |
| 要素内の密な間隔   | 0.5-1        | 4-8px    |
| 要素内の標準間隔   | 1.5-2        | 12-16px  |
| セクション間       | 3            | 24px     |
| カード内パディング | 2-3          | 16-24px  |
| ページパディング   | xs: 2, md: 3 | 16-24px  |

### 2.3 レスポンシブスペーシング

```typescript
// ✅ ブレークポイント別の指定
sx={{
  p: { xs: 2, md: 3 },      // モバイル: 16px, デスクトップ: 24px
  mb: { xs: 2, md: 3 },
}}
```

## 3. タイポグラフィ

### 3.1 見出しの使い分け

| バリアント | 用途                           | fontWeight    |
| ---------- | ------------------------------ | ------------- |
| h4         | ページタイトル（メインページ） | 600           |
| h5         | セクションタイトル             | 600（medium） |
| h6         | カードタイトル、サブセクション | 600（bold）   |
| subtitle1  | ラベル、小見出し               | 500           |
| body1      | 本文                           | 400           |
| body2      | 補助テキスト、説明             | 400           |

### 3.2 テキストスタイル

```typescript
// ✅ Typographyコンポーネントを使用
<Typography variant="h5" fontWeight="medium" sx={{ mb: 3 }}>
  {title}
</Typography>

<Typography variant="body2" color="text.secondary">
  {description}
</Typography>

// ❌ span/divに直接スタイル
<span style={{ fontSize: '16px', fontWeight: 'bold' }}>
```

### 3.3 テキスト省略

```typescript
// 複数行省略
sx={{
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}}
```

## 4. レイアウト

### 4.1 グリッドシステム

MUI Grid（12カラム）を使用する。

```typescript
// ✅ 標準的なレスポンシブグリッド
<Grid container spacing={3}>
  <Grid item xs={12} md={6}>
    {/* 2カラムレイアウト（モバイルで1カラム） */}
  </Grid>
  <Grid item xs={12} md={6}>
    {/* ... */}
  </Grid>
</Grid>

// プロジェクトカードなど
<Grid item xs={12} sm={6} md={4}>
  {/* 3カラム（タブレットで2、モバイルで1） */}
</Grid>
```

### 4.2 コンテナ幅

```typescript
// ページコンテンツの最大幅
<Box sx={{ maxWidth: 'lg', mx: 'auto' }}>

// 設定画面など狭いコンテンツ
<Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
```

### 4.3 Flexboxパターン

```typescript
// 水平配置（両端揃え）
sx={{
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}}

// 水平配置（左揃え）
sx={{
  display: 'flex',
  alignItems: 'center',
  gap: 1.5,
}}

// 縦積み
sx={{
  display: 'flex',
  flexDirection: 'column',
}}
```

## 5. ブレークポイント

### 5.1 標準ブレークポイント

| 名前 | 値     | 用途                        |
| ---- | ------ | --------------------------- |
| xs   | 0px    | モバイル                    |
| sm   | 600px  | 小型タブレット              |
| md   | 900px  | タブレット/小型デスクトップ |
| lg   | 1200px | デスクトップ                |
| xl   | 1536px | 大型デスクトップ            |

### 5.2 レスポンシブ対応パターン

```typescript
const theme = useTheme();
const isMobile = useMediaQuery(theme.breakpoints.down('md'));

// 条件付きレンダリング
{isMobile ? <MobileView /> : <DesktopView />}

// sx内でのレスポンシブ
sx={{
  display: { xs: 'none', md: 'block' },  // モバイルで非表示
  flexDirection: { xs: 'column', md: 'row' },
}}
```

## 6. コンポーネント使用ルール

### 6.1 カードコンポーネント

| コンポーネント    | 用途                                              |
| ----------------- | ------------------------------------------------- |
| `GlassCard`       | プロジェクトカード、KPIカードなど強調したいカード |
| `GradientCard`    | CTAカード、特別な強調が必要な場合                 |
| `Paper`           | 一般的なコンテナ、セクションの囲み                |
| `Card`（MUI標準） | シンプルなカード（基本使用しない）                |

```typescript
// ✅ プロジェクトカード、ダッシュボードウィジェット
<GlassCard>
  <CardContent>...</CardContent>
</GlassCard>

// ✅ ダッシュボード内セクション
<Paper elevation={1} sx={{ p: 3 }}>
  ...
</Paper>
```

### 6.2 ボタンコンポーネント

| コンポーネント   | 用途                             |
| ---------------- | -------------------------------- |
| `GradientButton` | 主要アクション（保存、開始など） |
| `GhostButton`    | 二次アクション（キャンセルなど） |
| `Button`（MUI）  | 標準的なボタン                   |
| `IconButton`     | アイコンのみのボタン             |
| `Fab`            | フローティングアクションボタン   |

```typescript
// ✅ 主要アクション
<GradientButton onClick={handleSave}>
  保存
</GradientButton>

// ✅ 標準ボタン
<Button variant="contained" color="primary">
  開始
</Button>

<Button variant="outlined" color="inherit">
  キャンセル
</Button>
```

### 6.3 ステータス表示

```typescript
// ✅ StatusBadgeを使用
<StatusBadge status="success">正常</StatusBadge>
<StatusBadge status="warning">注意</StatusBadge>
<StatusBadge status="error">超過</StatusBadge>
<StatusBadge status="info">アーカイブ</StatusBadge>

// ステータスの判定基準
status={
  progress >= 100 ? 'error' :
  progress >= 90 ? 'warning' :
  'success'
}
```

### 6.4 アイコン

Material Icons を使用する。

```typescript
import {
  PlayArrow,      // 開始
  Stop,           // 停止
  Edit,           // 編集
  Delete,         // 削除
  Archive,        // アーカイブ
  Unarchive,      // アーカイブ解除
  MoreVert,       // メニュー
  Add,            // 追加
  TrendingUp,     // 上昇
  TrendingDown,   // 下降
  TrendingFlat,   // 横ばい
} from '@mui/icons-material';

// アイコンサイズ
<Icon fontSize="small" />   // 20px
<Icon fontSize="medium" />  // 24px（デフォルト）
<Icon fontSize="large" />   // 35px
```

## 7. アニメーション

### 7.1 Framer Motion の使用

```typescript
import { motion } from 'framer-motion';

// ✅ 標準的なフェードイン
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
>

// ✅ ホバーエフェクト
<motion.div
  whileHover={{ scale: 1.02, y: -8 }}
  whileTap={{ scale: 0.95 }}
>
```

### 7.2 定義済みアニメーション

`src/components/ui/modern/StyledComponents.tsx` で定義されたものを使用：

```typescript
import {
  fadeInUp,
  fadeIn,
  scaleIn,
  stagger,
  hoverScale
} from '../ui/modern/StyledComponents';

<motion.div {...fadeInUp}>
<motion.div {...hoverScale}>
```

### 7.3 トランジション

```typescript
// ✅ CSSトランジション
sx={{
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}}

// 標準イージング
'cubic-bezier(0.4, 0, 0.2, 1)'  // ease-in-out
'cubic-bezier(0.175, 0.885, 0.32, 1.275)'  // spring
```

### 7.4 アニメーション使用ガイドライン

- **控えめに**: 過度なアニメーションはUXを損なう
- **目的を持って**: ユーザーの注目を誘導、状態変化を伝達
- **一貫性**: 同じ種類のアクションには同じアニメーション
- **パフォーマンス**: transform/opacityを優先（reflow回避）

## 8. シャドウとエレベーション

### 8.1 標準シャドウ

```typescript
// テーマのカスタムシャドウを使用
theme.custom.shadows.soft; // 軽いシャドウ（デフォルト状態）
theme.custom.shadows.card; // カード用
theme.custom.shadows.hover; // ホバー時
theme.custom.shadows.medium; // 中程度の強調
theme.custom.shadows.strong; // 強い強調

// MUI標準シャドウ
theme.shadows[1]; // elevation 1
theme.shadows[4]; // ホバー時など
```

### 8.2 使用パターン

```typescript
// ✅ ホバーでシャドウを強調
sx={{
  boxShadow: theme.custom?.shadows?.card,
  '&:hover': {
    boxShadow: theme.custom?.shadows?.hover,
    transform: 'translateY(-4px)',
  },
}}
```

## 9. Border Radius

### 9.1 標準値

```typescript
theme.custom.borderRadius.xs; // 4px - 小さい要素（プログレスバー）
theme.custom.borderRadius.sm; // 8px - ボタン、チップ、入力
theme.custom.borderRadius.md; // 12px - 小さいカード
theme.custom.borderRadius.lg; // 16px - 標準カード
theme.custom.borderRadius.xl; // 24px - 大きいカード
theme.custom.borderRadius.xxl; // 32px - モーダルなど
```

### 9.2 使用例

```typescript
// ✅ 適切なサイズを選択
<Button sx={{ borderRadius: theme.custom?.borderRadius?.sm }}>
<Card sx={{ borderRadius: theme.custom?.borderRadius?.lg }}>
```

## 10. フォーム要素

### 10.1 入力フィールド

```typescript
// ✅ MUI TextField を使用
<TextField
  label="プロジェクト名"
  variant="outlined"
  fullWidth
  required
  error={!!error}
  helperText={error}
/>
```

### 10.2 スライダー

```typescript
<Slider
  value={value}
  onChange={handleChange}
  min={80}
  max={200}
  step={10}
  marks
  valueLabelDisplay="auto"
/>
```

### 10.3 セレクト

```typescript
<FormControl fullWidth>
  <InputLabel>プロジェクト</InputLabel>
  <Select value={value} onChange={handleChange} label="プロジェクト">
    {options.map(opt => (
      <MenuItem key={opt.id} value={opt.id}>{opt.name}</MenuItem>
    ))}
  </Select>
</FormControl>
```

## 11. フィードバック

### 11.1 通知（Snackbar）

```typescript
<Snackbar
  open={open}
  autoHideDuration={4000}
  onClose={handleClose}
  anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
>
  <Alert
    severity="success"  // success | error | warning | info
    variant="filled"
    elevation={6}
  >
    {message}
  </Alert>
</Snackbar>
```

### 11.2 ダイアログ

```typescript
<Dialog open={open} onClose={handleClose}>
  <DialogTitle>タイトル</DialogTitle>
  <DialogContent>
    <DialogContentText>説明テキスト</DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button onClick={handleClose}>キャンセル</Button>
    <Button onClick={handleConfirm} variant="contained" color="primary">
      確認
    </Button>
  </DialogActions>
</Dialog>
```

### 11.3 ツールチップ

```typescript
<Tooltip title="ヒントテキスト">
  <IconButton>
    <HelpIcon />
  </IconButton>
</Tooltip>
```

## 12. コーディング規約

### 12.1 スタイリング優先順位

1. **sx prop** - インラインスタイル（推奨）
2. **styled()** - 再利用可能なカスタムコンポーネント
3. **テーマオーバーライド** - グローバルなコンポーネントスタイル

```typescript
// ✅ sx prop（一般的なケース）
<Box sx={{ p: 2, display: 'flex' }}>

// ✅ styled（再利用するカスタムコンポーネント）
export const GlassCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(20px)',
}));
```

### 12.2 テーマへのアクセス

```typescript
// ✅ コンポーネント内
const theme = useTheme();

// ✅ styled内
styled(Component)(({ theme }) => ({
  color: theme.palette.primary.main,
}));

// ✅ sx prop内（自動でthemeにアクセス可能）
sx={{ bgcolor: 'primary.main' }}
```

### 12.3 禁止事項

```typescript
// ❌ インラインstyle
<div style={{ padding: '16px' }}>

// ❌ ハードコードされた色
sx={{ color: '#3B82F6' }}

// ❌ ピクセル直指定（spacing以外）
sx={{ margin: '24px' }}

// ❌ CSSファイルの使用
import './Component.css';
```

## 13. アクセシビリティ

### 13.1 必須要件

```typescript
// ✅ aria-label を必ず指定
<IconButton aria-label="メニューを開く">
  <MenuIcon />
</IconButton>

// ✅ 画像には alt を指定
<img src={src} alt="プロジェクトアイコン" />

// ✅ フォームには label を関連付け
<TextField label="プロジェクト名" id="project-name" />
```

### 13.2 カラーコントラスト

- テキストと背景のコントラスト比は4.5:1以上を維持
- 重要な情報は色だけで伝えない（アイコン、テキストを併用）

## 14. ファイル構成

```
src/
├── components/
│   ├── ui/
│   │   ├── modern/
│   │   │   └── StyledComponents.tsx  # カスタムstyledコンポーネント
│   │   ├── layout/
│   │   │   ├── Layout.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── project/
│   │   ├── timer/
│   │   └── global/
│   ├── dashboard/
│   ├── settings/
│   └── ...
├── styles/
│   ├── theme.ts          # 基本テーマ定義
│   └── modernTheme.ts    # 拡張テーマ（グラデーション、シャドウ等）
└── ...
```

## 15. チェックリスト

新しいコンポーネント作成時：

- [ ] テーマカラーを使用している（ハードコードなし）
- [ ] ライト/ダークモード両方で確認
- [ ] スペーシングは theme.spacing を使用
- [ ] レスポンシブ対応（xs, md ブレークポイント）
- [ ] 適切なTypographyバリアントを使用
- [ ] アニメーションは控えめで一貫性がある
- [ ] アクセシビリティ（aria-label等）を設定
- [ ] 既存のカスタムコンポーネント（GlassCard等）を活用
