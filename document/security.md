# セキュリティ対策

LINE Auth API で実施しているセキュリティ対策を解説します。

- セキュリティチェックリスト
- 各対策の詳細
- 環境変数の管理

---

## セキュリティチェックリスト

| チェック項目 | 対応箇所 |
|---|---|
| 通信は HTTPS | Cloudflare Workers は HTTPS 強制 |
| LINE ID Token の検証 | `src/util/lineApi.ts` の `verifyIdToken` |
| aud (channel ID) の一致確認 | `verifyIdToken` 内で二重チェック |
| JWT の署名・検証 | `src/util/jwt.ts`（HMAC-SHA256） |
| JWT の有効期限 | 1時間（exp クレーム） |
| API 認証 | `Authorization: Bearer` ヘッダーで JWT を検証 |
| CORS 制限 | `FRONTEND_URL` と一致するオリジンのみ許可 |
| client_secret の秘匿 | `wrangler secret` で管理、サーバー側のみ使用 |
| リクエストバリデーション | `PUT /profile` でフィールドごとに検証 |

---

## 各対策の詳細

### 1. HTTPS 通信の強制

Cloudflare Workers はデフォルトで HTTPS のみ受け付けるため、通信経路上でのトークン漏洩リスクを軽減しています。

### 2. LINE ID Token の検証

LIFF SDK から取得した ID Token を LINE の検証エンドポイント (`POST /oauth2/v2.1/verify`) に送信し、トークンの正当性を確認します。

`src/util/lineApi.ts` の `verifyIdToken` では以下を検証しています:

- LINE サーバーによるトークン署名・有効期限の検証
- `aud`（audience）が自分の Channel ID と一致するかの二重チェック

### 3. JWT (Bearer Token) による認証

`/user-token` で発行した JWT を以降の API 呼び出しで使用します。

| 項目 | 値 |
|---|---|
| アルゴリズム | HMAC-SHA256 |
| 署名キー | `SESSION_SECRET`（環境変数） |
| 有効期限 | 1時間 |
| ペイロード | `{ lineUserId, iat, exp }` |

JWT はステートレスなため、KV へのセッション問い合わせが不要で、レイテンシが低くなります。

### 4. CORS によるオリジン制限

`src/index.ts` で CORS を設定し、`FRONTEND_URL` と一致するオリジンからのリクエストのみ許可しています。`Authorization` および `line-id-token` カスタムヘッダーも明示的に許可しています。

### 5. リクエストバリデーション

`PUT /profile` では以下のフィールドを検証しています:

| フィールド | 検証内容 |
|---|---|
| `gender` | 0, 1, 2 のいずれか |
| `ageGroup` | 0〜6 のいずれか |
| `residence` | 都道府県コード（01〜47 の2桁文字列） |

不正な値がある場合は 400 Bad Request と `errorParams` で不正フィールド名を返します。

---

## 環境変数の管理

### シークレット（`wrangler secret put` で設定）

| 変数名 | 説明 |
|---|---|
| `LINE_CHANNEL_SECRET` | LINE チャネルシークレット |
| `SESSION_SECRET` | JWT 署名キー |

### 環境変数（`wrangler.toml` の `[vars]` で設定）

| 変数名 | 説明 |
|---|---|
| `LINE_CHANNEL_ID` | LINE チャネル ID |
| `FRONTEND_URL` | LIFF アプリの URL（CORS 許可対象） |

---

## リファレンス

- [LINE Login セキュリティチェックリスト](https://developers.line.biz/ja/docs/line-login/security-checklist/)
- [Cloudflare Workers Secrets](https://developers.cloudflare.com/workers/configuration/secrets/)
- [Hono JWT Middleware](https://hono.dev/docs/helpers/jwt)
