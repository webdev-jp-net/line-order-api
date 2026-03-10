# LINE Auth API アーキテクチャ

LINE Login + Cloudflare Workers + KV を使用した認証APIのアーキテクチャを解説します。

- アーキテクチャ概要
- ファイル構成
- エンドポイント
- 認証フロー
- KV データ構造
- FE（LIFF）側の実装例

---

## アーキテクチャ概要

```
[ユーザー] → [LIFF App (FE)]
                 │
                 │ 1. LINE認証 → 認可コード取得
                 ↓
[Cloudflare Workers (Hono)]
  │
  ├── GET  /auth/callback     ← LINE からのリダイレクト先
  │     ├→ LINE API: POST /oauth2/v2.1/token   (code → token)
  │     ├→ LINE API: POST /oauth2/v2.1/verify  (id_token → user ID)
  │     ├→ KV: user:{lineUserId} に upsert
  │     ├→ KV: session:{uuid} を作成
  │     └→ Cookie にセッションID → FE にリダイレクト
  │
  ├── POST /auth/logout
  │
  └── GET  /api/me                  ← ユーザー情報取得
                 │
                 ↓
          [Cloudflare KV]
            user:{lineUserId}  → UserData (JSON)
            session:{uuid}     → SessionData (JSON, TTL 7日)
```

---

## ファイル構成

```
src/
  index.ts                          Hono エントリポイント（CORS + ルーティング統合）
  types.ts                          全型定義（Bindings, LINE API, UserData, SessionData）
  routes/
    rootRoute.ts                    GET / (HTML)
    authRoute.ts                    GET /auth/callback, POST /auth/logout
    apiRoute.ts                     GET /api/me
  handler/
    rootHandler.ts                  HTML ステータスページ
    auth/
      callbackHandler.ts           LINE OAuth コールバック処理
      logoutHandler.ts             ログアウト処理
    api/
      meHandler.ts                 ユーザー情報取得
  middleware/
    authMiddleware.ts              Cookie セッション認証
  util/
    lineApi.ts                     LINE API 通信（issueToken, verifyIdToken）
    session.ts                     セッション CRUD（KV, TTL 7日）
    userStore.ts                   ユーザーデータ CRUD（KV）
```

### パスエイリアス

| エイリアス | 解決先 |
|---|---|
| `@handler/*` | `src/handler/*` |
| `@routes/*` | `src/routes/*` |
| `@util/*` | `src/util/*` |
| `@middleware/*` | `src/middleware/*` |

---

## エンドポイント

### 認証（公開）

| メソッド | パス | 説明 |
|---|---|---|
| GET | `/auth/callback` | LINE OAuth コールバック。認可コード → トークン発行 → セッション作成 → FE リダイレクト |
| POST | `/auth/logout` | セッション削除 + Cookie クリア |

### API（要認証: Cookie セッション）

| メソッド | パス | 説明 |
|---|---|---|
| GET | `/api/me` | ログインユーザーの情報を取得 |

### その他

| メソッド | パス | 説明 |
|---|---|---|
| GET | `/` | HTML ステータスページ |

---

## 認証フロー

### 1. ログイン（LINE OAuth 2.1）

1. FE（LIFF App）がユーザーを LINE 認可URLにリダイレクト
2. ユーザーが LINE で認証・認可
3. LINE が `GET /auth/callback?code=xxx` にリダイレクト
4. Workers が認可コードで LINE API にトークン発行リクエスト
5. 取得した `id_token` を LINE API で検証、LINE User ID を取得
6. KV に `user:{lineUserId}` を upsert
7. KV に `session:{uuid}` を作成（TTL 7日）
8. Cookie に `session_id` をセット（HttpOnly, Secure, SameSite=Lax）
9. FE にリダイレクト

### 2. API アクセス

1. FE が Cookie 付きで API リクエスト（`credentials: "include"`）
2. `authMiddleware` が Cookie から `session_id` を取得
3. KV で `session:{session_id}` を検索
4. 有効なセッションであれば `lineUserId` をコンテキストにセット
5. ハンドラーが `lineUserId` でユーザーデータを操作

### 3. ログアウト

1. FE が `POST /auth/logout` を呼び出し
2. KV から `session:{session_id}` を削除
3. Cookie をクリア（maxAge: 0）

---

## KV データ構造

### ユーザーデータ

Key: `user:{lineUserId}`

```json
{
  "lineUserId": "U1234abcd...",
  "createdAt": "2026-03-05T10:00:00.000Z",
  "updatedAt": "2026-03-05T12:00:00.000Z"
}
```

### セッションデータ

Key: `session:{uuid}` (TTL: 7日)

```json
{
  "lineUserId": "U1234abcd...",
  "createdAt": "2026-03-05T10:00:00.000Z",
  "expiresAt": "2026-03-12T10:00:00.000Z"
}
```

---

## FE（LIFF）側の実装例

### ログイン開始

```typescript
const loginUrl = new URL("https://access.line.me/oauth2/v2.1/authorize");
loginUrl.searchParams.set("response_type", "code");
loginUrl.searchParams.set("client_id", LINE_CHANNEL_ID);
loginUrl.searchParams.set("redirect_uri", "https://your-worker.workers.dev/auth/callback");
loginUrl.searchParams.set("scope", "profile openid");

// state: CSRF対策
const state = crypto.randomUUID();
sessionStorage.setItem("oauth_state", state);
loginUrl.searchParams.set("state", state);

window.location.href = loginUrl.toString();
```

### API 呼び出し（ログイン後）

```typescript
const res = await fetch("https://your-worker.workers.dev/api/me", {
  credentials: "include",
});
const userData = await res.json();
```

---

## 注意事項

- **KV の結果整合性**: 書き込み後すぐに全エッジで反映されるわけではない（通常60秒以内）
- **スケール時の移行**: データ量が増えた場合、KV の key 設計見直しか D1/Turso への移行を検討

## リファレンス

- [LINE Login v2.1 API](https://developers.line.biz/ja/reference/line-login/)
- [Cloudflare Workers KV](https://developers.cloudflare.com/kv/)
- [Hono - Web Framework](https://hono.dev/)
