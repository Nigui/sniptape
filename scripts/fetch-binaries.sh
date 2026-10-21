#!/usr/bin/env bash
set -euo pipefail

TRIPLE="${1:-$(rustc -vV | sed -n 's/^host: //p')}"
DENO_VERSION="v2.9.7"
FFMPEG_BTBN_ASSET="ffmpeg-n9.0-latest-win64-lgpl-9.0"

OUT="$(cd "$(dirname "$0")/.." && pwd)/src-tauri/binaries"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$OUT"

case "$TRIPLE" in
  aarch64-apple-darwin|x86_64-apple-darwin) YTDLP=yt-dlp_macos; EXT="" ;;
  x86_64-pc-windows-msvc) YTDLP=yt-dlp.exe; EXT=".exe" ;;
  *) echo "unsupported target: $TRIPLE" >&2; exit 1 ;;
esac

curl -fsSL -o "$OUT/yt-dlp-$TRIPLE$EXT" "https://github.com/yt-dlp/yt-dlp/releases/latest/download/$YTDLP"

if [ "$EXT" = ".exe" ]; then
  curl -fsSL -o "$TMP/ffmpeg.zip" "https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/$FFMPEG_BTBN_ASSET.zip"
  unzip -o -q -j "$TMP/ffmpeg.zip" "$FFMPEG_BTBN_ASSET/bin/ffmpeg.exe" -d "$TMP"
  mv "$TMP/ffmpeg.exe" "$OUT/ffmpeg-$TRIPLE.exe"
else
  cp -L "$(command -v ffmpeg)" "$OUT/ffmpeg-$TRIPLE"
fi

curl -fsSL -o "$TMP/deno.zip" "https://github.com/denoland/deno/releases/download/$DENO_VERSION/deno-$TRIPLE.zip"
unzip -o -q "$TMP/deno.zip" -d "$TMP"
mv "$TMP/deno$EXT" "$OUT/deno-$TRIPLE$EXT"

chmod +x "$OUT"/*-"$TRIPLE"*
ls -lh "$OUT"
