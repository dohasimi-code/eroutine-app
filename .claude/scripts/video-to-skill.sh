#!/usr/bin/env bash
# Usage: video-to-skill.sh <video-url> <skill-name> [frame-interval-seconds]
# Downloads a video, extracts frames, transcribes the audio.
# Output: .claude/skills/<skill-name>/{source/video.mp4,frames/*.jpg,transcript.txt}
set -euo pipefail

URL="${1:?Usage: video-to-skill.sh <url> <skill-name> [interval-seconds]}"
NAME="${2:?Missing skill name (kebab-case)}"
INTERVAL="${3:-10}"

[[ "$NAME" =~ ^[a-z0-9][a-z0-9-]*$ ]] || { echo "Skill name must be kebab-case: $NAME" >&2; exit 1; }
[[ "$URL" =~ ^https?:// ]] || { echo "URL must start with http(s)://" >&2; exit 1; }

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
OUT="$ROOT/.claude/skills/$NAME"
mkdir -p "$OUT/source" "$OUT/frames"

need() { command -v "$1" >/dev/null 2>&1 || { echo "Missing dependency: $1 ($2)" >&2; exit 1; }; }
need yt-dlp "pip install yt-dlp"
need ffmpeg "apt install ffmpeg / brew install ffmpeg"

echo "==> Downloading video"
yt-dlp -f "bv*[height<=720]+ba/b[height<=720]/b" --merge-output-format mp4 \
  --no-playlist -o "$OUT/source/video.%(ext)s" -- "$URL"
VIDEO="$OUT/source/video.mp4"

echo "==> Grabbing a frame every ${INTERVAL}s"
ffmpeg -loglevel error -y -i "$VIDEO" -vf "fps=1/${INTERVAL},scale=960:-2" -q:v 4 "$OUT/frames/frame_%04d.jpg"

echo "==> Transcribing audio"
ffmpeg -loglevel error -y -i "$VIDEO" -vn -ac 1 -ar 16000 "$OUT/source/audio.wav"
if command -v whisper >/dev/null 2>&1; then
  whisper "$OUT/source/audio.wav" --model base --output_format txt --output_dir "$OUT/source" >/dev/null
  mv "$OUT/source/audio.txt" "$OUT/transcript.txt"
elif python3 -c "import faster_whisper" 2>/dev/null; then
  python3 - "$OUT/source/audio.wav" "$OUT/transcript.txt" <<'PY'
import sys
from faster_whisper import WhisperModel
segs, _ = WhisperModel("base", compute_type="int8").transcribe(sys.argv[1])
open(sys.argv[2], "w").write("\n".join(s.text.strip() for s in segs) + "\n")
PY
else
  echo "Missing transcriber: pip install openai-whisper (or faster-whisper)" >&2
  exit 1
fi
rm -f "$OUT/source/audio.wav"

echo "==> Done: $OUT"
echo "frames: $(ls "$OUT/frames" | wc -l)  transcript lines: $(wc -l < "$OUT/transcript.txt")"
