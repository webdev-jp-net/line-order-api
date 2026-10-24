# LINE ミニアプリ注文システム

LINEミニアプリを入口に、注文受付から「準備完了」の通知までを行う注文システムです。
ユーザーはミニアプリで注文し、運営はSlackで通知を受けてボタンで状態を更新します。状態に応じてユーザーへLINEサービスメッセージを送ります。支払いはメニュー受け渡し時に対面で行います。

## システム構成

```
[ユーザー]
LINE ミニアプリ (LIFF + React)
   │ HTTPS
   ▼
[API サーバ] Cloudflare Workers + Hono
   ├─ Cloudflare KV（注文データ）
   ├─ LINE Service Message API（サービス通知トークン発行 / 送信）
   └─ Slack（新規注文通知 / ボタン操作受け）

[メニュー] microCMS（FE がビルド時に取得）
[運営] Slack チャンネル
```

## 機能要件

### ユーザー向け

- メニュー一覧表示（microCMSをビルド時に取得）
- 数量入力・カート・注文確認・注文送信
- 注文履歴表示
- 注文受付・準備完了の通知受信

### 運営向け

- 新規注文通知（Slack）
- 注文内容確認
- 注文状態の更新（Slackボタン）

## ドキュメント構成

- [仕様](spec/index.md) - バックエンド・ユーザーアプリの仕様索引
- [用語集](operation/dictionary.md) - 用語の正本
- [UI 表記規約](operation/naming-ui-ux.md) - UI文言・仕様書・コミットメッセージを含む日本語テキストの表記
- [コンポーネント生成ガイド](operation/generate-component.md) - ユーザーアプリのscaffdogによる雛形生成
- 外部サービスの設定・デプロイ手順
  - [Cloudflare デプロイ設定](operation/cloudflare.md) - KV・環境変数・デプロイ・ローカル開発
  - [LINEミニアプリ設定](operation/line-miniapp.md) - チャネル・LIFFアプリ・チャネル整合
  - [Slack アプリ設定](operation/slack-api.md) - 権限・投稿先チャンネル・署名シークレット・ボタン操作
