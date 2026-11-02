---
description: Download a video from a link, grab frames, transcribe the audio, and save it as a skill
argument-hint: <video-url> [skill-name] [frame-interval-seconds]
allowed-tools: Bash(.claude/scripts/video-to-skill.sh:*), Read, Write, Glob
---

Turn the video at the given link into a reusable Claude skill.

Arguments: `$ARGUMENTS` (URL, optional skill name, optional frame interval in seconds, default 10).

Steps:

1. Pick a short kebab-case skill name (use the 2nd argument if given, otherwise derive one from the video topic).
2. Run `.claude/scripts/video-to-skill.sh <url> <skill-name> [interval]`. It downloads the video, extracts frames to
   `.claude/skills/<skill-name>/frames/`, and writes `.claude/skills/<skill-name>/transcript.txt`.
   If a dependency is missing (yt-dlp, ffmpeg, whisper), report exactly what to install and stop.
3. Read `transcript.txt` and look at the frames (Read the images) to understand what is shown on screen.
4. Write `.claude/skills/<skill-name>/SKILL.md` with:
   - YAML frontmatter: `name` and a `description` stating what the skill does and when to use it.
   - A concise body: key steps, commands, code, and tips from the video, referencing frames
     (e.g. `frames/frame_0003.jpg`) where visuals matter.
5. Delete `source/video.mp4` unless the user asked to keep it, and keep only frames that are referenced.
6. Summarize what was saved and where.
