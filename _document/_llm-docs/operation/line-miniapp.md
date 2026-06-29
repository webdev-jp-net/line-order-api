# LINEミニアプリ設定

## 概要

注文アプリの認証（LIFFログインとIDトークン検証）に使うLINEの設定手順です。設定値はline-order-api（バックエンド）とフロントエンドの環境変数に対応します。

## ミニアプリチャネル

- LINE Developersコンソールで、プロバイダー配下に「LINE MINI App」を選んでLINEミニアプリチャネルを作成します。
- Basic settingsの **Channel ID** と **Channel secret** を控えます。
  - Channel ID → バックエンドの `LINE_CHANNEL_ID`
  - Channel secret → バックエンドの `LINE_CHANNEL_SECRET`

## LIFF アプリ

- 同じミニアプリチャネルのLIFFタブでLIFFアプリを追加します。
- **Endpoint URL** に本番フロントのURLを設定します（例: `https://line-order-app-pi.vercel.app`）。ローカル検証用のURLのままにしないこと。
- 発行された **LIFF ID**（`{数字}-{8文字}` 形式）を控えます。
  - LIFF ID → フロントの `VITE_LIFF_ID`

## チャネル整合

IDトークン検証で必須の前提です。次の3つが**同じミニアプリチャネル**に属している必要があります。

- バックエンド `LINE_CHANNEL_ID`
- バックエンド `LINE_CHANNEL_SECRET`
- フロント `VITE_LIFF_ID`（のLIFFが属するチャネル）

ズレていると `/user-token` が `400 Invalid IdToken Audience` を返し、401（再ログイン要求）になります。IDトークンの `aud` は発行元チャネルのChannel IDで、バックエンドの `LINE_CHANNEL_ID` と一致しなければなりません。

## 環境変数の対応

| 設定値         | 環境変数              | 置き場所                                     |
| -------------- | --------------------- | -------------------------------------------- |
| Channel ID     | `LINE_CHANNEL_ID`     | バックエンド `wrangler.toml` の `[vars]`     |
| Channel secret | `LINE_CHANNEL_SECRET` | バックエンド secret（`wrangler secret put`） |
| LIFF ID        | `VITE_LIFF_ID`        | フロント（Vercel の環境変数）                |

バックエンドの置き場所の詳細は [cloudflare.md](./cloudflare.md) を参照します。
