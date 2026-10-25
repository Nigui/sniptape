import { useState, type ReactNode } from "react";
import ReactDOM from "react-dom/client";
import "../index.css";
import { AppFooter, AppHeader, PasteScreen } from "@/components/Shell";
import { parseYoutubeIds } from "@/lib/text";
import { TrackCard, type Track } from "@/components/TrackCard";
import sample from "./fixtures/sample.mp3?url";
import cover1 from "./fixtures/cover-1.svg?url";
import cover2 from "./fixtures/cover-2.svg?url";
import cover3 from "./fixtures/cover-3.svg?url";

Object.assign(window, { __TAURI_INTERNALS__: { convertFileSrc: (path: string) => path } });

type Palette = { h: number; primary: [number, number]; dark: [number, number] };

const palettes: Record<string, Palette | null> = {
  current: null,
  pine: { h: 165, primary: [0.52, 0.1], dark: [0.74, 0.11] },
  berry: { h: 355, primary: [0.53, 0.17], dark: [0.74, 0.14] },
  ultramarine: { h: 262, primary: [0.47, 0.19], dark: [0.74, 0.12] },
  petrol: { h: 225, primary: [0.48, 0.09], dark: [0.74, 0.1] },
};

function paletteCss({ h, primary: [l, c], dark: [dl, dc] }: Palette) {
  const light = `
    --primary: oklch(${l} ${c} ${h}); --primary-strong: oklch(${l - 0.1} ${c} ${h});
    --primary-ui: oklch(${l} ${c} ${h}); --primary-foreground: oklch(1 0 0); --primary-ui-foreground: oklch(1 0 0);
    --ring: oklch(${l} ${c} ${h}); --background: oklch(0.968 0.006 ${h}); --chrome: oklch(0.988 0.004 ${h});
    --foreground: oklch(0.22 0.015 ${h}); --card-foreground: oklch(0.22 0.015 ${h}); --muted-foreground: oklch(0.49 0.015 ${h});
    --muted: oklch(0.95 0.008 ${h}); --secondary: oklch(0.95 0.008 ${h}); --accent: oklch(0.94 0.03 ${h}); --accent-foreground: oklch(0.25 0.015 ${h}); --border: oklch(0.905 0.008 ${h}); --input: oklch(0.64 0.012 ${h});`;
  const dark = `
    --primary: oklch(${dl} ${dc} ${h}); --primary-strong: oklch(${dl + 0.1} ${dc * 0.7} ${h});
    --primary-ui: oklch(${dl} ${dc} ${h}); --primary-foreground: oklch(0.18 0.03 ${h}); --primary-ui-foreground: oklch(0.18 0.03 ${h});
    --ring: oklch(${dl} ${dc} ${h}); --background: oklch(0.17 0.008 ${h}); --chrome: oklch(0.195 0.008 ${h});
    --foreground: oklch(0.955 0.006 ${h}); --card: oklch(0.225 0.009 ${h}); --card-foreground: oklch(0.955 0.006 ${h});
    --muted-foreground: oklch(0.73 0.01 ${h}); --muted: oklch(0.27 0.01 ${h}); --secondary: oklch(0.27 0.01 ${h}); --accent: oklch(0.3 0.04 ${h}); --accent-foreground: oklch(0.955 0.006 ${h}); --input: oklch(0.55 0.01 ${h}); --border: oklch(1 0 0 / 9%);`;
  return `:root {${light}} @media (prefers-color-scheme: dark) { :root {${dark}} }`;
}

const base: Track = {
  id: "demo",
  status: "ready",
  progress: 1,
  selected: true,
  title: "La berceuse du hérisson",
  artist: "Les Comptines du Jardin",
  duration: 30,
  audio: sample,
  cover: cover1,
  start: 0,
  end: 0,
};

const tracks: { label: string; track: Track }[] = [
  { label: "Loading, 0 %, no metadata yet", track: { ...base, id: "l0", status: "loading", progress: 0, selected: false, title: "", artist: "", cover: null } },
  { label: "Loading, 64 %", track: { ...base, id: "l64", status: "loading", progress: 0.64, selected: false, title: "", artist: "", cover: null } },
  { label: "Ready, untrimmed (hint visible)", track: { ...base, id: "ready" } },
  { label: "Ready, trimmed 4.0 s → 24.5 s", track: { ...base, id: "trim", cover: cover2, title: "Le petit train des nuages", artist: "Chorale des Lucioles", start: 4, end: 24.5 } },
  { label: "Ready, not selected", track: { ...base, id: "unsel", selected: false, cover: cover3, title: "Ronde de la pluie", artist: "Atelier Musique" } },
  { label: "Ready, no cover, long title", track: { ...base, id: "long", cover: null, title: "Histoire du soir : le voyage extraordinaire de la petite tortue qui voulait voir la mer avant l'hiver", artist: "Une chaîne avec un nom vraiment très long pour tester la troncature" } },
  { label: "Error, short message", track: { ...base, id: "err1", status: "error", selected: false, error: "Vidéo indisponible." } },
  { label: "Error, raw tool output", track: { ...base, id: "err2", status: "error", selected: false, title: "", artist: "", cover: null, error: "ERROR: [youtube] abcdefghijk: Sign in to confirm you're not a bot. Use --cookies-from-browser or --cookies for the authentication." } },
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="border-b pb-2 text-sm font-semibold text-muted-foreground">{title}</h2>
      {children}
    </section>
  );
}

