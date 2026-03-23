# タスクドキュメント

- [ ] **1. src/types/feature.ts でコアインターフェースを作成する**
  - **ファイル**: `src/types/feature.ts`
  - 機能データ構造のためのTypeScriptインターフェースを定義する
  - `base.ts` の既存ベースインターフェースを継承する
  - **目的**: 機能実装における型安全性を確立する
  - **参照**: `src/types/base.ts`
  - **要件**: 1.1
  - **プロンプト**: Role: 型システムとインターフェースを専門とするTypeScript開発者 | Task: 要件1.1に従い、`src/types/base.ts` の既存インターフェースを継承して、機能データ構造のための包括的なTypeScriptインターフェースを作成してください。 | Restrictions: 既存のベースインターフェースを変更しないこと。後方互換性を維持し、プロジェクトの命名規則に従うこと。 | Success: すべてのインターフェースがエラーなくコンパイルされ、ベース型から適切に継承され、機能要件を完全に型でカバーしていること。

- [ ] **2. src/models/FeatureModel.ts で基本モデルクラスを作成する**
  - **ファイル**: `src/models/FeatureModel.ts`
  - `BaseModel` クラスを継承した基本モデルを実装する
  - 既存のバリデーションユーティリティを使用してバリデーションメソッドを追加する
  - **目的**: 機能のデータレイヤーの基礎を提供する
  - **参照**: `src/models/BaseModel.ts`, `src/utils/validation.ts`
  - **要件**: 2.1
  - **プロンプト**: Role: Node.jsとデータモデリングに精通したバックエンド開発者 | Task: 要件2.1に従い、`src/models/BaseModel.ts` と `src/utils/validation.ts` の既存パターンを活用して、`BaseModel` を継承しバリデーションを実装した基本モデルクラスを作成してください。 | Restrictions: 既存のモデルパターンに従うこと。バリデーションユーティリティをバイパスしないこと。一貫したエラーハンドリングを維持すること。 | Success: モデルが `BaseModel` を正しく継承し、バリデーションメソッドが実装・テストされ、プロジェクトのアーキテクチャパターンに従っていること。

- [ ] **3. FeatureModel.ts に特定のモデルメソッドを追加する**
  - **ファイル**: `src/models/FeatureModel.ts` （タスク2から継続）
  - create、update、delete メソッドを実装する
  - 外部キーのリレーションシップ処理を追加する
  - **目的**: CRUD操作のためのモデル機能を完成させる
  - **参照**: `src/models/BaseModel.ts`
  - **要件**: 2.2, 2.3
  - **プロンプト**: Role: ORMとデータベース操作に精通したバックエンド開発者 | Task: 要件2.2および2.3に従い、`src/models/BaseModel.ts` のパターンを拡張して `FeatureModel.ts` にCRUDメソッドとリレーションシップ処理を実装してください。 | Restrictions: トランザクションの整合性を維持すること。既存のリレーションシップパターンに従うこと。ベースモデルの機能を重複させないこと。 | Success: すべてのCRUD操作が正しく動作し、リレーションシップが適切に処理され、データベース操作がアトミックかつ効率的であること。

- [ ] **4. tests/models/FeatureModel.test.ts でモデルのユニットテストを作成する**
  - **ファイル**: `tests/models/FeatureModel.test.ts`
  - モデルのバリデーションとCRUDメソッドのテストを記述する
  - 既存のテストユーティリティとフィクスチャを使用する
  - **目的**: モデルの信頼性を確保し、デグレードを検知する
  - **参照**: `tests/helpers/testUtils.ts`, `tests/fixtures/data.ts`
  - **要件**: 2.1, 2.2
  - **プロンプト**: Role: ユニットテストおよびJest/Mochaフレームワークに精通したQAエンジニア | Task: `tests/helpers/testUtils.ts` のユーティリティと `tests/fixtures/data.ts` のフィクスチャを使用して、要件2.1と2.2をカバーするFeatureModelのバリデーションおよびCRUDメソッドの包括的なユニットテストを作成してください。 | Restrictions: 成功と失敗の両方のシナリオをテストすること。外部依存関係を直接テストしないこと。テストの分離を維持すること。 | Success: すべてのモデルメソッドが十分なカバレッジでテストされ、エッジケースがカバーされ、テストが独立して一貫して実行されること。

- [ ] **5. src/services/IFeatureService.ts でサービスインターフェースを作成する**
  - **ファイル**: `src/services/IFeatureService.ts`
  - メソッドシグネチャを含むサービス契約を定義する
  - ベースサービスのインターフェースパターンを継承する
  - **目的**: 依存性注入（DI）のためのサービスレイヤーの契約を確立する
  - **参照**: `src/services/IBaseService.ts`
  - **要件**: 3.1
  - **プロンプト**: Role: サービス指向アーキテクチャとTypeScriptインターフェースを専門とするソフトウェアアーキテクト | Task: 要件3.1に従い、`src/services/IBaseService.ts` のベースサービスパターンを継承して、依存性注入用のサービスインターフェース契約を設計してください。 | Restrictions: インターフェース分離の原則を維持すること。内部実装の詳細を露出させないこと。DIコンテナとの互換性を確保すること。 | Success: 明確なメソッドシグネチャを持つインターフェースが定義され、ベースサービスを適切に継承し、必要なすべてのサービス操作をサポートしていること。

