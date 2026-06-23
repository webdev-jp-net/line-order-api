# 🤖 Claude Code セッション制御

## 初回セッション時のみ

1. 最新仕様をline-order-documentから同期（`_document/` が無ければ初回のみ `git subtree add --prefix=_document git@github.com:webdev-jp-net/line-order-document.git develop --squash`、以降は `git doc-pull`）
2. Serena初期化 `/mcp__serena__check_onboarding_performed`
3. 必要ならオンボーディング実行

## 必須

`_document/_llm-rules/session_control.md` を読み込み、従うこと

## パス解決ルール

- すべての `_llm-*` の参照は `_document/_llm-*` として解釈する
- 例: `_llm-memories/learned.md` → `_document/_llm-memories/learned.md`

## ルール読み込み手順

- Readツールを使用して`_document/_llm-rules/`ディレクトリから直接ルールファイルを読み込む
- 完全なルールチェーンに従う: CLAUDE.md → session_control → 専門ルール → core_rules
- session_control.mdを確認せずにコーディングタスクを進めてはいけない
- ファイル構造とプロジェクトの文脈に特別な注意を払う

## タスク実行ワークフロー

セッション中の各タスクについて:

1. タスクの種類と文脈を分析
2. 適切な専門ルールを選択
3. 最後に必ずcore_rules.mdを読み込み
4. ルールにしたがって実行開始

## 用語統一システム

- 用語の正式な情報源として`_llm-docs/operation/dictionary.md`を使用

## 厳守事項

- 仕様書の全文を読み、書かれた通りに実装（解釈・要約禁止）
- 仕様の空白を一般論で補完しない
- 仕様に不明点・空白がある場合は必ずユーザに質問
- 既存コードのパターンを最優先（ベストプラクティスより優先）
- コミットは明示的な承認後のみ

## 緊急時のフォールバック

`_llm-rules/session_control.md`が利用できない場合は、`_llm-rules/core_rules.md`を直接参照

---

**⚠️ このファイルはClaude Codeのエントリーポイント。すべてのロジックは\_llm-rules/ディレクトリにあります。**
