# スタイリング方針（ユーザーアプリ）

フロントエンドのスタイリング実装方針です。用語は [../../operation/dictionary.md](../../operation/dictionary.md) を参照してください。

## 技術

- CSS Modules + SCSS

## 基本方針

- セマンティック志向: 役割・意味を表すクラス名を使います（装飾ベースの命名は避けます）
- ユーティリティファースト禁止: スタイルの羅列より意味的な抽象化を優先します
- BEM命名禁止: CSS Modulesでスコープ分離済みのため不要です
- クラス名はキャメルケース（CSS Modules）
- 重複定義は排除します（DRY）

## レスポンシブ

スマートフォンのポートレートのみ対象とします。タブレット・PC向けレイアウトは考慮しません。

## 装飾のルール

装飾（色・影・ボーダー・アニメーション等）は次の場合のみ実装します。

- 明確な参照実装が指示されている
- 既存コンポーネントの踏襲が要求されている

明示的な指示のない装飾は追加しません。

## SCSS 実装原則

### 単位

remを基準とした相対値を使います。`rem()` でpxをremに変換します。

```scss
@use "style/_variable" as *;
.example {
  margin: rem(16); // 16px → 1rem
  padding: rem(24); // 24px → 1.5rem
}
```

例外: 1pxのborderはpx、割合は % で表現します。

```scss
.example {
  border: 1px solid; // 1px は例外
  width: 100%; // 割合は %
}
```

### カラー

色はCSS Variablesを使います。

```scss
.icon {
  .--valid & {
    color: var(--txt-basic);
  }

  .--invalid & {
    color: var(--txt-alert);
  }
}
```

## レイアウト実装の優先順位

1. Flexbox / Grid（`place-content`・`align-items`・`gap` 等）
2. `margin: auto`（中央配置）
3. `position` + `inset` + `margin: auto`
4. `transform: translate`（最終手段）

ポジショニングは `inset` を優先し、表現できない場合のみ `top` / `left` などを個別指定します。Flexbox / Gridでは `place-content` / `place-items` を優先します。

```scss
.flexCentered {
  display: flex;
  place-content: center;
  place-items: center;
}
```

## 参考資料

- [MDN Web Docs - Semantics](https://developer.mozilla.org/en-US/docs/Glossary/Semantics)
- [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/WCAG21/quickref/)
