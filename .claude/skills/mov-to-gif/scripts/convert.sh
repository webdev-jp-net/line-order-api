#!/bin/sh
set -eu

# mov を palettegen/paletteuse で高品質アニメーションGIFへ変換する。
# 入力:  .claude/tmp/mov/<記事ID>.mov
# 出力:  .claude/tmp/gif/<記事ID>.gif
#
# 引数なし: mov/配下の全.movを変換
# 引数あり: 指定した記事ID（拡張子不要）のみ変換   例: convert.sh esl6r0a07zh

IN_DIR=".claude/tmp/mov"
OUT_DIR=".claude/tmp/gif"

# 画質・サイズの調整値。記事サムネ用途で扱いやすい既定値
FPS="${FPS:-12}"
SCALE_WIDTH="${SCALE_WIDTH:-800}"

if [ ! -d "$IN_DIR" ]; then
  echo "ERROR: 入力ディレクトリがありません: $IN_DIR" >&2
  exit 1
fi
mkdir -p "$OUT_DIR"

convert_one() {
  src="$1"
  id="$(basename "$src" .mov)"
  out="$OUT_DIR/$id.gif"

  # パレットは一時ファイルに生成し、変換後に破棄する
  palette="$(mktemp -t "palette_${id}.XXXXXX").png"

  echo "[$id] パレット生成中..."
  ffmpeg -y -i "$src" -vf "palettegen" "$palette" >/dev/null 2>&1

  echo "[$id] GIF変換中..."
  ffmpeg -y -i "$src" -i "$palette" \
    -lavfi "fps=${FPS},scale=${SCALE_WIDTH}:-1:flags=lanczos [x]; [x][1:v] paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle" \
    "$out" >/dev/null 2>&1

  rm -f "$palette"
  echo "[$id] 完了: $out"
}

if [ "$#" -gt 0 ]; then
  # 指定IDのみ
  for id in "$@"; do
    src="$IN_DIR/${id%.mov}.mov"
    if [ ! -f "$src" ]; then
      echo "ERROR: 入力が見つかりません: $src" >&2
      exit 1
    fi
    convert_one "$src"
  done
else
  # 全件
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
