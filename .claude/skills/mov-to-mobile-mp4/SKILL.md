---
name: mov-to-mobile-mp4
description: mov動画をffmpegでH.264のmp4へ変換するスキル（モバイル/Home向け・オリジナルサイズ）。「mobile用のムービーを作る」「mobile.mp4にして」「モバイル動画を変換」などのリクエストで使用する。入力は`.claude/tmp/mobile-mov/`配下の`<記事ID>.mov`、出力は秘匿配信先の`private/assets/work/<記事ID>/mobile.mp4`。縮小せずオリジナルサイズ・音声なし。自動再生ループ動画として認証付き配信される。記事IDをファイル名として扱う運用に沿う。
---

# mov → mobile.mp4 変換（オリジナルサイズ）

## 目的

モバイル/Home向けに、実績（work）の動画を**縮小せずオリジナルサイズのまま**H.264のmp4へ再エンコードする。幅800pxへ縮小する`main.mp4`（`mov-to-mp4`スキル）と異なり、画面に大きく見せる用途のため解像度を保つ。`yuv420p`・`+faststart`でブラウザ再生と頭出しの速さを確保し、自動再生ループ用途なので音声は削除する。

出力は公開ディレクトリ外の`private/`へ直接置き、`mobile.mp4`として認証連動で配信する。秘匿アセットとして守るための配置。

## 入出力の規約

- 入力: `.claude/tmp/mobile-mov/<記事ID>.mov`
- 出力: `private/assets/work/<記事ID>/mobile.mp4`

記事IDはmicroCMSの実績IDに対応する。`main.mp4`・`main.webp`・`mobile.webp`と同じ実績ディレクトリに並ぶ。

## 前提

- `ffmpeg` がインストールされていること（`which ffmpeg` で確認）。無ければ `brew install ffmpeg` を案内する。

## 使い方

変換は同梱スクリプト `scripts/convert.sh` に集約してある。毎回コマンドを組み立てず、これを呼ぶ。

**全件変換**（`.claude/tmp/mobile-mov/` 配下の全 `.mov`）:

```sh
sh .claude/skills/mov-to-mobile-mp4/scripts/convert.sh
```

**特定の記事IDのみ変換**（拡張子不要・複数可）:

```sh
sh .claude/skills/mov-to-mobile-mp4/scripts/convert.sh esl6r0a07zh qlsn7fa4w
```

実行後、`private/assets/work/<記事ID>/mobile.mp4` が生成されたことを `ls` 等で確認し、ユーザーに結果（生成ファイルと件数）を報告する。

## 調整したいとき

サイズはオリジナル維持のため、画質は `CRF`・`PRESET` で調整する。

- `CRF`: 品質。小さいほど高画質・大サイズ（一般に18〜28、既定23）
- `PRESET`: エンコード速度と圧縮効率のトレードオフ（`fast`/`medium`/`slow` 等。既定`medium`）

```sh
CRF=26 sh .claude/skills/mov-to-mobile-mp4/scripts/convert.sh esl6r0a07zh
```

ファイルサイズを下げたいときは `CRF` を上げるのが効く。
