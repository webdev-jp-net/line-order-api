# メニュー（microCMS / Jamstack）

メニューはmicroCMSで管理し、ビルド時に取得するJamstack方式です。バックエンドはメニューを保持しません（[../backend/index.md](../backend/index.md)）。

## 方針

- メニュー（品目・名称・画像など）はmicroCMSで管理します。
- ランタイムではmicroCMSへ直接通信しません。**ビルド時に一括取得**して静的JSONとして持ち、配信します（APIデータ転送量の節約）。
- 注文時はフロントエンドが各明細にメニュー名（`name`）を含めて `POST /orders` へ送ります。Slack通知・注文履歴の表示に使います。

## データソース

- エンドポイント: `GET https://{MICROCMS_SERVICE}.microcms.io/api/v1/menu`
- ヘッダー: `X-MICROCMS-API-KEY: {MICROCMS_SERVICE_KEY}`
- レスポンスはmicroCMSのリスト形式（`contents` / `totalCount` / `offset` / `limit`）です。

### メニュー項目（`contents[]`）の主なフィールド

| フィールド    | 型     | 説明                                   |
| ------------- | ------ | -------------------------------------- |
| `id`          | string | メニューID（注文の `productId` に使う） |
| `name`        | string | メニュー名                             |
| `price`       | number | 価格（円）                             |
| `category`    | object | カテゴリ（`id` / `name`）              |
| `mainImage`   | object | 画像（`url` / `width` / `height`）     |
| `description` | string | 説明（リッチエディタ由来の HTML）      |

## データ取得の仕組み

- 取り込みは `prebuild`（`src/data/generator/`）で行います。`pnpm build` の直前に自動実行されます（npm/pnpmのライフサイクル）。手動実行は `pnpm prebuild`。3段構成です。
  - `_getApiData.sh`: microCMSから生データを `src/data/_raw/menu.json` に取得。
  - `_generateCustomJson.js`: 生データを整形して `src/data/menu.json`（メニュー項目の配列）を生成し、画像取得用 `src/data/getMedia.sh` を書き出します。microCMSのメタデータ（`createdAt` 等）は除き、`mainImage.url` を同梱パス（`/menu/{id}.webp`）へ差し替えます。
  - `getMedia.sh`: 画像を `public/menu/{id}.webp` にダウンロード。WebP変換と最大幅の縮小はmicroCMSの画像変換（`?fm=webp&w=...`）で行います。
- ランタイムは同梱したJSONと画像だけを使います（microCMSへの直接通信は発生しません）。
- `src/data/menu.json` と `public/menu/` はコミットし、`src/data/_raw/` と `src/data/getMedia.sh` は中間生成物として無視します。
- デプロイ（Vercel）はビルドコマンド `pnpm build` が `prebuild` を自動実行するため、最新メニューが反映されます。`prebuild` はmicroCMSの鍵を使うため、Vercelのプロジェクト環境変数に設定します。CI（build-check）はprebuildを回さずコミット済みデータでビルドするため、鍵は不要です。
- コンテンツ更新時はmicroCMSのWebhookで再ビルド・再デプロイをトリガーします。

## 環境変数

- microCMSのサービスIDとAPIキーは環境変数で管理し、開発・本番で切り替えます。
  - `MICROCMS_SERVICE`: サービスID
  - `MICROCMS_SERVICE_KEY`: APIキー
- APIキーには `VITE` プレフィックスを付けません（フロントエンドへ露出させず、ビルド処理でのみ使用）。
