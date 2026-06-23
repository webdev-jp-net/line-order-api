---
name: mov-to-gif
description: mov動画をffmpegのパレット最適化（palettegen/paletteuse）で高品質なアニメーションGIFに変換するスキル。「movをgifにして」「動画をアニメgifに変換」「実績の動画素材をgif化」などのリクエストで使用する。入力は`.claude/tmp/mov/`配下の`<記事ID>.mov`、出力は`.claude/tmp/gif/`配下の`<記事ID>.gif`。記事IDをファイル名として扱う運用に沿う。
---

# mov → アニメーションGIF 変換

## 目的

実績（work）の動画素材（`.mov`）を、Web掲載に適した高品質アニメーションGIFへ変換する。単純な変換だと色帯やノイズが目立つため、ffmpegの2段階パレット最適化（`palettegen`でフレーム全体に最適な256色パレットを作り、`paletteuse`でそれを適用）を使い、色を保ったまま破綻を抑える。

## 入出力の規約

- 入力: `.claude/tmp/mov/<記事ID>.mov`
- 出力: `.claude/tmp/gif/<記事ID>.gif`

ファイル名の記事IDは、microCMSの実績ID（例: `esl6r0a07zh`）に対応する。出力名は入力名をそのまま引き継ぐため、後段の取り込み（記事との紐付け）が崩れない。

## 前提

- `ffmpeg` がインストールされていること（`which ffmpeg` で確認）。無ければ `brew install ffmpeg` を案内する。

## 使い方

変換は同梱スクリプト `scripts/convert.sh` に集約してある。毎回コマンドを組み立てず、これを呼ぶ。

**全件変換**（`.claude/tmp/mov/` 配下の全 `.mov`）:

```sh
sh .claude/skills/mov-to-gif/scripts/convert.sh
```

**特定の記事IDのみ変換**（拡張子不要・複数可）:

```sh
sh .claude/skills/mov-to-gif/scripts/convert.sh esl6r0a07zh qlsn7fa4w
```

実行後、`.claude/tmp/gif/<記事ID>.gif` が生成されたことを `ls` 等で確認し、ユーザーに結果（生成ファイルと件数）を報告する。

## 調整したいとき

画質・サイズは環境変数で上書きできる。既定はサムネ用途で扱いやすい値（fps=12、幅800px）。実測で、尺の長い素材でも幅800なら概ね40MB以下に収まる。

- `FPS`: フレームレート（例: なめらかさを上げるなら `FPS=15`）
- `SCALE_WIDTH`: 出力幅px・高さは比率維持（例: 軽くするなら `SCALE_WIDTH=600`）

```sh
FPS=15 SCALE_WIDTH=600 sh .claude/skills/mov-to-gif/scripts/convert.sh esl6r0a07zh
```

ファイルサイズが大きすぎる場合は `SCALE_WIDTH` を下げる、`FPS` を落とすのが効く。色変換方式（`dither`/`bayer_scale`）はスクリプト内で `bayer:bayer_scale=5` 固定。ここを変えたい要望が出た場合のみスクリプトを編集する。
