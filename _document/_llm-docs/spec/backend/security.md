# セキュリティ対策（バックエンド）

注文受付APIで実施するセキュリティ対策です。

## セキュリティチェックリスト

| チェック項目                | 対応箇所                                         |
| --------------------------- | ------------------------------------------------ |
| 通信は HTTPS                | Cloudflare Workers は HTTPS 強制                 |
| LINE ID Token の検証        | `src/util/lineApi.ts` の `verifyIdToken`         |
| aud (channel ID) の一致確認 | `verifyIdToken` 内で二重チェック                 |
| JWT の署名・検証            | `src/util/jwt.ts`（HMAC-SHA256）                 |
| JWT の有効期限              | 1時間（exp クレーム）                            |
| API 認証                    | `Authorization: Bearer` ヘッダーで JWT を検証    |
| CORS 制限                   | `FRONTEND_URL` と一致するオリジンのみ許可        |
| Slack リクエストの署名検証  | `src/util/slackApi.ts`（`SLACK_SIGNING_SECRET`） |
| シークレットの秘匿          | `wrangler secret` で管理、サーバー側のみ使用     |
| リクエストバリデーション    | `POST /orders` で注文内容を検証                  |

## 各対策の詳細

### 1. HTTPS 通信の強制

Cloudflare WorkersはデフォルトでHTTPSのみ受け付けるため、通信経路上でのトークン漏洩リスクを軽減しています。

### 2. LINE ID Token の検証

LIFF SDKから取得したID TokenをLINEの検証エンドポイント (`POST /oauth2/v2.1/verify`) に送信し、トークンの正当性を確認します。

`src/util/lineApi.ts` の `verifyIdToken` では以下を検証しています:

- LINEサーバーによるトークン署名・有効期限の検証
- `aud`（audience）が自分のChannel IDと一致するかの二重チェック

### 3. JWT (Bearer Token) による認証

`/user-token` で発行したJWTを以降のAPI呼び出しで使用します。

| 項目         | 値                               |
| ------------ | -------------------------------- |
| アルゴリズム | HMAC-SHA256                      |
| 署名キー     | `SESSION_SECRET`（シークレット） |
| 有効期限     | 1 時間                           |
| ペイロード   | `{ lineUserId, name, iat, exp }` |

JWTはステートレスなため、KVへのセッション問い合わせが不要で、レイテンシが低くなります。

### 4. CORS によるオリジン制限

`src/index.ts` でCORSを設定し、`FRONTEND_URL` と一致するオリジンからのリクエストのみ許可しています。`Authorization` および `line-id-token` カスタムヘッダーも明示的に許可しています。

### 5. Slack リクエストの署名検証

`POST /slack/interactions` はSlackからの操作を受けます。`SLACK_SIGNING_SECRET` を使い、`X-Slack-Signature` と `X-Slack-Request-Timestamp` を検証して、正規のSlackからのリクエストであることを確認します。

### 6. リクエストバリデーション

`POST /orders` では注文内容（`orderList` の `productId`・`qty`）を検証します。不正な値がある場合は400 Bad Requestと `errorParams` で不正フィールド名を返します。

> 決済はオンラインで行わず、メニュー受け渡し時に対面で行うため、本 API は決済情報を扱いません。

## 環境変数の管理

### シークレット（`wrangler secret put` で設定）

| 変数名                      | 説明                                           |
| --------------------------- | ---------------------------------------------- |
| `SESSION_SECRET`            | JWT 署名キー                                   |
| `LINE_CHANNEL_SECRET` | チャネルアクセストークンのステートレス発行に使用（サービス通知トークン発行・サービスメッセージ送信） |
| `SLACK_BOT_TOKEN`           | Slack への通知投稿に使用                       |
| `SLACK_SIGNING_SECRET`      | Slack リクエストの署名検証に使用               |

### デプロイ設定（`wrangler.toml` に置かない値）

以下の識別子は `wrangler.toml` に置かず、本番は `wrangler secret put`、ローカルは `wrangler.dev.toml` の `[vars]` で設定します。

| 変数名                   | 説明                                                      |
| ------------------------ | --------------------------------------------------------- |
| `LINE_CHANNEL_ID`        | LINE チャネル ID（ID Token の aud 検証）                  |
| `FRONTEND_URL`           | LIFF アプリの URL（CORS 許可対象）                        |
| `SLACK_CHANNEL_ID`       | 新規注文を投稿する Slack チャンネル ID                    |
| `LINE_TEMPLATE_OPEN` | 注文受付通知の「API用テンプレート名」（コンソール登録値） |
| `LINE_TEMPLATE_DONE`     | 準備完了通知の「API用テンプレート名」（コンソール登録値） |

## リファレンス

- [LINE Login セキュリティチェックリスト](https://developers.line.biz/ja/docs/line-login/security-checklist/)
- [サービスメッセージを送信する](https://developers.line.biz/ja/docs/line-mini-app/develop/service-messages/)
- [Slack | Verifying requests from Slack](https://api.slack.com/authentication/verifying-requests-from-slack)
- [Cloudflare Workers Secrets](https://developers.cloudflare.com/workers/configuration/secrets/)
- [Hono JWT Middleware](https://hono.dev/docs/helpers/jwt)
