# Third-party programs

Sniptape ships the following programs as separate executables. They are not part of Sniptape's source code and keep their own licenses.

| Program | Version | License | Source |
| --- | --- | --- | --- |
| FFmpeg (Windows: BtbN LGPL static build) | 9.0 | LGPL-2.1-or-later (includes LAME, LGPL) | https://github.com/BtbN/FFmpeg-Builds · https://ffmpeg.org/download.html |
| yt-dlp | latest release at build time | Unlicense | https://github.com/yt-dlp/yt-dlp |
| Deno | 2.9.7 | MIT | https://github.com/denoland/deno |

The FFmpeg license text is available at https://www.gnu.org/licenses/old-licenses/lgpl-2.1.txt. macOS builds are not distributed yet. Exact versions are pinned in `scripts/fetch-binaries.sh`.
