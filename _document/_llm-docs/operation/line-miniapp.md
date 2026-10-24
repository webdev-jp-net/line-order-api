# LINEミニアプリ設定

## 概要

注文アプリの認証（LIFFログインとIDトークン検証）に使うLINEの設定手順です。設定値はline-order-api（バックエンド）とフロントエンドの環境変数に対応します。

## ミニアプリチャネル

- LINE Developersコンソールで、プロバイダー配下に「LINE MINI App」を選んでLINEミニアプリチャネルを作成します。
- Channel basic settingsタブの **Channel ID** と **Channel secret** を控えます。
  - Channel ID → バックエンドの `LINE_CHANNEL_ID`
  - Channel secret → バックエンドの `LINE_CHANNEL_SECRET`

## LIFF アプリ

- ミニアプリチャネルには、内部チャネル（開発用・審査用・本番用）ごとにLIFFアプリが1つ用意され、LIFF IDも内部チャネルごとに異なります。
- Web app settingsタブで、内部チャネルごとに **Endpoint URL** を設定します。本番用には本番フロントのURL（`wrangler.toml` の `FRONTEND_URL` と同じ値）を設定します。ローカル検証用のURLのままにしないこと。
- 内部チャネルごとの **LIFF ID**（`{数字}-{8文字}` 形式）を控えます。
  - LIFF ID → フロントの `VITE_LIFF_ID`（デプロイ先に対応する内部チャネルのLIFF ID。本番は本番用）

## チャネル整合

IDトークン検証で必須の前提です。次の3つが**同じミニアプリチャネル**に属している必要があります。

- バックエンド `LINE_CHANNEL_ID`
- バックエンド `LINE_CHANNEL_SECRET`
- フロント `VITE_LIFF_ID`（のLIFFが属するチャネル）

ズレているとLINEの検証API（`/oauth2/v2.1/verify`）が `400 Invalid IdToken Audience` を返し、`/user-token` は401（再ログイン要求）を返します。400はWorkerのログ（`wrangler tail`）で確認できます。IDトークンの `aud` は発行元チャネルのChannel IDで、バックエンドの `LINE_CHANNEL_ID` と一致しなければなりません。

## 環境変数の対応

| 設定値         | 環境変数              | 置き場所                                     |
| -------------- | --------------------- | -------------------------------------------- |
| Channel ID     | `LINE_CHANNEL_ID`     | バックエンド `wrangler.toml` の `[vars]`     |
| Channel secret | `LINE_CHANNEL_SECRET` | バックエンド secret（`wrangler secret put`） |
| LIFF ID        | `VITE_LIFF_ID`        | フロント（Vercel の環境変数）                |

バックエンドの置き場所の詳細は [cloudflare.md](./cloudflare.md) を参照します。

## リファレンス

- [LINEミニアプリ向けLINE Developersコンソールガイド](https://developers.line.biz/ja/docs/line-mini-app/discover/console-guide/)
- [LINEミニアプリのユーザーに表示される設定](https://developers.line.biz/ja/docs/line-mini-app/develop/configure-console/)
- [LINEログイン APIリファレンス（IDトークンを検証する）](https://developers.line.biz/ja/reference/line-login/#verify-id-token)
- [Cloudflare Workers Real-time logs](https://developers.cloudflare.com/workers/observability/logs/real-time-logs/)
