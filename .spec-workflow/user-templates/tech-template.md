# 技術仕様書：スケジュール管理アプリ

## 1. テクノロジースタック (Technology Stack)

### プロジェクトタイプ
Webアプリケーション（レスポンシブ対応スケジュール管理システム）

### コアテクノロジー
- **主要言語**: TypeScript (Strict Mode)
- **ランタイム/コンパイラ**: Node.js (LTS), Vite (Nuxt内蔵)
- **言語固有のツール**: npm (パッケージマネージャー)

### 主要な依存関係/ライブラリ
- **Nuxt 4**: フロントエンドフレームワーク（最新のディレクトリ構造と機能を活用）
- **Firebase SDK**: バックエンドサービス（Authentication, Firestore）
- **Tailwind CSS**: UIスタイリング（レスポンシブデザインの迅速な実装）
- **Pinia**: 状態管理（スケジュールデータやユーザーセッションの管理）
- **Lucide Vue Next**: アイコンライブラリ

### アプリケーションアーキテクチャ
**クライアントサーバーアーキテクチャ（BaaS構成）**
- **Frontend**: Nuxt 4 (SSR/SSG併用) によるレンダリング。
- **Backend**: Firebase を利用したサーバーレス構成。10人程度の小規模利用に最適化。
- **Logic**: 候補日の確定処理（ステータス変更に伴う他候補の削除）は、クライアントサイドのトランザクションまたはバッチ書き込みで整合性を担保。

### データストレージ
- **プライマリ・ストレージ**: Cloud Firestore (NoSQL)
    - `projects` コレクション: 案件情報
    - `schedules` コレクション: 予定・候補日情報（1ドキュメント内に候補日配列を保持）
- **データフォーマット**: JSON

### 外部連携
- **API**: Firebase JS SDK
- **プロトコル**: HTTPS, WebSockets (Firestore リアルタイム更新用)
- **認証**: Firebase Authentication (メール/パスワード認証)

---

## 2. 開発環境

### ビルド・開発ツール
- **ビルドシステム**: npm scripts / Vite
- **パッケージ管理**: npm
- **開発ワークフロー**: Nitro (HMR対応), Nuxt DevTools

### コード品質ツール
- **静的解析**: ESLint (Flat Config), TypeScript
- **フォーマット**: Prettier / ESLint Stylistic
