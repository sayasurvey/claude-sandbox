# プロジェクト構造

## ディレクトリ構成

Nuxt 4 のレイヤー構造に基づき、関心の分離（SoC）を意識した構成を採用します。

```
project-root/
├── .output/                # ビルド出力（Vercel デプロイ用）
├── app/                    # Nuxt 4 メインアプリケーション
│   ├── assets/             # スタイル（Tailwind CSS）、画像リソース
│   ├── components/         # Vue コンポーネント（UI・パーツ）
│   ├── composables/        # ビジネスロジック、Firebase 操作、ステート管理
│   ├── layouts/            # 共通レイアウト（PC/スマホレスポンシブ共通）
│   ├── middleware/         # 認証ガード（Auth Check）
│   ├── pages/              # ルーティング（各画面）
│   ├── plugins/            # Firebase 初期化プラグイン
│   └── utils/              # 汎用ヘルパー関数（日付フォーマット等）
├── public/                 # 静的アセット（favicon, robots.txt 等）
├── server/                 # Nitro サーバーエンジン（サーバーサイドロジック）
│   ├── api/                # 必要に応じた API エンドポイント
│   └── middleware/         # サーバーサイドミドルウェア
├── tests/                  # テストディレクトリ
│   ├── unit/               # Vitest によるユニットテスト
│   └── e2e/                # Playwright による E2E テスト
├── types/                  # TypeScript 型定義ファイル (.d.ts)
├── .env                    # 環境変数（Firebase API Key 等）
├── nuxt.config.ts          # Nuxt 設定ファイル
├── package.json            # npm 依存関係・スクリプト定義
└── tsconfig.json           # TypeScript 設定
```

## 命名規則

### ファイル
- **コンポーネント**: `PascalCase.vue` (例: `ScheduleCard.vue`)
- **ページ/ディレクトリ**: `kebab-case.vue` (例: `overloaded-days.vue`)
- **コンポーザブル**: `camelCase.ts` (例: `useSchedules.ts`)
- **ユーティリティ**: `camelCase.ts` (例: `dateFormatter.ts`)
- **テスト**: `[filename].test.ts` (ユニットテスト), `[filename].spec.ts` (E2Eテスト)

### コード
- **クラス/型/インターフェース**: `PascalCase` (例: `ScheduleCandidate`)
- **関数/メソッド/変数**: `camelCase` (例: `updateScheduleStatus`)
- **定数**: `UPPER_SNAKE_CASE` (例: `MAX_CANDIDATE_COUNT`)
- **Firebase コレクション**: `snake_case` (例: `project_schedules`)

## インポートパターン

### インポートの順序
1. 外部依存関係（`nuxt`, `firebase/app` 等）
2. 内部コンポーザブル/ユーティリティ（`#imports`, `~`）
3. 型定義（`import type { ... }`）
4. 相対パスによるインポート（`../components/...`）

### モジュール/パッケージの構成
- Nuxt の **Auto-imports** 機能を最大限活用し、`composables` や `components` は明示的なインポートを避けコードの簡潔性を維持する。
- 型定義については明示的に `import type` を使用し、ビルド時の最適化を図る。
- Firebase 関連は `plugins/firebase.client.ts` で初期化されたインスタンスを `composables` 経由で利用する。

## コード構造パターン

### コンポーザブル（Composables）の構成
```typescript
// 構成パターンの例:
// 1. 外部依存（Firebase 等）の取得
// 2. リアクティブな状態（ref, reactive）の定義
// 3. 内部関数（ロジック、DB操作）の実装
// 4. ライフサイクル・ウォッチャー（onMounted 等）
// 5. 公開する状態と関数の return
```

### 関数/メソッドの構成
* **Early Return**: 引数のバリデーションや権限チェックを最初に行い、ネストを深くしない。
* **Async/Await**: 非同期処理（Firebase 通信）には `try-catch` を用い、一貫したエラーハンドリングを行う。
* **Atomic Operations**: 候補日削除を伴うステータス変更は、Firestore のトランザクションまたはバッチ処理を使用する。

### コード組織の原則
* **Single Responsibility (単一責任)**: 1つのコンポーザブルは「予定管理」「案件管理」など1つのドメインに集中する。
* **Logic/UI Separation**: 複雑なビジネスロジックはコンポーネント内に書かず、必ず `composables` に切り出す。
* **Type Safety**: `any` の使用を禁止し、Firebase から取得したデータには必ず定義したインターフェースを適用する。
* **Responsive Integrity**: Tailwind CSS の `sm:`, `md:`, `lg:` プレフィックスを活用し、1つのファイル内でレスポンシブ対応を完結させる。

### モジュールの境界
* **Client vs Server**: Firebase JS SDK は主にクライアントサイド（`.client.ts`）で動作させ、SSR 時の不整合を防ぐ。
* **UI Components vs Business Composables**: コンポーネントは状態を表示し、コンポーザブルは状態を変更する。

### コードサイズのガイドライン
* **ファイルサイズ**: 1ファイルあたり最大 300行 程度を目安とする（超える場合はコンポーネントやロジックを分割）。
* **関数サイズ**: 1関数あたり最大 30行 程度。
* **ネストの深さ**: 最大 3レベル まで。

### ドキュメント標準
* **JSDoc**: `composables` の公開関数には JSDoc 形式で引数と戻り値の説明を記述すること。
* **Security Rules**: Firebase のセキュリティルールに関する意図は、`firestore.rules` 内にコメントで残すこと
