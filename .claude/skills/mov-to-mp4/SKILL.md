---
name: mov-to-mp4
description: mov動画をffmpegでH.264のmp4に圧縮変換するスキル。「movをmp4にして」「動画を圧縮」「実績の動画素材をmp4化」「movを軽くして」などのリクエストで使用する。入力は`.claude/tmp/mov/`配下の`<記事ID>.mov`、出力は秘匿配信先の`private/assets/work/<記事ID>/main.mp4`。幅800pxに縮小・音声なし。figureの自動再生ループ動画として認証付き配信される。記事IDをファイル名として扱う運用に沿う。
---

# mov → 圧縮mp4 変換

## 目的

実績（work）の動画素材（`.mov`）は容量が大きく、そのままではWeb掲載に重い。ffmpegでH.264のmp4へ再エンコードし、幅800pxへ縮小して扱いやすいサイズに圧縮する。`yuv420p`・`+faststart`でブラウザ再生と頭出しの速さを確保し、自動再生ループ用途なので音声は削除する。

出力は公開ディレクトリ外の`private/`へ直接置き、`main.mp4`配信ルート（認証連動）からのみ配信する。秘匿アセットとして守るための配置。

## 入出力の規約

- 入力: `.claude/tmp/mov/<記事ID>.mov`
- 出力: `private/assets/work/<記事ID>/main.mp4`

記事IDはmicroCMSの実績ID（例: `esl6r0a07zh`）に対応する。実績ごとのディレクトリに`main.mp4`として置き、静止画`main.webp`と同じ場所で対になる。

## 前提

- `ffmpeg` がインストールされていること（`which ffmpeg` で確認）。無ければ `brew install ffmpeg` を案内する。

## 使い方

変換は同梱スクリプト `scripts/convert.sh` に集約してある。毎回コマンドを組み立てず、これを呼ぶ。

**全件変換**（`.claude/tmp/mov/` 配下の全 `.mov`）:

```sh
sh .claude/skills/mov-to-mp4/scripts/convert.sh
```

**特定の記事IDのみ変換**（拡張子不要・複数可）:

```sh
sh .claude/skills/mov-to-mp4/scripts/convert.sh esl6r0a07zh qlsn7fa4w
```

実行後、`private/assets/work/<記事ID>/main.mp4` が生成されたことを `ls` 等で確認し、ユーザーに結果（生成ファイルと件数）を報告する。

## 調整したいとき

画質・サイズは環境変数で上書きできる。既定は幅800px・CRF23（H.264の標準的な品質）。

- `SCALE_WIDTH`: 出力幅px・高さは比率維持（例: 軽くするなら `SCALE_WIDTH=640`）
- `CRF`: 品質。小さいほど高画質・大サイズ。一般に18〜28（例: 高画質寄りは `CRF=20`、軽さ優先は `CRF=26`）
- `PRESET`: エンコード速度と圧縮効率のトレードオフ（`fast`/`medium`/`slow` 等。既定`medium`）

```sh
SCALE_WIDTH=640 CRF=26 sh .claude/skills/mov-to-mp4/scripts/convert.sh esl6r0a07zh
```

ファイルサイズを下げたいときは `SCALE_WIDTH` を下げる、`CRF` を上げるのが効く。
