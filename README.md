# Sniptape

Desktop app to extract audio from YouTube videos, trim it, and save it as MP3.

Paste one or more YouTube links, trim each track on its waveform, edit the title and artist, then download one MP3 or a ZIP of several.

## Development

Requirements: Node 22+, pnpm, Rust (stable).

```bash
pnpm install
scripts/fetch-binaries.sh
pnpm tauri dev
```

`scripts/fetch-binaries.sh` downloads yt-dlp, FFmpeg and Deno for the current platform into `src-tauri/binaries/`.

Run tests:

```bash
pnpm test
```

## Builds

Windows installers are built by GitHub Actions when a `v*` tag is pushed (see `.github/workflows/build.yml`):

```bash
git tag v0.1.0 && git push origin v0.1.0
```

## Disclaimer

Downloading YouTube content may violate YouTube's Terms of Service. Only download content you have the right to download.

## License

MIT for Sniptape's code. Bundled programs keep their own licenses: see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