function State({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

function LiveTrack({ initial }: { initial: Track }) {
  const [track, setTrack] = useState(initial);
  return <TrackCard track={track} onChange={(p) => setTrack((t) => ({ ...t, ...p }))} onRemove={() => setTrack(initial)} onRetry={() => setTrack({ ...initial, status: "loading", progress: 0 })} />;
}

function LivePaste({ existing = [], initial = [], cancel }: { existing?: string[]; initial?: string[]; cancel?: boolean }) {
  const [links, setLinks] = useState([...existing, ...initial]);
  const newCount = links.filter((id) => !existing.includes(id)).length;
  const changed = newCount > 0 || existing.some((id) => !links.includes(id));
  return (
    <div className="flex min-h-[420px] flex-col rounded-2xl border border-dashed">
      <PasteScreen
        links={links}
        newCount={newCount}
        changed={changed}
        onPasteText={(text) => {
          const ids = parseYoutubeIds(text);
          setLinks((l) => [...l, ...ids.filter((id) => !l.includes(id))]);
          return ids.length > 0;
        }}
        onRemoveLink={(id) => setLinks((l) => l.filter((x) => x !== id))}
        onExtract={() => setLinks(existing)}
        onCancel={cancel ? () => setLinks(existing) : undefined}
      />
    </div>
  );
}

function Gallery() {
  const [palette, setPalette] = useState(() => new URLSearchParams(location.search).get("palette") ?? "current");
  const choose = (name: string) => {
    setPalette(name);
    history.replaceState(null, "", `?palette=${name}`);
  };
  const p = palettes[palette];
  if (new URLSearchParams(location.search).get("view") === "app") {
    const shown = [tracks[1], tracks[3], tracks[2]];
    return (
      <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
        {p && <style>{paletteCss(p)}</style>}
        <AppHeader onAddLinks={() => {}} />
        <div className="min-h-0 flex-1 overflow-y-auto">
          <main className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-6 py-6">
            {shown.map(({ track }) => (
              <LiveTrack key={track.id} initial={track} />
            ))}
          </main>
        </div>
        <AppFooter count={2} busy={false} onDownload={() => {}} />
      </div>
    );
  }
  return (
    <div key={palette} className="min-h-screen bg-background pb-24 text-foreground">
      {p && <style>{paletteCss(p)}</style>}
      <div className="mx-auto flex max-w-5xl flex-col gap-12 px-6 py-10">
        <h1 className="text-2xl font-semibold">Sniptape — component gallery (dev only)</h1>
        <div className="flex flex-wrap gap-2">
          {Object.keys(palettes).map((name) => (
            <button
              key={name}
              onClick={() => choose(name)}
              className={`rounded-full border px-3 py-1 text-sm ${name === palette ? "border-primary-ui bg-primary text-primary-foreground" : "bg-card"}`}
            >
              {name}
            </button>
          ))}
        </div>

        <Section title="Header">
          <State label="Paste screen (no add button)">
            <AppHeader />
          </State>
          <State label="List mode">
            <AppHeader onAddLinks={() => {}} />
          </State>
        </Section>

        <Section title="Paste screen">
          <State label="First launch, empty (paste links here to try)">
            <LivePaste />
          </State>
          <State label="Links detected">
            <LivePaste initial={["abcdefghijk", "AbC-123_xyz", "q1w2e3r4t5y"]} />
          </State>
          <State label="Adding more links: 2 already in the list, Annuler visible (remove one to see Valider)">
            <LivePaste existing={["zyxwvutsrqp", "Mn0pQr5sT6u"]} cancel />
          </State>
        </Section>

        <Section title="Track card">
          {tracks.map(({ label, track }) => (
            <State key={track.id} label={label}>
              <LiveTrack initial={track} />
            </State>
          ))}
        </Section>

        <Section title="Footer">
          <State label="Nothing selected">
            <AppFooter count={0} busy={false} onDownload={() => {}} />
          </State>
          <State label="One selected">
            <AppFooter count={1} busy={false} onDownload={() => {}} />
          </State>
          <State label="Five selected">
            <AppFooter count={5} busy={false} onDownload={() => {}} />
          </State>
          <State label="Exporting">
            <AppFooter count={5} busy onDownload={() => {}} />
          </State>
        </Section>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(<Gallery />);
