# Slack アプリ設定

## 概要

注文の運営通知（新規注文の投稿、状態更新ボタン）に使うSlackアプリの設定手順です。設定値はline-order-apiの環境変数に対応します。

## アプリの作成

- <https://api.slack.com/apps/> →「Create New App」→「From scratch」→ 名前とワークスペースを指定して作成します。

## 権限（OAuth & Permissions）

- 「Bot Token Scopes」に `chat:write` を追加します（`chat:write.public` は追加しません）。
- 「Install to Workspace」でインストールし、「Bot User OAuth Token」（`xoxb-` で始まる）を控えます。

## 投稿先チャンネル

- 運営チャンネル（プライベート推奨）を用意します。
- そのチャンネルで `/invite @アプリ名` を実行し、Botを招待します。Botは招待されたチャンネルにのみ投稿できます。
- チャンネル詳細の最下部にある「チャンネルID」（`C` で始まる）を控えます。

## 署名シークレット（Basic Information）

- 「App Credentials」の「Signing Secret」を控えます。状態更新ボタン（`POST /slack/interactions`）の署名検証に使います。

## ボタン操作（Interactivity & Shortcuts）

Slackのボタン（準備完了・受渡完了）の押下をAPIが受け取るための設定です。

1. 左メニューの「Interactivity & Shortcuts」を開き、トグルをONにします。
2. 「Request URL」に「APIの公開URL ＋ `/slack/interactions`」を入力して保存します。

Request URLに入れる値:

- 本番: `https://<worker>.workers.dev/slack/interactions`
- ローカル検証: localhostはSlackから届かないため、トンネル（ngrok等）で発行されたHTTPS URLの末尾に `/slack/interactions` を付けます（例: `https://xxxx.ngrok-free.app/slack/interactions`）。

## 環境変数の対応

| 設定値                          | 環境変数               |
| ------------------------------- | ---------------------- |
| Bot User OAuth Token（`xoxb-`） | `SLACK_BOT_TOKEN`      |
| チャンネルID（`C`）             | `SLACK_CHANNEL_ID`     |
| Signing Secret                  | `SLACK_SIGNING_SECRET` |

本番は `wrangler secret put`、ローカルは `wrangler.dev.toml` に設定します（値は公開リポジトリに含めません）。
