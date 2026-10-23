# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary user today: the author, a parent preparing audio for a child's audio player. They collect YouTube links (songs, stories), trim the unwanted intro and outro, and copy the resulting MP3s onto an SD card from a Windows PC (macOS also used for development).

Target audience once public: non-technical people, such as parents and casual users, who want an easy, ad-free, local alternative to YouTube-to-MP3 websites.

## Product Purpose

Sniptape turns YouTube links into clean, trimmed, tagged MP3 files ready for a simple audio player. Success: paste links, trim each track by eye on its waveform, and save MP3s (or one ZIP) straight to the SD card in a few minutes, with no ads, no account, and no command line.

## Positioning

A local desktop app instead of a website: nothing is uploaded to a third-party server, there are no ads or pop-ups, and it handles several links at once with visual trimming and editable tags. Extraction relies on yt-dlp running on the user's own machine and IP.

## Operating Context

- Desktop app (Tauri v2) rendered in the OS webview: WebView2 on Windows, WebKit on macOS. Windows is the first real usage target.
- Session flow: paste one or more YouTube links → extraction with visible progress → waveform per track with a trim region → edit title and artist → save one MP3 or a ZIP of several via the system save dialog, usually directly onto an SD card.
- Files from a session are temporary and are deleted the next time the app starts.
- The destination device is a child's audio player: simple file names and ID3 tags matter more than audio fidelity options.

## Capabilities and Constraints

- Bundled programs: yt-dlp (extraction), Deno (yt-dlp's JS challenge runtime), FFmpeg (trim, MP3 encode, ID3, cover art).
- Output: MP3, 192 kbps CBR, 44.1 kHz, ID3v2.3 with title, artist and the YouTube thumbnail as cover. Fixed for now; bitrate may change once the target player's limits are known.
- File name = edited title only, sanitized for FAT32/exFAT.
- Several selected tracks export as one ZIP.
- A link carrying a playlist parameter downloads only that video. Playlist support is undecided.
- Short videos are the current use; no length limit is the long-term goal.
- Undecided: SD card player model and its constraints, macOS public distribution (needs a redistributable FFmpeg build), app signing, yt-dlp self-update.

## Brand Commitments

- Name: Sniptape.
- Interface language: French only. The current UI copy is English and must be translated.
- Open-source under MIT; bundled programs keep their own licenses (THIRD_PARTY_NOTICES.md).
- Visual direction: the category standard, refined to the craft level of Spotify / Apple Music and Descript / GarageBand, with one coral accent. A tape or cassette theme was considered and dropped.

## Evidence on Hand

No users, testimonials, metrics or press yet. Do not fabricate any.

## Product Principles

- Paste, trim, save: the main path must work without reading anything.
- Local and private: no account, no tracking, no remote processing.
- Built for the SD card: output files must work on a basic player with no extra step.
- Show progress and failures plainly; never leave the user guessing whether extraction worked.
