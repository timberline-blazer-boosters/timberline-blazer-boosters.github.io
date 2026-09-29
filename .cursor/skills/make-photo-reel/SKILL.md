---
name: make-photo-reel
description: >-
  Build a 9:16 Instagram/TikTok reel from still photos with Ken Burns motion and
  crossfades, keeping original color. Use when making a reel, slideshow, photo
  video, Instagram Reel, TikTok, or sports highlight from JPEGs.
---

# Make a photo reel

Turn stills into a vertical reel. **Do not** color-grade, filter, or distort the photos. **Do not** download or bake in commercial songs. For Instagram, export **without music** and add the track in the app.

## Run this (do not rewrite)

From the repo root:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .cursor/skills/make-photo-reel/scripts/New-PhotoReel.ps1 -ImageFolder "C:\path\to\photos" -OutDir "$env:USERPROFILE\OneDrive\Pictures\Temp\Reel" -OutName "blazers-volleyball-reel-2026-09-17.mp4" -Instagram
```

`Ensure-Ffmpeg.ps1` is called automatically. It installs a portable ffmpeg under `%LOCALAPPDATA%/photo-reel/ffmpeg/` (not the git repo). Never commit ffmpeg, mp3s, or full-res photos.

## Defaults

| Item | Value |
|---|---|
| Size | 1080×1920 (9:16), 30 fps |
| Clip | ~2.05 s each |
| Transition | 0.40 s (fade, zoomin, slideup, dissolve) |
| Look | cover-crop + Ken Burns only — no `eq`, saturation, or LUTs |
| Audio | none when `-Instagram` (add music in Instagram) |
| Output | `OneDrive/Pictures/Temp/Reel/` |

Prefer **full-resolution** JPEGs on disk over chat-compressed attachments.

## Instagram music (High Hopes)

This club’s default reel track is **High Hopes — Panic! At The Disco** (clean, upbeat). Instagram licenses it; this public repo cannot.

After the mp4 is written:

1. Phone: Instagram → **+** → **Reel** → pick the mp4.
2. **Audio** → search `High Hopes Panic`.
3. Choose **Panic! At The Disco — High Hopes** (official).
4. Start near the chorus (~0:48, “had to have high high hopes”) so the 37 s reel stays upbeat.
5. Original audio stays off (file is silent).

Do **not** rip YouTube/Spotify or commit that song.

## Optional local audio

Only if the user already has a licensed file on disk:

```powershell
... -Audio "C:\path\High-Hopes.m4a"
```

Skip `-Instagram` in that case. Never fetch commercial audio from the network.

## Photo order

If the user attached images in a sequence, keep that order. Otherwise sort by filename. 1-based indices can mark:

- `-JumpShots` — zoom in + slight pan up (spikes, jumps)
- `-WideShots` — slow zoom out (huddles, celebrations)

## After export

Write a short `INSTAGRAM-MUSIC.txt` next to the mp4 with the track name and chorus start. Confirm the file is 1080×1920 and opens. Do not add the reel to the Jekyll site unless asked.
