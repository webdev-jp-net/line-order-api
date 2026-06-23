# 技術構成（バックエンド）

## 採用技術

- フロントエンド: Vite / React / LIFF SDK
- バックエンド: Cloudflare Workers / Hono / TypeScript
- データストア: Cloudflare Workers KV
- メニュー管理: microCMS
- 通知: LINE MINI Appサービスメッセージ / Slack
- 開発: pnpm / Biome（TS）/ textlint（md）

## 認証

LIFFのID Tokenをサーバで検証し、自前JWTを発行してBearerで認証します。JWTに表示名（name）を載せ、注文作成時に利用します。

## 環境変数 / Bindings

| 変数                        | 区分   | 用途                                     |
| --------------------------- | ------ | ---------------------------------------- |
| `KV`                        | KV     | 注文データ                               |
| `SESSION_SECRET`            | secret | JWT 署名キー                             |
| `LINE_CHANNEL_ID`           | 設定   | ID Token の aud 検証                      |
| `LINE_CHANNEL_SECRET` | secret | チャネルアクセストークンのステートレス発行（サービス通知トークン発行・サービスメッセージ送信に使用） |
| `FRONTEND_URL`              | 設定   | CORS 許可オリジン                        |
| `SLACK_BOT_TOKEN`           | secret | Slack 投稿                               |
| `SLACK_SIGNING_SECRET`      | secret | Slack 署名検証                           |
| `SLACK_CHANNEL_ID`          | 設定   | 新規注文の投稿先チャンネル               |
| `LINE_TEMPLATE_OPEN`    | 設定   | 注文受付通知の API 用テンプレート名      |
| `LINE_TEMPLATE_DONE`        | 設定   | 準備完了通知の API 用テンプレート名      |

設定値も含め、本番は `wrangler secret put`、ローカルは `wrangler.dev.toml` の `[vars]` で設定します。

## 非機能要件・制約

- 想定注文数: 同時数十件 / 1日数百件程度
- 強整合トランザクションは行いません（KVの結果整合性。状態更新はlast-write-wins）
- 在庫管理・複雑検索は行いません
- 注文一覧・履歴はキーの前方一致で取得します
