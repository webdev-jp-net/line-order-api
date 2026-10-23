# 仕様

LINEミニアプリ注文システムの仕様です。領域別に分かれています。用語は [../operation/dictionary.md](../operation/dictionary.md) を参照してください。

## バックエンド（line-order-api）

- [機能仕様](backend/index.md) - データフロー・状態・API・サービスメッセージ・Slack連携
- [技術構成](backend/tech_structure.md) - 採用技術・認証・環境変数・非機能要件
- [データ設計](backend/db_structure.md) - Cloudflare KV
- [セキュリティ](backend/security.md) - セキュリティ対策・環境変数管理

## ユーザーアプリ（フロントエンド）

- [機能仕様](user-app/index.md) - 概要・技術構成・認証フロー・ルーティング・API連携
- [LINE認証](user-app/line-auth.md) - LIFF初期化・ログイン・コールバック処理・トークン管理
- [メニュー](user-app/menu.md) - microCMS / Jamstack（ビルド時取得）
- [スタイリング方針](user-app/style.md) - CSS Modules / SCSSの実装方針
