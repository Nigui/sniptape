const YOUTUBE_ID =
  /(?:youtube\.com\/(?:watch\?(?:[^\s#]*&)?v=|shorts\/|live\/|embed\/)|youtu\.be\/)([\w-]{11})/g;

export const parseYoutubeIds = (text: string) => [
  ...new Set([...text.matchAll(YOUTUBE_ID)].map((m) => m[1])),
];

export function sanitizeFilename(name: string) {
  const clean = name
    .replace(/[\\/:*?"<>|\x00-\x1f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120)
    .replace(/[. ]+$/, "");
  return !clean || /^(con|prn|aux|nul|com\d|lpt\d)$/i.test(clean) ? "audio" : clean;
}

export function uniqueName(name: string, taken: Set<string>) {
  let candidate = name;
  for (let i = 2; taken.has(candidate.toLowerCase()); i++) candidate = `${name} (${i})`;
  taken.add(candidate.toLowerCase());
  return candidate;
}

export function formatTime(seconds: number) {
  const tenths = Math.round(seconds * 10);
  const min = Math.floor(tenths / 600);
  const sec = ((tenths % 600) / 10).toFixed(1).padStart(4, "0");
  return `${min}:${sec}`;
}

export function parseTime(text: string) {
  const m = text.trim().replace(",", ".").match(/^(?:(\d+):)?(\d+(?:\.\d*)?)$/);
  if (!m) return null;
  const seconds = Number(m[1] ?? 0) * 60 + Number(m[2]);
  return Number.isFinite(seconds) ? seconds : null;
}
