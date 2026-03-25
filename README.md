# スケジュール管理アプリ

案件ごとの候補日管理と過密スケジュール検知に特化した、少人数チーム向けスケジュール管理Webアプリです。

---

## 概要

調整中の予定を最大5つの候補日で管理し、1つが確定した瞬間に不要な候補を自動削除します。また、全案件を横断して特定日に業務が集中していないかをリアルタイムで検知・可視化します。

---

## 主な機能

| 機能 | 説明 |
|---|---|
| マルチ候補日登録 | 1つの予定に最大5件の候補日を登録・変更・削除 |
| オートクリーン確定 | 1つの候補を「確定」すると、他の候補日をシステムが自動削除 |
| 過密日検知 | 全案件を横断し、設定した工数条件を超えた日を過密日として一覧表示 |
| カレンダー表示 | 縦軸：日付 / 横軸：案件のカレンダーUI。当日は青、過密日は赤でハイライト |
| 過密日条件の設定 | 過密日と見なす工数（確定日・調整日）をカスタマイズ可能 |
| タグ管理 | 「撮影」「打ち合わせ」などのタグを作成・編集・削除 |
| マルチデバイス対応 | PCとスマホの両方でレイアウトが崩れずに全機能を操作可能 |
| 認証 | Firebase Authentication によるセキュアなログイン |

---

## ターゲットユーザー

10名程度の小規模なエンジニアチームやプロジェクトメンバー。

**解決するペインポイント：**
- 仮予定でカレンダーが埋まり、空き時間が分かりにくい
- 確定後にボツ候補日を消し忘れてダブルブッキングが発生する
- 複数案件が重なり、特定日への業務集中に気づけない

---

## 技術スタック

| カテゴリ | 技術 |
|---|---|
| フロントエンド | Nuxt 4 / TypeScript (Strict Mode) |
| スタイリング | Tailwind CSS |
| 状態管理 | Pinia |
| バックエンド | Firebase (Authentication, Firestore) |
| アイコン | Lucide Vue Next |
| テスト | Vitest（ユニット）/ Playwright（E2E） |
| デプロイ | Vercel |

---

## アーキテクチャ

```
Frontend (Nuxt 4)
    └── app/
        ├── components/   # UIコンポーネント
        ├── composables/  # ビジネスロジック・Firebase操作
        ├── pages/        # ルーティング（各画面）
        ├── plugins/      # Firebase初期化
        ├── middleware/   # 認証ガード
        └── utils/        # 日付フォーマット等のヘルパー

Backend (Firebase / BaaS)
    ├── Authentication    # ユーザー認証
    └── Firestore         # データストア
        ├── projects      # 案件情報
        └── schedules     # 予定・候補日情報
```

データの書き込みはすべてクライアントサイドのトランザクション／バッチ処理で整合性を担保し、Firebase 無料枠（Sparkプラン）内での運用を前提としています。

---

## セキュリティ

- Firebase Authentication による認証必須
- Firestore Security Rules により、認証済みユーザーが自身のデータのみにアクセス可能
- 環境変数は Vercel ダッシュボードで管理し、クライアントに秘密情報を露出しない

---

## 開発環境のセットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ユニットテストの実行
npm run test

# E2Eテストの実行
npm run test:e2e

# Lintの実行
npm run lint
```

`.env` ファイルに Firebase の設定値を記載してください。

```env
NUXT_PUBLIC_FIREBASE_API_KEY=
NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NUXT_PUBLIC_FIREBASE_PROJECT_ID=
NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NUXT_PUBLIC_FIREBASE_APP_ID=
```
