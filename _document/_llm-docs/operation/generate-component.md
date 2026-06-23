# コンポーネント生成ガイド

## 概要

このドキュメントは、React/TypeScriptプロジェクトにおいて、scaffdogテンプレートを使用してコンポーネントを生成する手順を説明します。

**適用範囲**: React/TypeScriptによるフロントエンド開発のみ

## 利用可能なテンプレート

`.scaffdog`ディレクトリで定義されているテンプレート:

- `page-component.md` - App Router対応ページコンポーネント
- `parts-component.md` - 再利用可能なUI部品

**注意**: 生成後のカスタマイズ（ロジック実装、API連携、スタイル調整など）は別タスクとして扱います。

## 生成されるファイル構造

page-componentテンプレートは以下の構造を生成します：

```
[component-name]/
├── page.tsx                  # サーバーコンポーネント（データ取得・ルーティング）
└── _parts/
    ├── view.tsx             # 'use client' 指定の表示専用コンポーネント
    ├── useComponentName.ts  # ビジネスロジック／フック
    └── page.module.scss     # スタイル（必要最低限）
```

parts-componentテンプレートは以下を生成します：

```
[ComponentName]/
├── index.ts
├── [ComponentName].tsx
└── [ComponentName].module.scss
```

ロジックを分離する必要が出た場合は、生成後に`use[ComponentName].ts`を同階層に追加する（テンプレートには含まれない）。

## 前提条件

- scaffdogがプロジェクトにインストール済み
- 該当するテンプレートファイルが`.scaffdog/`ディレクトリに存在

## ページコンポーネント生成

### 概要

`src/app`配下にページディレクトリ（`page.tsx` + `_parts`）を生成し、サーバーコンポーネントとクライアントコンポーネントの責務を切り分けます。

### 生成手順

#### scaffdogコマンドでの生成

scaffdogコマンドを使用してコンポーネントを生成します。認証の要否に応じてディレクトリを分けて配置します。

```bash
# 認証が必要なページ（例: src/app/(authenticated)配下）
npx scaffdog generate page-component --output "(authenticated)" --answer "name:AccountIndex"

# 認証不要ページ（例: src/app/(unauthenticated)配下）
npx scaffdog generate page-component --output "(unauthenticated)" --answer "name:Login"
```

**重要**:

- `--output`は`src/app`からの相対パスを指定します。グループディレクトリ（例: `(authenticated)`）の命名ルールを維持してください。
- 生成される`page.tsx`はサーバーコンポーネントとしてデータ取得やリダイレクトなどを担当します。表示ロジックや状態管理は`_parts/view.tsx`と`use*.ts`に閉じ込めます。
- テンプレートには装飾を含めないため、スタイルは`_parts/page.module.scss`に必要最低限だけ定義し、追加装飾は別タスクで行います。

### 命名パターン別の生成例

#### 基本パターン

```bash
# 認証ありページの例
npx scaffdog generate page-component --output "(authenticated)" --answer "name:NewsIndex"
npx scaffdog generate page-component --output "(authenticated)" --answer "name:AccountDetail"
```

**命名規則**:

- `{Resource}{Action}` (例: NewsIndex, AccountDetail)。ディレクトリ名は自動的にケバブケース化されます。

### 生成後の確認事項

#### エイリアスの確認

`src/app`配下の`page.tsx`がルーティングエントリになります。共通コンポーネントは`@/components/...`形式で参照し、クライアントコンポーネントは`_parts/view`を通して読み込んでください。

### 注意事項

- **重複生成の防止**: 同名ディレクトリが存在すると`page.tsx`や`_parts`が上書きされるため注意
- **作業ディレクトリ**: プロジェクトルートから実行すること

### トラブルシューティング

#### scaffdogコマンドが見つからない場合

```bash
# scaffdogのインストール確認
pnpm list scaffdog

# 必要に応じてインストール
pnpm add -D scaffdog
```

#### テンプレートが見つからない場合

```bash
# テンプレートの確認
ls -la .scaffdog/
cat .scaffdog/page-component.md
```

#### 生成に失敗する場合

- 作業ディレクトリがプロジェクトルートか確認
- コンポーネント名が正しい形式か確認（命名規則は[dictionary.md](./dictionary.md)を参照）

## パーツコンポーネント生成

### 概要

共通UIコンポーネントをscaffdogテンプレートで生成します。

### 生成手順

```bash
# パーツコンポーネントの生成
npx scaffdog generate parts-component --answer "name:Button"
npx scaffdog generate parts-component --answer "name:Modal"
npx scaffdog generate parts-component --answer "name:Card"
```
