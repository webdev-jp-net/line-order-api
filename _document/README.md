# LINEサービスメッセージを用いた注文受付システムの仕様書

プロジェクトの統合ドキュメント管理リポジトリです。要件定義・仕様書・設計書を一元管理し、各実装リポジトリ（APIなど）が参照する正本を置きます。

## プロジェクト概要

LINEミニアプリを入口に、注文受付から「準備完了」の通知までを行う注文受付システムです。ユーザーはミニアプリで注文し、運営はSlackで通知を受けてボタンで状態を更新します。状態に応じてユーザーへLINEサービスメッセージを送ります。

詳細は [\_llm-docs/project.md](_llm-docs/project.md) を参照してください。

## このリポジトリの役割

プロジェクト統合ドキュメント管理 - 要件定義、仕様書、設計書の一元管理です。あわせて、AI（Claude Code）がセッションで従うルールを `_llm-rules/` に置いています。

## クイックスタート

### 外部サービスの登録

変数の一覧・用途は [\_llm-docs/spec/backend/tech_structure.md](_llm-docs/spec/backend/tech_structure.md) を参照してください。

**LINE Developers Console**

1. LINE MINI Appチャネルを作成します
2. スコープ `profile` と `openid` を有効化します
3. チャネルIDを控えます → `LINE_CHANNEL_ID`
4. チャネルシークレットを控えます → `LINE_CHANNEL_SECRET`（サーバがチャネルアクセストークンをステートレス発行するのに使用）
5. ［サービスメッセージテンプレート］タブで「注文受付」「準備完了」のテンプレートを登録し、各「API用テンプレート名」（`{template name}_{BCP 47 language tag}`、30文字以内）を控えます → `LINE_TEMPLATE_OPEN` / `LINE_TEMPLATE_DONE`

**Slack App**

1. Appを作成しBot Tokenを発行します → `SLACK_BOT_TOKEN`
2. Signing Secretを取得します → `SLACK_SIGNING_SECRET`
3. 新規注文の投稿先チャンネルIDを控えます → `SLACK_CHANNEL_ID`
4. Interactivityを有効化し、Request URLにAPIの `/slack/interactions` を設定します

**microCMS**

1. サービスを作成し、メニュー（品目）のコンテンツを登録します
2. フロントエンドがビルド時に取得して表示します（APIはメニューを参照しません）

### 環境変数の設定

APIリポジトリ（Cloudflare Workers）で設定します。

- 本番: `wrangler secret put <NAME>`
- ローカル: gitignore済みの `wrangler.dev.toml` の `[vars]`（`wrangler dev` は `wrangler secret put` を読まないため、シークレットもここに置きます）
- `SESSION_SECRET`（JWT署名キー）は任意の強いランダム文字列を生成します
- `FRONTEND_URL` はLIFFアプリのURL（CORS許可オリジン）です

## ディレクトリ構造

```
CLAUDE.md             # Claude Code のエントリーポイント
AGENT.md              # AI 開発者向けガイド

_llm-rules/           # AI ルール・開発規約
├── session_control.md         # セッション制御（必読）
├── core_rules.md              # 基本ルール
├── implementation_principles.md  # 実装原則
└── github_integration.md      # GitHub 連携

_llm-docs/            # プロジェクト仕様書
├── project.md        # 概要・システム構成・機能要件・ドキュメント構成
├── spec/             # 仕様書
│   ├── index.md          # 仕様索引（backend / user-app）
│   ├── backend/          # バックエンド仕様
│   │   ├── index.md          # 機能仕様（データフロー・状態・API・通知・Slack）
│   │   ├── tech_structure.md # 技術構成（採用技術・認証・環境変数・非機能要件）
│   │   ├── db_structure.md   # データ設計（Cloudflare KV）
│   │   └── security.md       # セキュリティ対策・環境変数管理
│   └── user-app/         # ユーザーアプリ仕様
│       └── index.md
└── operation/        # 運用・用語
    ├── dictionary.md     # 用語集（正本）
    └── generate-component.md  # コンポーネント生成ガイド
```

## 更新時の注意

⚠️ 要件変更・仕様修正時は必ずこのリポジトリを更新してください。用語は `_llm-docs/operation/dictionary.md` を正本とします。
