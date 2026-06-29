# Cloudflare デプロイ設定

## 概要

line-order-apiをCloudflare Workersにデプロイする手順です。KVネームスペースの作成、環境変数（シークレット）の設定、デプロイまでを扱います。公開リポジトリには `wrangler.toml` のみを含め、シークレットの値は含めません。

## ログイン

```bash
pnpm wrangler login
```

ブラウザでCloudflareアカウントを認可します。すでにログイン済みかは `pnpm wrangler whoami` で確認できます。

## KV ネームスペースの作成

注文データの保存にWorkers KVを使います。`KV` バインディング用のネームスペースを作成します。

```bash
# 本番用（出力に id が返る）
pnpm wrangler kv namespace create KV

# ローカル dev のオーバーレイ用
pnpm wrangler kv namespace create KV --preview
```

出力されたIDをtomlに転記します。

- 本番用 `id` → `wrangler.toml` の `kv_namespaces` の `id`（`REPLACE_WITH_OWN_KV_NAMESPACE_ID` を置換）
- 本番用 `id` ＋ preview用 `preview_id` → `wrangler.dev.toml` の `kv_namespaces`

`wrangler dev` はローカル（Miniflare）で動くためKVの実体は `.wrangler/state/` 配下のローカルファイルです。`id` / `preview_id` はローカルでは識別子として使われるだけですが、`--remote` で実KVに繋ぐ場合にそのまま使えるよう実IDを入れておきます。

ローカルKVへのデータ投入:

```bash
pnpm wrangler kv key put --binding KV "key" "value" --local
```

## 環境変数（シークレット）の設定

本番の環境変数は `wrangler secret put` で1つずつ登録します（`wrangler.toml` には書きません）。

```bash
pnpm wrangler secret put LINE_CHANNEL_ID
pnpm wrangler secret put LINE_CHANNEL_SECRET
pnpm wrangler secret put SESSION_SECRET
pnpm wrangler secret put FRONTEND_URL
pnpm wrangler secret put SLACK_BOT_TOKEN
pnpm wrangler secret put SLACK_SIGNING_SECRET
pnpm wrangler secret put SLACK_CHANNEL_ID
pnpm wrangler secret put LINE_TEMPLATE_OPEN
pnpm wrangler secret put LINE_TEMPLATE_DONE
```

各値の意味:

| 環境変数               | 内容                                                          |
| ---------------------- | ------------------------------------------------------------- |
| `LINE_CHANNEL_ID`      | LINE ログインチャネルのチャネルID                             |
| `LINE_CHANNEL_SECRET`  | LINE ログインチャネルのチャネルシークレット                   |
| `SESSION_SECRET`       | ユーザートークン（JWT）の署名鍵。任意の強いランダム文字列     |
| `FRONTEND_URL`         | フロントエンドの公開URL。CORS とサービス通知のボタン遷移先    |
| `SLACK_BOT_TOKEN`      | Slack の Bot User OAuth Token（`xoxb-`）                      |
| `SLACK_SIGNING_SECRET` | Slack の Signing Secret                                       |
| `SLACK_CHANNEL_ID`     | 投稿先 Slack チャンネルID（`C`）                              |
| `LINE_TEMPLATE_OPEN`   | 注文受付の通知テンプレート名（`{name}_{BCP47}`、30文字以内）  |
| `LINE_TEMPLATE_DONE`   | 準備完了の通知テンプレート名（`{name}_{BCP47}`、30文字以内）  |

登録済みの一覧は `pnpm wrangler secret list` で確認できます。Slack関連の取得元は [slack-api.md](./slack-api.md) を参照します。

## デプロイ

```bash
pnpm deploy
```

`wrangler deploy --config wrangler.toml` が実行され、`https://line-order-api.<subdomain>.workers.dev` に公開されます。`workers_dev = true` のため `workers.dev` のサブドメインが割り当てられます。

## ローカル開発

```bash
pnpm dev
```

`wrangler dev --config wrangler.dev.toml` が `http://localhost:8787` で起動します。ローカルではシークレットも `wrangler.dev.toml` の `[vars]` に置きます（`wrangler dev` は `wrangler secret put` の値を読まないため）。テンプレートは `wrangler.dev.toml.example` を参照します。