- [ ] **6. src/services/FeatureService.ts で機能サービスを実装する**
  - **ファイル**: `src/services/FeatureService.ts`
  - `FeatureModel` を使用した具体的なサービス実装を作成する
  - 既存のエラーユーティリティを使用してエラーハンドリングを追加する
  - **目的**: 機能操作のためのビジネスロジックレイヤーを提供する
  - **参照**: `src/services/BaseService.ts`, `src/utils/errorHandler.ts`, `src/models/FeatureModel.ts`
  - **要件**: 3.2
  - **プロンプト**: Role: サービスレイヤーのアーキテクチャとビジネスロジックに精通したバックエンド開発者 | Task: 要件3.2に従い、`FeatureModel` を使用し、`BaseService` パターンを拡張しつつ `src/utils/errorHandler.ts` による適切なエラーハンドリングを備えた具体的な `FeatureService` を実装してください。 | Restrictions: インターフェース契約を正確に実装すること。モデルのバリデーションをバイパスしないこと。データレイヤーからの関心の分離を維持すること。 | Success: サービスがすべてのインターフェースメソッドを正しく実装し、堅牢なエラーハンドリングがなされ、ビジネスロジックが適切にカプセル化されテスト可能であること。

- [ ] **7. src/utils/di.ts にサービスの依存性注入を追加する**
  - **ファイル**: `src/utils/di.ts` （既存を修正）
  - 依存性注入コンテナに `FeatureService` を登録する
  - サービスのライフタイムと依存関係を設定する
  - **目的**: アプリケーション全体でサービスの注入を可能にする
  - **参照**: `src/utils/di.ts` の既存設定
  - **要件**: 3.1
  - **プロンプト**: Role: 依存性注入とIoCコンテナに精通したDevOpsエンジニア | Task: 要件3.1に従い、`src/utils/di.ts` の既存パターンを使用して `FeatureService` をDIコンテナに登録し、適切なライフタイムと依存関係を設定してください。 | Restrictions: 既存のDIコンテナパターンに従うこと。循環参照を作成しないこと。サービス解決の効率性を維持すること。 | Success: `FeatureService` が正しく登録され解決可能であること。依存関係が正しく設定され、ライフタイムがユースケースに適していること。

- [ ] **8. tests/services/FeatureService.test.ts でサービスユニットテストを作成する**
  - **ファイル**: `tests/services/FeatureService.test.ts`
  - モック化された依存関係を使用してサービスメソッドのテストを記述する
  - エラーハンドリングのシナリオをテストする
  - **目的**: サービスの信頼性と適切なエラーハンドリングを確認する
  - **参照**: `tests/helpers/testUtils.ts`, `tests/mocks/modelMocks.ts`
  - **要件**: 3.2, 3.3
  - **プロンプト**: Role: サービス・テストとモック・フレームワークに精通したQAエンジニア | Task: 要件3.2および3.3をカバーする、`FeatureService` メソッドの包括的なユニットテストを作成してください。`tests/mocks/modelMocks.ts` のモック依存関係とテストユーティリティを使用すること。 | Restrictions: すべての外部依存関係をモック化すること。ビジネスロジックを分離してテストすること。フレームワーク自体のコードはテストしないこと。 | Success: すべてのサービスメソッドが適切なモックを用いてテストされ、エラーシナリオがカバーされ、ビジネスロジックの正当性とエラーハンドリングが検証されていること。

- [ ] **9. APIエンドポイントを作成する**
  - API構造を設計する
  - **参照**: `src/api/baseApi.ts`, `src/utils/apiUtils.ts`
  - **要件**: 4.0
  - **プロンプト**: Role: RESTfulデザインとExpress.jsを専門とするAPIアーキテクト | Task: 要件4.0に従い、`src/api/baseApi.ts` の既存パターンと `src/utils/apiUtils.ts` のユーティリティを活用して、包括的なAPI構造を設計してください。 | Restrictions: RESTの慣習に従うこと。APIバージョニングの互換性を維持すること。内部データ構造を直接露出させないこと。 | Success: API構造が適切に設計・文書化され、既存パターンに従い、適切なHTTPメソッドとステータスコードですべての必要操作をサポートしていること。

- [ ] **10. ルーティングとミドルウェアの設定**
  - アプリケーションのルートを設定する
  - 認証ミドルウェアを追加する
  - エラーハンドリングミドルウェアを設定する
  - **参照**: `src/middleware/auth.ts`, `src/middleware/errorHandler.ts`
  - **要件**: 4.1
  - **プロンプト**: Role: Express.jsのミドルウェアとルーティングに精通したバックエンド開発者 | Task: 要件4.1に従い、`src/middleware/auth.ts` の認証と `src/middleware/errorHandler.ts` のエラーハンドリングを統合して、アプリケーションのルートとミドルウェアを構成してください。 | Restrictions: ミドルウェアの順序を維持