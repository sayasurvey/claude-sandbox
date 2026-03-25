# タスクドキュメント：スケジュール管理アプリ実装

- [ ] **1. types/index.ts でコアデータモデルを定義する**
  - **ファイル**: `types/index.ts`
  - 案件（Project）および予定（Schedule）のTypeScriptインターフェースを定義する
  - 予定には `status` ('candidate' | 'confirmed') と最大5件の `candidateDates` 配列を含める
  - **目的**: アプリケーション全体での型安全性を確保し、候補日管理の仕様をコードに反映する
  - **参照**: 要件定義（最大5件の候補日）
  - **要件**: 1.0
  - **プロンプト**: Role: TypeScript型設計のエキスパート | Task: 案件(Project)と予定(Schedule)のインターフェースを作成してください。予定は「候補(candidate)」と「確定(confirmed)」のステータスを持ち、候補日は最大5件保持できる構造にしてください。 | Restrictions: Nuxt 4環境で利用可能なクリーンな型定義にすること。 | Success: コンパイルエラーがなく、ビジネスロジックに必要なプロパティが網羅されていること。

- [ ] **2. plugins/firebase.client.ts でFirebaseの初期化を行う**
  - **ファイル**: `app/plugins/firebase.client.ts`
  - Firebase JS SDK を使用して Auth および Firestore を初期化する
  - 環境変数（.env）から設定値を読み込む
  - **目的**: データベースおよび認証機能の基盤を構築する
  - **参照**: Firebase コンソール設定
  - **要件**: 2.0
  - **プロンプト**: Role: Firebaseエンジニア | Task: Nuxt 4のクライアントプラグインとしてFirebase(Auth/Firestore)を初期化するコードを記述してください。環境変数からConfigを読み込むように設定してください。 | Restrictions: 無料枠（Sparkプラン）を意識し、不要な接続が発生しないようにすること。 | Success: アプリ起動時にFirebaseインスタンスが正しく注入され、コンソールにエラーが出ないこと。

- [ ] **3. composables/useSchedules.ts で予定管理ロジックを実装する**
  - **ファイル**: `app/composables/useSchedules.ts`
  - 予定の追加、および候補日から確定へのステータス変更ロジックを実装する
  - **重要**: 確定ステータスへの変更時、他の候補日を配列から削除する処理をアトミックに実装する
  - **目的**: アプリケーションの主要なビジネスロジックをカプセル化する
  - **参照**: Firestore SDK (`updateDoc`, `arrayRemove` 等)
  - **要件**: 3.0 (ステータス遷移ロジック)
  - **プロンプト**: Role: フロントエンドエンジニア | Task: 予定のステータスを更新する関数を実装してください。特に「確定」に変更された際、選択された日付以外を候補日リストから完全に削除するロジックを含めてください。 | Restrictions: Firestoreの書き込み回数を最小限に抑えること。 | Success: ステータス変更後にDB上のデータが正しく更新され、不要な候補日が削除されていること。

- [ ] **4. pages/overloaded-days.vue で過密日確認ページを作成する**
  - **ファイル**: `app/pages/overloaded-days.vue`
  - 全案件の予定を取得し、同日に3つ以上の「確定済み」予定がある日をリストアップする
  - **目的**: リソース過多の日をユーザーが即座に把握できるようにする
  - **参照**: Firestore クエリ (`where('status', '==', 'confirmed')`)
  - **要件**: 4.0 (同日3つ以上の予定確認)
  - **プロンプト**: Role: UI/UXエンジニア | Task: 案件を横断して、同日に3件以上の確定予定がある日を一覧表示するページを作成してください。Tailwind CSSを使用してレスポンシブな表またはカード形式にしてください。 | Restrictions: クライアントサイドでの集計ロジックを効率化し、レンダリング負荷を抑えること。 | Success: 条件に合致する日付のみが正しく表示され、PC/スマホ両方で見やすいこと。

- [ ] **5. tests/unit/schedule.test.ts でロジックのユニットテストを作成する**
  - **ファイル**: `tests/unit/schedule.test.ts`
  - 候補日の削除ロジック（ステータス変更時）の正当性を検証するテストを記述する
  - **目的**: データの整合性が保たれていることを保証する
  - **参照**: Vitest
  - **要件**: 5.0 (ユニットテスト実装)
  - **プロンプト**: Role: QAエンジニア | Task: `useSchedules` composable のテストを作成してください。特に「5件の候補日から1つを確定したとき、残りの4件が削除されるか」をモックデータを用いて検証してください。 | Restrictions: 外部APIを実際に叩かず、Vitestのモック機能を使用すること。 | Success: すべてのテストケースがパスし、エッジケース（候補日が1件のみの場合など）も網羅されていること。

- [ ] **6. e2e/schedule-flow.spec.ts でPlaywrightテストを作成する**
  - **ファイル**: `e2e/schedule-flow.spec.ts`
  - ログイン → 予定登録 → 候補日選択 → 確定 → 他候補消失 の一連の流れをテストする
  - **目的**: ユーザー視点での機能完遂を確認する
  - **参照**: Playwright documentation
  - **要件**: 6.0 (E2Eテスト実装)
  - **プロンプト**: Role: テスト自動化エンジニア | Task: ユーザーが予定を確定させ、他の候補日が画面から消えるまでをシミュレートするE2EテストをPlaywrightで作成してください。 | Restrictions: PCとモバイル（iPhone等）の両方のビューポートで実行すること。 | Success: 正常系シナリオが自動実行され、意図したUIの変化が検知できること。

- [ ] **7. .eslintrc.cjs および .prettierrc の設定**
  - **ファイル**: `.eslintrc.cjs`, `.prettierrc`
  - Nuxt 4 と TypeScript に適した Linter/Formatter 設定を適用する
  - **目的**: コード品質の維持と一貫性の確保
  - **参照**: Nuxt ESLint Module
  - **要件**: 7.0 (Linter使用)
  - **プロンプト**: Role: フロントエンドアーキテクト | Task: Nuxt 4プロジェクトに最適なESLintとPrettierの設定ファイルを作成してください。TypeScriptの厳密なチェックを有効にしてください。 | Restrictions: 最新のFlat Config形式（可能な場合）または最新の推奨ルールに従うこと。 | Success: `npm run lint` を実行してエラーが発生せず、コードが自動整形されること。
  