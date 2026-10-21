import { invoke } from "@tauri-apps/api/core";
import { appCacheDir, join } from "@tauri-apps/api/path";
import { exists, mkdir, remove } from "@tauri-apps/plugin-fs";
import { Command } from "@tauri-apps/plugin-shell";

export const MP3_BITRATE = "192k";

export type Extracted = {
  title: string;
  artist: string;
  duration: number;
  audio: string;
  cover: string | null;
};

const exeSuffix = navigator.userAgent.includes("Windows") ? ".exe" : "";

let binDir: Promise<string> | undefined;
const binPath = async (name: string) =>
  join(await (binDir ??= invoke<string>("sidecar_dir")), name + exeSuffix);

let session: Promise<string> | undefined;
export const sessionDir = () =>
  (session ??= (async () => {
    const dir = await join(await appCacheDir(), "session");
    if (await exists(dir)) await remove(dir, { recursive: true });
    await mkdir(dir, { recursive: true });
    return dir;
  })());

function run(name: "yt-dlp" | "ffmpeg", args: string[], onLine?: (line: string) => void) {
  return new Promise<string[]>((resolve, reject) => {
    const out: string[] = [];
    const err: string[] = [];
    const cmd = Command.sidecar(`binaries/${name}`, args);
    cmd.stdout.on("data", (line) => {
      out.push(line);
      onLine?.(line);
    });
    cmd.stderr.on("data", (line) => err.push(line));
    cmd.on("error", reject);
    cmd.on("close", ({ code }) =>
      code === 0
        ? resolve(out)
        : reject(new Error(err.filter((l) => l.trim()).pop() ?? `${name} exited with code ${code}`)),
    );
    cmd.spawn().catch(reject);
  });
}

export async function extract(videoId: string, onProgress: (ratio: number) => void): Promise<Extracted> {
  const dir = await sessionDir();
  const lines = await run(
    "yt-dlp",
    [
      "--ignore-config",
      "--no-playlist",
      "--newline",
      "--progress",
      "--no-simulate",
      "-f", "bestaudio[ext=m4a]/bestaudio",
      "--write-thumbnail",
      "--convert-thumbnails", "jpg",
      "--ffmpeg-location", await binPath("ffmpeg"),
      "--no-js-runtimes",
      "--js-runtimes", `deno:${await binPath("deno")}`,
      "-P", dir,
      "-o", "%(id)s.%(ext)s",
      "--progress-template",
      "download:P %(progress.downloaded_bytes)s %(progress.total_bytes)s %(progress.total_bytes_estimate)s",
      "--print", "after_move:J %(.{title,track,artist,uploader,duration,filepath})j",
      `https://www.youtube.com/watch?v=${videoId}`,
    ],
    (line) => {
      if (!line.startsWith("P ")) return;
      const [done, total, estimate] = line.slice(2).split(" ").map(Number);
      const size = total || estimate;
      if (done && size) onProgress(Math.min(done / size, 1));
    },
  );
  const json = lines.find((l) => l.startsWith("J "));
  if (!json) throw new Error("yt-dlp returned no metadata");
  const info = JSON.parse(json.slice(2));
  const cover = await join(dir, `${videoId}.jpg`);
  return {
    title: info.track || info.title || videoId,
    artist: info.artist || (info.uploader ?? "").replace(/ - Topic$/, ""),
    duration: info.duration ?? 0,
    audio: info.filepath,
    cover: (await exists(cover)) ? cover : null,
  };
}

export async function encodeMp3(
  src: { audio: string; cover: string | null; start: number; end: number; title: string; artist: string },
  outPath: string,
) {
  const args = ["-hide_banner", "-loglevel", "error", "-y", "-ss", src.start.toFixed(3), "-to", src.end.toFixed(3), "-i", src.audio];
  if (src.cover) {
    args.push("-i", src.cover, "-map", "0:a", "-map", "1:v", "-c:v", "mjpeg", "-disposition:v", "attached_pic");
  }
  args.push(
    "-c:a", "libmp3lame",
    "-b:a", MP3_BITRATE,
    "-ar", "44100",
    "-id3v2_version", "3",
    "-metadata", `title=${src.title}`,
    "-metadata", `artist=${src.artist}`,
    outPath,
  );
  await run("ffmpeg", args);
}
