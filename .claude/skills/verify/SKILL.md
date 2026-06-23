---
name: verify
description: Claude Previewを使ってサイトのUI確認を行うスキル。フロントエンドの修正後に「画面確認して」「UIを確認」「表示を確認」などのリクエストで使用。サブエージェントとしても利用可能。
---

# UI確認スキル

## 概要

Claude Previewを使用してNext.jsサイトのUI確認を行う。フロントエンド修正後の動作確認やレイアウト確認に使用する。

## 入力情報

ユーザーまたは親エージェントから以下の情報を受け取る:

- **対象ページ**（任意）: 確認したいページのURL、パス、またはページ名
  - 例: `トップページ`
  - 未指定の場合はトップページ (`http://localhost:3000`) を確認
- **確認項目**（任意）: とくに確認したい内容
  - 例: `ヘッダーの表示`, `レイアウトの崩れ`

## ワークフロー

### Step 1: 開発サーバーの起動

1. `.claude/launch.json` に開発サーバーの設定があることを確認
2. `mcp__Claude_Preview__preview_start` で開発サーバーを起動
3. サーバーが起動しない場合は `mcp__Claude_Preview__preview_logs` でエラーを確認

### Step 2: 対象ページへの移動

入力された対象ページに基づいて:

**URLまたはパスが指定された場合**:

- `mcp__Claude_Preview__preview_eval` で `window.location.href = '{URL}'` を実行してページ移動
- パスのみの場合は `http://localhost:3000` を先頭に付与

### Step 3: UI確認

1. `mcp__Claude_Preview__preview_snapshot` でページ構造（アクセシビリティツリー）を確認
2. 確認項目が指定されていればその内容を重点的に確認
3. `mcp__Claude_Preview__preview_screenshot` でスクリーンショットを取得して外観を確認
4. 色やフォントサイズなどの正確な値を確認する場合は `mcp__Claude_Preview__preview_inspect` を使用
5. インタラクション確認が必要な場合:
   - `mcp__Claude_Preview__preview_click` でクリック操作
   - `mcp__Claude_Preview__preview_fill` で入力操作

### Step 4: レスポンシブ確認

必要に応じてビューポートを切り替えて確認:

- `mcp__Claude_Preview__preview_resize` でビューポートサイズを変更
  - プリセット: `mobile`（375x812）、`tablet`（768x1024）、`desktop`（1280x800）
  - このプロジェクトはスマホ特化のため、`mobile` での確認を優先

### Step 5: 結果報告

以下の形式で確認結果を報告:

```markdown
## UI確認結果

### 対象ページ

{確認したページのURL}

### 確認結果

- [ ] ページが正常に表示される
- [ ] レイアウトが期待通り
- [ ] インタラクションが正常に動作

### 詳細

{確認した内容の詳細}

### 問題点（あれば）

{発見した問題の詳細}
```

## 重要な注意点

- 開発サーバーは `mcp__Claude_Preview__preview_start` で起動する（Bashで直接起動しない）
- コンソールエラーがある場合は `mcp__Claude_Preview__preview_console_logs` で確認
- サーバーログは `mcp__Claude_Preview__preview_logs` で確認
- ネットワークリクエストの確認は `mcp__Claude_Preview__preview_network` を使用
- ログイン不要（publicサイト）
