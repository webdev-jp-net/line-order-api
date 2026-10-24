# Cloudflare デプロイ設定

## 概要

line-order-apiをCloudflare Workersにデプロイする手順です。KVネームスペースの作成、環境変数の設定、デプロイまでを扱います。

設定ファイルは2つです。

- `wrangler.toml`: 本番用。KV idと非秘匿の設定値を記載し、リポジトリで管理します（KV namespace IDは公開されている値で、認証情報ではありません）
- `wrangler.dev.toml`: ローカル開発用。シークレットも置くため .gitignore済みで、`wrangler.dev.toml.example` から作成します

## ログイン

```bash
pnpm wrangler login
```

ブラウザでCloudflareアカウントを認可します。どのアカウントに繋がっているかは `pnpm wrangler whoami` で確認できます（メールアドレスとAccount IDが表示されます）。

## KV ネームスペースの作成

注文データの保存にWorkers KVを使います。`KV` バインディング用のネームスペースを作成します。

```bash
# 本番用（出力に id が返る）
pnpm wrangler kv namespace create KV

# ローカル dev のオーバーレイ用
pnpm wrangler kv namespace create KV --preview
```

出力されたIDをtomlに転記します。

- 本番用 `id` → `wrangler.toml` の `kv_namespaces` の `id`
- 本番用 `id` ＋ preview用 `preview_id` → `wrangler.dev.toml` の `kv_namespaces`

作成済みネームスペースの一覧は `pnpm wrangler kv namespace list` で確認できます。

`wrangler dev` はローカル（Miniflare）で動くためKVの実体は `.wrangler/state/` 配下のローカルファイルです。`id` / `preview_id` はローカルでは識別子として使われるだけですが、`--remote` で実KVに繋ぐ場合にそのまま使えるよう実IDを入れておきます。

ローカルKVへのデータ投入:

```bash
pnpm wrangler kv key put --binding KV "key" "value" --local --config wrangler.dev.toml --preview
```

`wrangler dev` は `preview_id` のネームスペースを使います。`--config wrangler.dev.toml --preview` を付けないと、`pnpm dev` から見えないネームスペースへ書き込まれます。

## 環境変数の設定

環境変数は秘匿の有無で置き場所を分けます。

### 非秘匿（`wrangler.toml` の `[vars]`）

| 環境変数             | 内容                                                          |
| -------------------- | ------------------------------------------------------------- |
| `FRONTEND_URL`       | フロントエンドの公開 URL。CORS とサービス通知のボタン遷移先   |
| `LINE_CHANNEL_ID`    | LINE ミニアプリチャネルのチャネル ID                         |
| `SLACK_CHANNEL_ID`   | 投稿先 Slack チャンネル ID（`C`）                            |
| `LINE_TEMPLATE_OPEN` | 注文受付の通知テンプレート名（`{name}_{BCP47}`、30文字以内）  |
| `LINE_TEMPLATE_DONE` | 準備完了の通知テンプレート名（`{name}_{BCP47}`、30文字以内）  |

`wrangler.toml` に直接書き、リポジトリで管理します。いずれも認証情報ではありません。

```toml
[vars]
FRONTEND_URL = "https://example.vercel.app"
LINE_CHANNEL_ID = "1234567890"
SLACK_CHANNEL_ID = "C00000000"
LINE_TEMPLATE_OPEN = "order_request_ja"
LINE_TEMPLATE_DONE = "order_comp_ja"
```

### 秘匿（`wrangler secret put`）

| 環境変数               | 内容                                                      |
| ---------------------- | --------------------------------------------------------- |
| `LINE_CHANNEL_SECRET`  | LINE ミニアプリチャネルのチャネルシークレット             |
| `SESSION_SECRET`       | ユーザートークン（JWT）の署名鍵。任意の強いランダム文字列 |
| `SLACK_BOT_TOKEN`      | Slack の Bot User OAuth Token（`xoxb-`）                  |
| `SLACK_SIGNING_SECRET` | Slack の Signing Secret                                   |

平文でファイルに残さないため、暗号化保存されるsecretで登録します。初回は、デプロイでWorkerを作成した後に登録します。

```bash
pnpm wrangler secret put LINE_CHANNEL_SECRET
pnpm wrangler secret put SESSION_SECRET
pnpm wrangler secret put SLACK_BOT_TOKEN
pnpm wrangler secret put SLACK_SIGNING_SECRET
```

登録済みの一覧は `pnpm wrangler secret list` で確認できます。LINE関連の取得元は [line-miniapp.md](./line-miniapp.md)、Slack関連は [slack-api.md](./slack-api.md) を参照します。

## デプロイ

```bash
pnpm run deploy
```

`wrangler deploy --config wrangler.toml` が実行され、`https://line-order-api.<subdomain>.workers.dev` に公開されます。`workers_dev = true` のため `workers.dev` のサブドメインが割り当てられます。

`run` を付けるのは、`pnpm deploy` がワークスペース用のpnpm組み込みコマンドと衝突するためです。

初回は次の順で進めます。

1. `pnpm run deploy`（Workerを新規作成。KVと `[vars]` が反映される）
2. 秘匿4個を `wrangler secret put` で登録（即反映、再デプロイ不要）

## ローカル開発

```bash
pnpm dev
```

`wrangler dev --config wrangler.dev.toml` が `http://localhost:8787` で起動します。ローカルではシークレットも `wrangler.dev.toml` の `[vars]` に置きます（`wrangler dev` は `wrangler secret put` の値を読まないため）。テンプレートは `wrangler.dev.toml.example` を参照します。
