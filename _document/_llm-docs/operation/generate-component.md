# コンポーネント生成ガイド

## 概要

このドキュメントは、ユーザーアプリ（line-order-app）において、scaffdogテンプレートを使用してコンポーネントなどの雛形を生成する手順を説明します。

**適用範囲**: ユーザーアプリ（React SPA + Vite）のフロントエンド開発のみ

## 利用可能なテンプレート

テンプレートの正本はユーザーアプリの `.scaffdog/` です。生成されるファイルは各テンプレートを参照します。

| テンプレート      | 生成先（root）   | 用途                    |
| ----------------- | ---------------- | ----------------------- |
| `page-component`  | `src/pages`      | ページコンポーネント    |
| `parts-component` | `src/components` | 再利用可能なUI部品      |
| `hooks`           | `src/hooks`      | カスタムフック          |
| `store-slice`     | `src/store`      | Redux Toolkitのスライス |

**注意**: 生成後のカスタマイズ（ロジック実装、API連携、スタイル調整など）は別タスクとして扱います。

## 生成手順

プロジェクトルートで `pnpm scaffold`（`scaffdog generate`）を実行します。`--output` はテンプレートの生成先（root）からの相対パスで、省略すると対話で選択します。

```bash
pnpm scaffold <テンプレート> --output "<生成先からの相対パス>" --answer "name:<名前>"

# 例: src/pages 直下にページを生成
pnpm scaffold page-component --output "." --answer "name:<名前>"
```

ページは生成後、`src/routes/routes.tsx` にルートを追加して登録します。

### 注意事項

- **重複生成の防止**: 同名のファイルが存在すると、上書きするかどうかの確認が表示されます
- **作業ディレクトリ**: プロジェクトルートから実行すること

## リファレンス

- [scaffdog CLI](https://scaff.dog/docs/cli)
