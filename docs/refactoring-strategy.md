# リファクタリング戦略ドキュメント

## 概要

このドキュメントでは、Project Activity Logアプリケーションのリファクタリング戦略について説明します。t-wada（和田卓人）氏のアプローチに基づき、テストで保護された安全なリファクタリングを段階的に実施するための具体的な計画を示します。

## リファクタリングの原則

### t-wadaアプローチの核心
1. **テストファースト**: リファクタリング前に必ずテストを書く
2. **小さなステップ**: 一度に変更する範囲を最小限に抑える
3. **継続的な実行**: 各ステップでテストを実行し、安全性を確認
4. **段階的改善**: 完璧を目指さず、着実に品質を向上させる

### 品質指標の設定
- **テストカバレッジ**: 80%以上
- **ファイルサイズ**: 200行以下
- **循環的複雑度**: 10以下
- **TypeScript strict mode**: エラー0

## 現状分析

### 主要な問題点
1. **App.tsx**: 549行、20以上の責務を持つ巨大コンポーネント
2. **テストカバレッジ**: 1.25%（ほぼゼロ）
3. **状態管理**: プロップドリリング、密結合
4. **コードの重複**: タイマーロジック、日付計算など
5. **型安全性**: any型の多用、不十分な型定義

### リスク評価
- **高リスク**: App.tsx、useStorage.ts
- **中リスク**: Timer関連コンポーネント、Dashboard系
- **低リスク**: 個別のUI コンポーネント

## 段階的リファクタリング計画

### Phase 1: テスト基盤強化 【完了】✅
**期間**: 1-2週間  
**目標**: 安全なリファクタリングのためのテスト基盤構築

#### 完了した作業
- [x] Jest + React Testing Library環境構築
- [x] Electronモック環境構築
- [x] 特性テスト作成（useStorage、Timer）
- [x] CI/CD設定
- [x] カバレッジレポート設定

#### 成果
- テストカバレッジ: 0% → 20.13% (Timer.tsx: 96.66%)
- CI/CDパイプライン稼働
- 安全なリファクタリング基盤確立

### Phase 2: ドメインロジック抽出 【次のステップ】
**期間**: 2-3週間  
**目標**: ビジネスロジックをドメイン層に分離

#### 2.1 タイマードメインの抽出
```typescript
// src/domain/timer/TimerService.ts
export class TimerService {
  static readonly MAX_DURATION_HOURS = 8;
  
  static isOverLimit(startTime: string): boolean {
    const elapsed = Date.now() - new Date(startTime).getTime();
    return elapsed >= this.MAX_DURATION_HOURS * 60 * 60 * 1000;
  }
  
  static formatElapsedTime(milliseconds: number): string {
    // 時間フォーマット処理
  }
}
```

#### 2.2 プロジェクト管理ドメインの抽出
```typescript
// src/domain/project/ProjectService.ts
export class ProjectService {
  static calculateMonthlyHours(
    baseHours: number, 
    capacity: number
  ): number {
    return Math.round(baseHours * capacity);
  }
  
  static validateCapacity(projects: Project[]): ValidationResult {
    // 稼働率検証ロジック
  }
}
```

