# LINE Auth API

LINE Login + Cloudflare Workers + KV を使用した認証APIです。
LINE OAuth 2.1 による認証フローを Cloudflare Workers 上の Hono で処理し、セッションを KV で管理します。

## 技術スタック

### インフラ / デプロイ
- **Cloudflare Workers** - サーバーレス実行環境
- **Cloudflare KV** - ユーザーデータ・セッションの永続化
- **Wrangler** - Cloudflare Workers 公式 CLI

### Web フレームワーク
- **Hono** - 軽量・高速な Web フレームワーク

### 言語 / 開発環境
- **TypeScript** - 静的型付け
- **Biome** - コードフォーマッタ兼リンター

### 外部 API
- **LINE Login v2.1** - OAuth 2.1 認証・IDトークン検証

---

## データフロー

```mermaid
sequenceDiagram
	participant User as ユーザー（LIFF App）
	participant Worker as Cloudflare Workers（Hono）
	participant LINE as LINE API
	participant KV as Cloudflare KV

	User->>Worker: GET /auth/callback?code=xxx
	Worker->>LINE: POST /oauth2/v2.1/token
	LINE-->>Worker: access_token + id_token
	Worker->>LINE: POST /oauth2/v2.1/verify
	LINE-->>Worker: LINE User ID
	Worker->>KV: user:{lineUserId} upsert
	Worker->>KV: session:{uuid} 作成（TTL 7日）
	Worker-->>User: Set-Cookie + FE にリダイレクト
	User->>Worker: GET /api/me（Cookie）
	Worker->>KV: セッション・ユーザー検索
	Worker-->>User: UserData JSON
```

---

## ディレクトリ構成

```
src/
├── index.ts                  # Hono エントリポイント（CORS + ルーティング統合）
├── types.ts                  # 全型定義
├── routes/
│   ├── rootRoute.ts          # GET /
│   ├── authRoute.ts          # GET /auth/callback, POST /auth/logout
│   └── apiRoute.ts           # GET /api/me
├── handler/
│   ├── rootHandler.ts        # HTML ステータスページ
│   ├── auth/
│   │   ├── callbackHandler.ts  # LINE OAuth コールバック
│   │   └── logoutHandler.ts    # ログアウト
│   └── api/
│       └── meHandler.ts        # ユーザー情報取得
├── middleware/
│   └── authMiddleware.ts     # Cookie セッション認証
└── util/
    ├── lineApi.ts            # LINE API 通信
    ├── session.ts            # セッション CRUD
    └── userStore.ts          # ユーザーデータ CRUD
```

---

## エンドポイント

| メソッド | パス | 認証 | 説明 |
|---|---|---|---|
| GET | `/` | 不要 | HTML ステータスページ |
| GET | `/auth/callback` | 不要 | LINE OAuth コールバック |
| POST | `/auth/logout` | 不要 | ログアウト |
| GET | `/api/me` | 要 | ユーザー情報取得 |

---

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. LINE Developers Console の設定

1. [LINE Developers Console](https://developers.line.biz/console/) で LINE Login チャネルを作成
2. スコープに `profile` と `openid` を有効化
3. コールバック URL を登録

### 3. 環境変数の設定

ローカル開発用に `wrangler.dev.toml` を作成し、値を設定します（`.gitignore` 済み）。

```toml
[vars]
LINE_CHANNEL_ID = "あなたのチャネルID"
LINE_CHANNEL_SECRET = "あなたのチャネルシークレット"
LINE_CALLBACK_URL = "http://localhost:8787/auth/callback"
FRONTEND_URL = "http://localhost:3000"
SESSION_SECRET = "任意の強い文字列"
```

本番環境のシークレットは CLI で登録します。

```bash
npx wrangler secret put LINE_CHANNEL_SECRET
npx wrangler secret put SESSION_SECRET
```

### 4. 開発コマンド

```bash
# 開発サーバーの起動
npm run dev

# フォーマット
npx biome format --write src/

# リント
npm run lint

# 本番デプロイ
npm run deploy
```

---

## ドキュメント

詳細は `document/` 配下を参照してください。

- [architecture.md](document/architecture.md) - アーキテクチャ・KV データ構造・FE 実装例
- [security.md](document/security.md) - セキュリティ対策・環境変数管理
- [command.md](document/command.md) - 開発コマンド一覧
