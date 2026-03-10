# 開発コマンド

## wranglerコマンド

よく使うものをピックアップ。全コマンドはリファレンスで。

リファレンス: [Wrangler Commands](https://developers.cloudflare.com/workers/wrangler/commands/)

### デプロイ

```bash
wrangler deploy --config wrangler.toml
```

### デプロイ環境の監視

```bash
wrangler tail
```

### 環境変数（シークレット）の登録・上書き

```bash
wrangler secret put LINE_CHANNEL_SECRET
wrangler secret put SESSION_SECRET
```

### KV ネームスペースの作成

```bash
# 本番用
wrangler kv namespace create "KV"

# プレビュー用（ローカル開発）
wrangler kv namespace create "KV" --preview
```

### ローカルのモックアップサーバ起動

```bash
wrangler dev --config wrangler.dev.toml
```

---

## この開発環境のコマンド

### Cloudflare Workersの開発サーバー起動

```bash
npm run dev
```

### ビルド

```bash
# 監視なし
npm run build

# 監視あり
npm run build:watch
```

### 書式チェック

```bash
npm run lint
```

### 本番デプロイ

```bash
npm run deploy
```
