#!/usr/bin/env bash
# ============================================================
# gen-audio.sh — make small local Japanese audio clips (macOS)
#
# Uses the built-in `say` command + the Kyoko (ja_JP) voice.
# Output is compact .m4a (AAC) that plays in every browser.
# No installs needed. Not studio quality; a solid starting point.
#
# Usage:
#   assets/gen-audio.sh <manifest> <outdir> [voice] [rate]
#
#   manifest : text file, one clip per line:  slug|Japanese text
#              (lines starting with # are ignored)
#   outdir   : where the .m4a files go (created if missing)
#   voice    : say voice        (default: Kyoko)
#   rate     : words per minute  (default: 150 — a touch slow, good for learning)
#
# Example:
#   assets/gen-audio.sh lessons/audio/lesson1.manifest lessons/audio
#
# For a TRUE .mp3 instead of .m4a you'd need ffmpeg or lame
# (`brew install ffmpeg`), then: ffmpeg -i clip.m4a clip.mp3
# ============================================================
set -euo pipefail

MANIFEST="${1:?usage: gen-audio.sh <manifest> <outdir> [voice] [rate]}"
OUTDIR="${2:?usage: gen-audio.sh <manifest> <outdir> [voice] [rate]}"
VOICE="${3:-Kyoko}"
RATE="${4:-150}"

if ! command -v say >/dev/null 2>&1; then
  echo "error: 'say' not found (this script needs macOS)." >&2; exit 1
fi
if ! say -v '?' | grep -q "$VOICE"; then
  echo "error: voice '$VOICE' not installed." >&2
  echo "Add one in System Settings > Accessibility > Spoken Content >" >&2
  echo "System Voice > Manage Voices (search 'Japanese', e.g. Kyoko)." >&2
  exit 1
fi

mkdir -p "$OUTDIR"
count=0
while IFS='|' read -r slug text; do
  [ -z "${slug// }" ] && continue          # skip blank lines
  case "$slug" in \#*) continue;; esac      # skip comments
  slug="$(echo "$slug" | xargs)"            # trim
  out="$OUTDIR/$slug.m4a"
  say -v "$VOICE" -r "$RATE" --file-format=m4af --data-format=aac -o "$out" "$text"
  echo "  ✓ $out"
  count=$((count+1))
done < "$MANIFEST"
echo "Done: $count clip(s) → $OUTDIR (voice=$VOICE, rate=$RATE)"