#### 2.3 対象ファイルとテスト戦略
| ファイル | 抽出対象 | テスト戦略 |
|---------|---------|----------|
| src/components/timer/Timer.tsx | 8時間制限、時間計算 | 既存テスト維持 |
| src/components/timer/GlobalTimer.tsx | 重複ロジック統合 | 新規テスト作成 |
| src/utils/time.ts | 日付計算統合 | ユニットテスト強化 |
| src/components/ui/project/* | 稼働率計算 | ドメインテスト追加 |

### Phase 3: 状態管理の改善
**期間**: 2週間  
**目標**: Context APIによる状態分離とプロップドリリング解消

#### 3.1 Timer Context の作成
```typescript
// src/contexts/TimerContext.tsx
interface TimerContextType {
  activeProject: Project | null;
  isRunning: boolean;
  startTime: string | null;
  elapsed: number;
  startTimer: (project: Project) => void;
  stopTimer: () => void;
}
```

#### 3.2 Project Context の強化
```typescript
// src/contexts/ProjectContext.tsx
interface ProjectContextType {
  projects: Project[];
  timeEntries: TimeEntry[];
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  // CRUD操作の統合
}
```

#### 3.3 カスタムフックへの移行
```typescript
// src/hooks/useTimer.ts
export const useTimer = () => {
  // タイマーロジックの集約
}

// src/hooks/useProjects.ts
export const useProjects = () => {
  // プロジェクト管理の集約
}
```

### Phase 4: App.tsx の分解
**期間**: 3週間  
**目標**: 巨大コンポーネントの責務分離

#### 4.1 ルーティングの分離
```typescript
// src/components/routing/AppRouter.tsx
export const AppRouter: React.FC = () => {
  const [activePage, setActivePage] = useState('dashboard');
  // ルーティングロジックのみ
}
```

#### 4.2 キーボードショートカットの分離
```typescript
// src/hooks/useKeyboardShortcuts.ts
export const useKeyboardShortcuts = (callbacks: ShortcutCallbacks) => {
  // 295-373行のショートカット処理を移行
}
```

#### 4.3 App.tsx のリファクタリング順序
1. **テスト追加**: App.tsxの現在の動作をテストで保護
2. **ルーティング分離**: AppRouter コンポーネント作成
3. **状態管理移行**: Context API への移行
4. **イベントハンドラー分離**: カスタムフックへの移行
5. **UI表示分離**: レンダリングロジックの整理

### Phase 5: 型安全性の向上
**期間**: 1週間  
**目標**: TypeScript strict modeでエラー0

#### 5.1 Electron API の型定義改善
```typescript
// src/types/electron.d.ts
interface ElectronAPI {
  loadProjects(): Promise<Project[]>;
  saveProjects(projects: Project[]): Promise<void>;
  // any型の排除
}
```

#### 5.2 厳密な型チェックの段階的導入
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

## 実装戦略

### マイクロリファクタリング
各フェーズで以下のサイクルを繰り返し：

1. **Red**: 既存動作を保護するテストを書く
2. **Green**: テストをパスさせる最小限の実装
3. **Refactor**: 安全にコードを改善
4. **Test**: テストを実行して安全性確認

### 並行作業の可能性
- **ドメインロジック抽出** と **型定義改善** は並行実施可能
- **状態管理改善** は **App.tsx分解** の前提条件
- **テスト追加** は全フェーズで継続的に実施

### ロールバック戦略
- 各フェーズの開始時にブランチを作成
- フェーズ完了時にマージ
- 問題発生時は前のブランチに戻る

## 品質管理

### 継続的な品質測定
```bash
# 毎日実行
npm run test:coverage
npm run test:ci
npx tsc --noEmit

# 週次実行
npm audit
npm outdated
```

### コードレビュープロセス
1. **自動チェック**: CI/CDでの自動テスト
2. **静的解析**: TypeScript、ESLint（導入予定）
3. **手動レビュー**: プルリクエストレビュー
4. **ペアプログラミング**: 複雑な部分の共同作業

### リファクタリング完了基準
各フェーズの完了基準：
- [ ] テストカバレッジ目標達成
- [ ] CI/CD パス
- [ ] 型エラー解消
- [ ] パフォーマンス維持
- [ ] 機能の完全性確認

## リスク管理

### 技術的リスク
1. **パフォーマンス劣化**: 各フェーズでベンチマークテスト
2. **機能の欠損**: 特性テストによる動作保護
3. **型エラー**: 段階的なstrict mode導入

### スケジュールリスク
1. **作業見積もり**: 各フェーズの詳細計画
2. **依存関係**: フェーズ間の前提条件管理
3. **優先順位**: ビジネス価値の高い部分から着手

### 人的リスク
1. **知識の属人化**: ドキュメント化の徹底
2. **スキル不足**: ペアプログラミングによる知識共有
3. **作業の中断**: 段階的アプローチによる影響最小化

## 成功指標

### 定量的指標
- **テストカバレッジ**: 80%以上
- **平均ファイルサイズ**: 200行以下
- **型エラー数**: 0
- **ビルド時間**: 現状維持
- **バンドルサイズ**: 10%以内の増加

### 定性的指標
- **保守性の向上**: 新機能追加の容易さ
- **可読性の向上**: コードレビューの効率化
- **安定性の向上**: バグ発生率の減少
- **開発体験の向上**: 開発者の満足度

## 次のアクション

### 即座に開始可能
1. **Phase 2.1**: TimerService の作成とテスト
2. **既存テストの拡充**: useStorage、Timer の網羅性向上
3. **ドキュメント整備**: 各ドメインの仕様明確化

### 検討事項
1. **ESLint/Prettier導入**: コードスタイルの統一
2. **Storybook導入**: コンポーネントの視覚的テスト
3. **E2Eテスト**: Electronアプリの統合テスト

このリファクタリング戦略により、安全かつ段階的にコードベースを改善し、長期的な保守性と開発効率を向上させることができます。