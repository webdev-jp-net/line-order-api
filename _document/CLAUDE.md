# 🤖 Claude Code セッション制御

## 初回セッション時のみ

1. Serena確認: `/mcp__serena__check_onboarding_performed`
2. 必要ならオンボーディング実行

## 必須

`_llm-rules/session_control.md` を読み込む

## ルール読み込み手順

- Readツールを使用して`_llm-rules/`ディレクトリから直接ルールファイルを読み込む
- 完全なルールチェーンに従う: CLAUDE.md → session_control → 専門ルール → core_rules
- session_control.mdを確認せずにタスクを進めてはいけない
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
