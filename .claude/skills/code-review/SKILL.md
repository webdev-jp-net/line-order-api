---
name: code-review
description: |
  Codex CLIを使用してコードをレビューするユーティリティ。
  他のスキルから呼び出して使う。ユーザーから直接呼び出すことも可。
  $ARGUMENTSにレビュー対象（ファイルパス、内容の説明など）を渡す。
disable-model-invocation: true
argument-hint: [review-target]
---

# コードレビューユーティリティ

Codex CLIを使用してコードをレビューし、結果を返す。

## 実行コマンド

```bash
codex exec --full-auto --sandbox read-only --cd <project_directory> "<request>"
```

## プロンプトのルール

**重要**: codexに渡すリクエストには、以下の指示を必ず含めること：

> 「確認や質問は不要です。具体的な指摘・修正案・コード例まで自主的に出力してください。」

## ワークフロー

### Step 1: レビュー対象の特定

`$ARGUMENTS`からレビュー対象を特定する：

- ファイルパスや内容の説明が指定されている場合 → それを対象にする
- 指定なしの場合 → `git diff HEAD`の差分を対象にする

### Step 2: Codex CLIでレビュー実行

```bash
codex exec --full-auto --sandbox read-only --cd <project_directory> \
  "まず _llm-rules/implementation_principles.md を読み込み、そこに定義された実装原則を理解してください。
その原則を基準として、以下を対象にレビューを行ってください。

対象: {$ARGUMENTS の内容 または git diff の内容}

確認や質問は不要です。具体的な指摘・修正案・コード例まで自主的に出力してください。"
```

### Step 3: 結果を返す

Codexの出力を呼び出し元（ユーザーまたは他のスキル）に返す。
