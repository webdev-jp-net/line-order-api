# LINE Auth API アーキテクチャ

LIFF + Cloudflare Workers + KV を使用した認証APIのアーキテクチャを解説します。

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
                 │ 1. liff.init() → liff.getIDToken()
                 ↓
[Cloudflare Workers (Hono)]
  │
  ├── GET  /user-token        ← LINE ID Token → JWT 発行
  │     ├→ LINE API: POST /oauth2/v2.1/verify  (id_token → user ID)
  │     ├→ KV: user:{lineUserId} に upsert
  │     └→ JWT (userToken) を返却
  │
  ├── GET  /profile           ← ユーザープロフィール取得
  └── PUT  /profile           ← ユーザープロフィール登録・更新
                 │
                 ↓
          [Cloudflare KV]
            user:{lineUserId}  → UserProfile (JSON)
```

---

## ファイル構成

```
src/
  index.ts                          Hono エントリポイント（CORS + ルーティング統合）
  types.ts                          全型定義（Bindings, LINE API, UserProfile, ErrorResponse）
  routes/
    rootRoute.ts                    GET / (HTML)
    userTokenRoute.ts               GET /user-token
    profileRoute.ts                 GET /profile, PUT /profile
  handler/
    rootHandler.ts                  HTML ステータスページ
    userTokenHandler.ts             LINE ID Token 検証 → JWT 発行
    profile/
      getProfileHandler.ts          プロフィール取得
      putProfileHandler.ts          プロフィール登録・更新
  middleware/
    authMiddleware.ts               Bearer JWT 認証
  util/
    lineApi.ts                      LINE API 通信（verifyIdToken）
    jwt.ts                          JWT 署名・検証
    userStore.ts                    ユーザーデータ CRUD（KV）
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

### 認証

| メソッド | パス | 認証 | 説明 |
|---|---|---|---|
| GET | `/user-token` | `line-id-token` ヘッダー | LINE ID Token を検証し JWT を発行 |

### API（要 Bearer Token）

| メソッド | パス | 説明 |
|---|---|---|
| GET | `/profile` | ユーザープロフィール取得 |
| PUT | `/profile` | ユーザープロフィール登録・更新 |

### その他

| メソッド | パス | 説明 |
|---|---|---|
| GET | `/` | HTML ステータスページ |

---

## 認証フロー

### 1. トークン取得

1. LIFF App が `liff.init()` で初期化
2. `liff.getIDToken()` で LINE ID Token を取得
3. `GET /user-token` に `line-id-token` ヘッダーで ID Token を送信
4. Workers が LINE API (`POST /oauth2/v2.1/verify`) で ID Token を検証
5. LINE User ID を取得し、KV にユーザーを upsert
6. JWT (userToken) を署名して `{ userToken, lineUserId }` を返却
7. FE は `userToken` を保持し、以降の API 呼び出しに使用

### 2. API アクセス

1. FE が `Authorization: Bearer <userToken>` ヘッダー付きで API リクエスト
2. `authMiddleware` が JWT を検証し `lineUserId` を取得
3. ハンドラーが `lineUserId` で KV のユーザーデータを操作

---

## KV データ構造

### ユーザープロフィール

Key: `user:{lineUserId}`

プロフィール未登録時:
```json
{
  "lineUserId": "U1234abcd..."
}
```

プロフィール登録後:
```json
{
  "lineUserId": "U1234abcd...",
  "gender": 2,
  "ageGroup": 2,
  "residence": "26"
}
```

| フィールド | 型 | 説明 |
|---|---|---|
| lineUserId | string | LINE ユーザー ID (`U` + 32桁 hex) |
| gender | number | 性別（0:女性, 1:男性, 2:無回答） |
| ageGroup | number | 年代（0:10代以下 〜 6:70代以上） |
| residence | string | 都道府県コード（01〜47） |

---

## FE（LIFF）側の実装例

### トークン取得

```typescript
import liff from "@line/liff";

await liff.init({ liffId: "YOUR_LIFF_ID" });

if (!liff.isLoggedIn()) {
  liff.login();
}

const idToken = liff.getIDToken();

const res = await fetch("https://line-auth-api.haitani.workers.dev/user-token", {
  headers: { "line-id-token": idToken },
});
const { userToken, lineUserId } = await res.json();
```

### API 呼び出し

```typescript
const res = await fetch("https://line-auth-api.haitani.workers.dev/profile", {
  headers: { Authorization: `Bearer ${userToken}` },
});
const profile = await res.json();
```

### プロフィール登録

```typescript
const res = await fetch("https://line-auth-api.haitani.workers.dev/profile", {
  method: "PUT",
  headers: {
    Authorization: `Bearer ${userToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ gender: 1, ageGroup: 2, residence: "13" }),
});
const updated = await res.json();
```

---

## 注意事項

- **JWT 有効期限**: 1時間。期限切れ時は `/user-token` で再取得が必要
- **KV の結果整合性**: 書き込み後すぐに全エッジで反映されるわけではない（通常60秒以内）
- **スケール時の移行**: データ量が増えた場合、KV の key 設計見直しか D1/Turso への移行を検討

## リファレンス

- [LINE Login v2.1 API](https://developers.line.biz/ja/reference/line-login/)
- [LIFF SDK](https://developers.line.biz/ja/reference/liff/)
- [Cloudflare Workers KV](https://developers.cloudflare.com/kv/)
- [Hono - Web Framework](https://hono.dev/)
