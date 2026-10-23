import { useRef, useState } from "react";
import { join } from "@tauri-apps/api/path";
import { save } from "@tauri-apps/plugin-dialog";
import { mkdir, readFile, writeFile } from "@tauri-apps/plugin-fs";
import { zipSync, type Zippable } from "fflate";
import { Download, Link2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const known = useRef(new Set<string>());

  const patch = (id: string, p: Partial<Track>) =>
    setTracks((ts) => ts.map((t) => (t.id === id ? { ...t, ...p } : t)));

  const add = (text: string) => {
    const ids = parseYoutubeIds(text).filter((id) => !known.current.has(id));
    if (!ids.length) return false;
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
    return true;
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

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b bg-chrome px-6 py-4">
        <div className="mx-auto flex max-w-4xl flex-col gap-3">
          <h1 className="flex items-center gap-2 text-lg font-semibold">
            <svg viewBox="0 0 20 20" className="size-5 text-primary" aria-hidden>
              <rect x="2" y="7" width="3" height="6" rx="1.5" fill="currentColor" />
              <rect x="8.5" y="3" width="3" height="14" rx="1.5" fill="currentColor" />
              <rect x="15" y="6" width="3" height="8" rx="1.5" fill="currentColor" />
            </svg>
            Sniptape
          </h1>
          <div className="relative">
            <Link2 className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
            aria-label="Liens YouTube"
            className="h-11 rounded-xl border-transparent bg-card pl-10 text-base shadow-card md:text-base dark:bg-card"
            value={input}
            placeholder="Collez un ou plusieurs liens YouTube"
            onChange={(e) => setInput(e.target.value)}
            onPaste={(e) => {
              if (add(e.clipboardData.getData("text"))) {
                e.preventDefault();
                setError(null);
              }
            }}
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              if (add(input)) {
                setInput("");
                setError(null);
              } else setError("Aucun nouveau lien YouTube trouvé.");
            }}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 px-6 py-6">
        {tracks.length === 0 && (
          <p className="py-16 text-center text-muted-foreground">Collez des liens YouTube ci-dessus pour commencer.</p>
        )}
        {tracks.map((t) => (
          <TrackCard key={t.id} track={t} onChange={(p) => patch(t.id, p)} onRemove={() => remove(t.id)} />
        ))}
      </main>

      {tracks.length > 0 && (
        <footer className="sticky bottom-0 border-t bg-chrome px-6 py-3">
          <div className="mx-auto flex max-w-4xl items-center gap-3">
            <span className="text-sm text-muted-foreground">{selected.length} {selected.length > 1 ? "sélectionnés" : "sélectionné"}</span>
            <Button size="lg" className="ml-auto h-11 rounded-full px-6" disabled={!selected.length || busy} onClick={download}>
              {busy ? <Loader2 className="animate-spin" /> : <Download />}
              {selected.length > 1 ? `Télécharger le ZIP (${selected.length})` : "Télécharger le MP3"}
            </Button>
          </div>
        </footer>
      )}
    </div>
  );
}
