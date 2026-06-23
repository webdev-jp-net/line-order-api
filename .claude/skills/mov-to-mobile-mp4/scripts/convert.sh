#!/bin/sh
set -eu

# mov を H.264 mp4 へ変換する（オリジナルサイズ・縮小なし・音声なし）。
# モバイル/Home向けの自動再生ループ動画として配信するため、秘匿配置先へ直接出力する。
# 入力:  .claude/tmp/mobile-mov/<記事ID>.mov
# 出力:  private/assets/work/<記事ID>/mobile.mp4
#
# 引数なし: mobile-mov/配下の全.movを変換
# 引数あり: 指定した記事ID（拡張子不要）のみ変換   例: convert.sh esl6r0a07zh

IN_DIR=".claude/tmp/mobile-mov"
OUT_DIR="private/assets/work"

# 画質の調整値（サイズはオリジナル維持のため SCALE_WIDTH は持たない）
# CRFは品質。小さいほど高画質・大サイズ（一般に18〜28、既定23が無難）
CRF="${CRF:-23}"
PRESET="${PRESET:-medium}"

if [ ! -d "$IN_DIR" ]; then
  echo "ERROR: 入力ディレクトリがありません: $IN_DIR" >&2
  exit 1
fi

convert_one() {
  src="$1"
  id="$(basename "$src" .mov)"
  out="$OUT_DIR/$id/mobile.mp4"

  mkdir -p "$OUT_DIR/$id"

  echo "[$id] mobile.mp4変換中（オリジナルサイズ）..."
  # 縮小はせず、H.264のyuv420pが要求する偶数寸法へ丸めるだけ（解像度は維持）
  # +faststart でストリーミング時に頭出しが速くなる
  # 自動再生ループ・音声なしの用途なので -an で音声を削除
  ffmpeg -y -i "$src" \
    -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" \
    -c:v libx264 -crf "${CRF}" -preset "${PRESET}" -pix_fmt yuv420p \
    -movflags +faststart \
    -an \
    "$out" >/dev/null 2>&1

  echo "[$id] 完了: $out"
}

if [ "$#" -gt 0 ]; then
  for id in "$@"; do
    src="$IN_DIR/${id%.mov}.mov"
    if [ ! -f "$src" ]; then
      echo "ERROR: 入力が見つかりません: $src" >&2
      exit 1
    fi
    convert_one "$src"
  done
else
  found=0
  for src in "$IN_DIR"/*.mov; do
    [ -f "$src" ] || continue
    found=1
    convert_one "$src"
  done
  if [ "$found" -eq 0 ]; then
    echo "変換対象の.movが $IN_DIR にありません" >&2
    exit 1
  fi
fi
