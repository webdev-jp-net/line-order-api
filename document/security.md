# セキュリティ対策

LINE Auth API で実施しているセキュリティ対策を解説します。

- セキュリティチェックリスト
- 各対策の詳細
- 環境変数の管理

---

## セキュリティチェックリスト

| チェック項目 | 対応箇所 |
|---|---|
| redirect_uri は HTTPS | Cloudflare Workers は HTTPS 強制 |
| state の検証 | FE 側で生成・検証する想定 |
| client_secret の秘匿 | `wrangler secret` で管理、サーバー側のみ使用 |
| ID トークンの検証 | `src/util/lineApi.ts` の `verifyIdToken` |
| aud (channel ID) の一致確認 | `verifyIdToken` 内で二重チェック |
| 生のトークンを BE に送信しない | FE は code のみ送信、token 取得は BE 側 |
| セッション Cookie の保護 | HttpOnly, Secure, SameSite=Lax |

---

## 各対策の詳細

### 1. HTTPS 通信の強制

Cloudflare Workers はデフォルトで HTTPS のみ受け付けるため、通信経路上でのトークン漏洩リスクを軽減しています。

### 2. state パラメータ（CSRF 対策）

OAuth 認可リクエスト時に FE 側で暗号学的にランダムな `state` を生成し、`sessionStorage` に保持します。コールバック時に `state` が一致するか FE 側で照合することで、クロスサイトリクエストフォージェリを防ぎます。

### 3. client_secret の秘匿

`LINE_CHANNEL_SECRET` は `wrangler secret put` でシークレットとして管理し、Workers のサーバー側コードでのみ使用します。FE やクライアントには一切公開されません。

### 4. ID トークンの検証

LINE から取得した `id_token` を LINE の検証エンドポイント (`POST /oauth2/v2.1/verify`) に送信し、トークンの正当性を確認します。

`src/util/lineApi.ts` の `verifyIdToken` では以下を検証しています:

- LINE サーバーによるトークン署名・有効期限の検証
- `aud`（audience）が自分の Channel ID と一致するかの二重チェック

```typescript
if (payload.aud !== params.channelId) {
    throw new Error(
        `Channel ID mismatch: expected ${params.channelId}, got ${payload.aud}`,
    );
}
```

### 5. 認可コードフロー

FE は認可コード (`code`) のみを BE に送信し、アクセストークンや ID トークンの取得はすべてサーバー側で行います。これにより、トークンがクライアント側に露出するリスクを排除しています。

### 6. セッション Cookie の保護

セッション Cookie には以下の属性を設定しています:

| 属性 | 値 | 目的 |
|---|---|---|
| `HttpOnly` | `true` | JavaScript からのアクセスを禁止（XSS 対策） |
| `Secure` | `true` | HTTPS 通信でのみ送信 |
| `SameSite` | `Lax` | クロスサイトリクエストでの送信を制限（CSRF 対策） |
| `maxAge` | 604800 (7日) | セッションの有効期限 |

### 7. セッション TTL による自動失効

KV に保存するセッションデータには `expirationTtl: 604800`（7日）を設定しています。期限切れのセッションは KV 側で自動削除されるため、古いセッションが残り続けることはありません。

---

## 環境変数の管理

### シークレット（`wrangler secret put` で設定）

本番環境では以下の値を `wrangler secret put` で登録します。これらは Cloudflare のシークレットストアに暗号化して保存され、コードやリポジトリには含まれません。

| 変数名 | 説明 |
|---|---|
| `LINE_CHANNEL_SECRET` | LINE チャネルシークレット |
| `SESSION_SECRET` | セッション署名用シークレット |

### 環境変数（`wrangler.toml` の `[vars]` で設定）

公開しても問題ない値は `wrangler.toml` で管理します。

| 変数名 | 説明 |
|---|---|
| `LINE_CHANNEL_ID` | LINE チャネル ID |
| `LINE_CALLBACK_URL` | OAuth コールバック URL |
| `FRONTEND_URL` | LIFF アプリの URL（CORS 許可対象） |

---

## リファレンス

- [LINE Login セキュリティチェックリスト](https://developers.line.biz/ja/docs/line-login/security-checklist/)
- [Cloudflare Workers Secrets](https://developers.cloudflare.com/workers/configuration/secrets/)
