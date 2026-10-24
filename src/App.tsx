import { useRef, useState } from "react";
import { join } from "@tauri-apps/api/path";
import { save } from "@tauri-apps/plugin-dialog";
import { mkdir, readFile, writeFile } from "@tauri-apps/plugin-fs";
import { zipSync, type Zippable } from "fflate";
import { AppFooter, AppHeader, PasteScreen } from "@/components/Shell";
import { TrackCard, type Track } from "@/components/TrackCard";
import { encodeMp3, extract, sessionDir } from "@/lib/media";
import { parseYoutubeIds, sanitizeFilename, uniqueName } from "@/lib/text";

const CONCURRENT_EXTRACTIONS = 3;

async function pool<T>(items: T[], size: number, fn: (item: T) => Promise<void>) {
  const queue = [...items];
  await Promise.all(
    Array.from({ length: Math.min(size, queue.length) }, async () => {
      while (queue.length) await fn(queue.shift()!);
    }),
  );
}

const message = (e: unknown) => (e instanceof Error ? e.message : String(e));

export default function App() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [pending, setPending] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const known = useRef(new Set<string>());

  const patch = (id: string, p: Partial<Track>) =>
    setTracks((ts) => ts.map((t) => (t.id === id ? { ...t, ...p } : t)));

  const collect = (text: string) => {
    const found = parseYoutubeIds(text);
    if (!found.length) return false;
    setPending((p) => [...p, ...found.filter((id) => !p.includes(id))]);
    return true;
  };

  const openAdding = () => {
    setPending(tracks.map((t) => t.id));
    setAdding(true);
  };

  const newIds = pending.filter((id) => !known.current.has(id));
  const removedIds = tracks.map((t) => t.id).filter((id) => !pending.includes(id));

  const extractPending = () => {
    const ids = newIds;
    removedIds.forEach(remove);
    setPending([]);
    setAdding(false);
    if (!ids.length) return;
    ids.forEach((id) => known.current.add(id));
    setTracks((ts) => [
      ...ts,
      ...ids.map((id): Track => ({
        id, status: "loading", progress: 0, selected: false,
        title: "", artist: "", duration: 0, audio: "", cover: null, start: 0, end: 0,
      })),
    ]);
    pool(ids, CONCURRENT_EXTRACTIONS, async (id) => {
      try {
        const x = await extract(id, (progress) => patch(id, { progress }));
        patch(id, { ...x, status: "ready", selected: true, end: x.duration });
      } catch (e) {
        patch(id, { status: "error", error: message(e) });
      }
    });
  };

  const remove = (id: string) => {
    known.current.delete(id);
    setTracks((ts) => ts.filter((t) => t.id !== id));
  };

  const selected = tracks.filter((t) => t.status === "ready" && t.selected);

  const download = async () => {
    setBusy(true);
    setError(null);
    try {
      const taken = new Set<string>();
      const files = selected.map((t) => ({ t, name: `${uniqueName(sanitizeFilename(t.title), taken)}.mp3` }));
      if (files.length === 1) {
        const out = await save({ defaultPath: files[0].name, filters: [{ name: "MP3", extensions: ["mp3"] }] });
        if (out) await encodeMp3(files[0].t, out);
        return;
      }
      const out = await save({ defaultPath: "Sniptape.zip", filters: [{ name: "ZIP", extensions: ["zip"] }] });
      if (!out) return;
      const dir = await join(await sessionDir(), "export");
      await mkdir(dir, { recursive: true });
      const zip: Zippable = {};
      for (const { t, name } of files) {
        const path = await join(dir, name);
        await encodeMp3(t, path);
        zip[name] = [await readFile(path), { level: 0 }];
      }
      await writeFile(out, zipSync(zip));
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  };

  const pasting = adding || tracks.length === 0;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <AppHeader onAddLinks={pasting ? undefined : openAdding} />

      {pasting ? (
        <PasteScreen
          links={pending}
          newCount={newIds.length}
          changed={newIds.length > 0 || removedIds.length > 0}
          onPasteText={collect}
          onRemoveLink={(id) => setPending((p) => p.filter((x) => x !== id))}
          onExtract={extractPending}
          onCancel={
            tracks.length
              ? () => {
                  setPending([]);
                  setAdding(false);
                }
              : undefined
          }
        />
      ) : (
        <>
          <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 px-6 py-6">
            {error && <p className="text-sm text-destructive">{error}</p>}
            {tracks.map((t) => (
              <TrackCard key={t.id} track={t} onChange={(p) => patch(t.id, p)} onRemove={() => remove(t.id)} />
            ))}
          </main>
          <AppFooter count={selected.length} busy={busy} onDownload={download} />
        </>
      )}
    </div>
  );
}
