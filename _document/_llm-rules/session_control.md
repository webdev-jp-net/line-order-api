---
description: Session Control Rules
alwaysApply: true
---

# Session Control Rules

## 🎉 Session Initialization Confirmed

セッション制御を開始します。

## MANDATORY PROCESS

**品質優先の原則**: 急ぐ必要はありません。関連する仕様書のすべての記載内容を読み飛ばさずに確認してから開始してください。

0. **CHECK** current branch: `git status && git branch --show-current`
   - mainおよびdevelopブランチの場合: github_integration.mdを先に読み込み、featureブランチ作成後に続行
1. **READ** this file completely (このファイルを完全に読み込む）
2. **LOAD CORE PRINCIPLES** - 基本原則を最初に確認
   - `_llm-rules/core_rules.md` - 不明点確認・承認取得の原則
   - `_llm-rules/implementation_principles.md` - 実装の基本原則
3. **LOAD PROJECT REQUIREMENTS** - プロジェクト要件定義（このファイルを完全に読み込む）
   - `_llm-docs/project.md` - プロジェクト全体の要件定義
   - 全タスクで必須確認（技術基盤、サイト構成、ドキュメント構成を理解）
4. **ANALYZE** the user's request and task context (ユーザーのリクエストとタスクの文脈を分析）
5. **SELECT** appropriate specialized rule(s) (適切な専門ルールを選択）
6. **LOAD** selected specialized rule(s) (選択した専門ルールを読み込み）
7. **START** task execution following core_rules.md process (core_rules.mdのプロセスにしたがって実行開始）

---

## 🔍 タスク分析フレームワーク

### タスクタイプの特定

以下の質問に答えて、タスクの性質を特定してください：

**主要な技術スタック:**

- Documentation - ドキュメント作成
- Configuration/Setup - 設定・セットアップ
- development - 開発

**主要なアクションタイプ:**

- New implementation - 新規実装
- Bug fix/debugging - バグ修正・デバッグ
- Refactoring/optimization - リファクタリング・最適化
- Integration work - 統合作業
- Code review/analysis - コードレビュー・分析
- Planning/architecture - 計画・アーキテクチャ

**GitHub Integration Required:**

- Yes: Repository operations, PR creation, issue management - リポジトリ操作、PR作成、issue管理
- No: Local development only - ローカル開発のみ

---

## 🎯 ルール選択ロジック

### GitHub実行・運用作業

**conditions:**

- 日常的なIssue作成・管理
- PR作成・レビュー・マージ
- GitHub CLI（`gh`コマンド）の使用
- コミット・PRとIssueの連携運用
- ブランチ命名とリポジトリ操作
- GitHub Actions/Workflows

**読み込むルール:**

- `_llm-rules/core_rules.md`（必須・確認済み）
- `_llm-rules/implementation_principles.md`（コード関連の場合・確認済み）
- `_llm-rules/github_integration.md`（メイン）

**PR作成時の推奨フロー:**

- ドキュメント反映の確認: 実装に伴う仕様書・設計書の更新確認
  - 未反映の場合: **PR作成前に必ずドキュメントを更新**
- PR作成: `gh pr create`（ドキュメント更新の完了を確認後）

### タスク戦略・分解作業

**conditions:**

- 要件からのタスク分解
- プロジェクト開始時のタスク抽出
- 新スプリント開始時のタスク計画
- 構成図ベースのタスク設計
- 3段階ワークフロー（設計→実装→検証）でのタスク分解
- アジャイル×ウォーターフォールハイブリッドアプローチでの計画策定

**読み込むルール:**

- `_llm-rules/core_rules.md`（必須・確認済み）
- `_llm-rules/github_integration.md`（GitHub連携前提）

### 開発

**conditions:**

- フロントエンド実装
- コンポーネント開発
- スタイリング作業

**読み込むルール:**

- `_llm-rules/core_rules.md`（必須・確認済み）
- `_llm-rules/implementation_principles.md`（必須・確認済み）
- `_llm-rules/github_integration.md`（リポジトリ作業が含まれる場合）

### ドキュメント・計画作業

**conditions:**

- ドキュメント作成
- アーキテクチャ計画
- 要件分析
- プロジェクトセットアップ

**読み込むルール:**

- `_llm-rules/core_rules.md`（必須・確認済み）

---

## ⚡ クイックリファレンスガイド

### よくあるタスクパターン

```markdown
- **プロジェクト開始時のタスク分解**
  → github_integration.md + core_rules.md

- **新スプリントのタスク計画**
  → github_integration.md + core_rules.md

- **要件からのタスク抽出**
  → github_integration.md + core_rules.md

- **Issue作成作業**
  → github_integration.md + core_rules.md

- **Issue着手前の必須確認**
  → github_integration.md + core_rules.md
  → 必須実行: `git status` + `git branch --show-current`
  → developブランチの場合: 新規ブランチ作成
  → 作業ブランチの場合: 継続使用を確認

- **PR作成作業**
  → github_integration.md + core_rules.md
  → ドキュメント反映（仕様書・設計書の更新）
  → 注意: ドキュメント更新の完了を確認後にPR作成

- **ページコンポーネント生成（scaffdog使用）**
  → ページコンポーネント生成カテゴリのルールを適用
  → 詳細: `_llm-docs/operation/generate-component.md`参照

- **要件定義書作成（詳細設計からの抽出）**
  → core_rules.md
```

---

## 🚀 Next Action

タスク分析とルール選択完了後:

**PROCEED TO**: `_llm-rules/core_rules.md`

**REMEMBER**:

- 選択した専門ルールを最初に読み込み
- 実行開始前にALWAYS core_rules.mdを読み込み
- 一貫した品質のためにcore_rules.mdのプロセスに従う
