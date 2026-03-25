# CLAUDE.md

このファイルは、リポジトリのコードを操作する際に Claude Code（claude.ai/code）へのガイダンスを提供します。

## プロジェクト概要

案件ごとの候補日管理と過密スケジュール検知に特化した、少人数チーム（約10名）向けスケジュール管理Webアプリ。

- **フロントエンド**: Nuxt 4 / TypeScript (Strict Mode) / Tailwind CSS / Pinia
- **バックエンド**: Firebase (Authentication, Firestore) — BaaS構成、サーバーレス
- **デプロイ**: Vercel
- **テスト**: Vitest（ユニット）/ Playwright（E2E）
- **パッケージマネージャー**: npm

## よく使うコマンド

```bash
npm run dev        # 開発サーバー起動
npm run build      # プロダクションビルド
npm run lint       # ESLint 実行
npm run test       # Vitest ユニットテスト
npm run test:e2e   # Playwright E2E テスト
```

## ディレクトリ構成

```
project-root/
├── app/
│   ├── components/   # Vue UIコンポーネント（PascalCase.vue）
│   ├── composables/  # ビジネスロジック・Firebase操作（camelCase.ts）
│   ├── layouts/      # 共通レイアウト
│   ├── middleware/   # 認証ガード
│   ├── pages/        # ルーティング（kebab-case.vue）
│   ├── plugins/      # Firebase初期化（firebase.client.ts）
│   └── utils/        # 汎用ヘルパー（camelCase.ts）
├── server/           # Nitro サーバーサイドロジック
├── tests/
│   ├── unit/         # Vitest（*.test.ts）
│   └── e2e/          # Playwright（*.spec.ts）
├── types/            # TypeScript型定義（.d.ts）
├── nuxt.config.ts
└── .env              # Firebase設定値（公開しない）
```

## コーディング規約

### 命名規則

| 対象 | 規則 | 例 |
|---|---|---|
| コンポーネント | `PascalCase.vue` | `ScheduleCard.vue` |
| ページ | `kebab-case.vue` | `overloaded-days.vue` |
| コンポーザブル | `camelCase.ts` | `useSchedules.ts` |
| ユーティリティ | `camelCase.ts` | `dateFormatter.ts` |
| クラス/型/インターフェース | `PascalCase` | `ScheduleCandidate` |
| 関数/変数 | `camelCase` | `updateScheduleStatus` |
| 定数 | `UPPER_SNAKE_CASE` | `MAX_CANDIDATE_COUNT` |
| Firestore コレクション | `snake_case` | `project_schedules` |

### コード設計の原則

- **UIとロジックの分離**: 複雑なビジネスロジックは必ず `composables/` に切り出す。コンポーネントは状態を表示するだけ
- **単一責任**: 1つのコンポーザブルは1ドメイン（予定管理・案件管理）に集中する
- **型安全**: `any` 禁止。Firebase から取得したデータには必ず定義済みインターフェースを適用
- **Early Return**: バリデーションや権限チェックを先頭で行い、ネストを深くしない
- **Atomic Operations**: 候補日削除を伴うステータス変更は Firestore のトランザクション／バッチ処理を使用

### コンポーザブルの構成順序

1. Firebase 等の外部依存の取得
2. リアクティブな状態（`ref`, `reactive`）の定義
3. 内部関数（ロジック・DB操作）の実装
4. ライフサイクル・ウォッチャー（`onMounted` 等）
5. `return` で公開する状態と関数

### コードサイズの目安

- ファイル: 最大 300行
- 関数: 最大 30行
- ネストの深さ: 最大 3レベル

### インポート順序

1. 外部依存（`nuxt`, `firebase/app` 等）
2. 内部コンポーザブル／ユーティリティ（`#imports`, `~`）
3. 型定義（`import type { ... }`）
4. 相対パス（`../components/...`）

### その他

- Nuxt の **Auto-imports** を最大活用し、`composables/` と `components/` は明示的インポートを避ける
- Firebase JS SDK は `.client.ts` ファイルで動作させ、SSR 時の不整合を防ぐ
- Tailwind CSS の `sm:`, `md:`, `lg:` プレフィックスで1ファイル内にレスポンシブ対応を完結させる
- `composables/` の公開関数には JSDoc で引数と戻り値を記述する

## Firestoreデータモデル

```
projects（コレクション）
  └── id: string
      name: string
      ownerId: string  // Firebase Auth UID

schedules（コレクション）
  └── id: string
      projectId: string
      title: string
      status: 'candidate' | 'confirmed'
      confirmedDate: Timestamp | null
      candidateDates: Array<Timestamp>  // 最大5件
```

## セキュリティルール方針

```javascript
// 認証済みユーザーが自身のデータのみにアクセス可能
allow read, write: if request.auth != null && request.auth.uid == resource.data.ownerId
```

セキュリティルールの意図は `firestore.rules` 内にコメントで残すこと。

## 仕様書の場所

詳細な仕様は `.spec-workflow/user-templates/` を参照してください。

| ファイル | 内容 |
|---|---|
| `product-template.md` | 製品概要・機能一覧・ビジネス目標 |
| `requirements-template.md` | 機能要件・非機能要件・受け入れ条件 |
| `design-template.md` | アーキテクチャ・データモデル・設計方針 |
| `tech-template.md` | 技術スタック・開発環境 |
| `structure-template.md` | ディレクトリ構成・命名規則・コードパターン |
| `tasks-template.md` | 実装タスク一覧 |
