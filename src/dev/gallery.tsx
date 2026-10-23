import { useState, type ReactNode } from "react";
import ReactDOM from "react-dom/client";
import "../index.css";
import { AppFooter, AppHeader, EmptyState } from "@/components/Shell";
import { TrackCard, type Track } from "@/components/TrackCard";
import sample from "./fixtures/sample.mp3?url";
import cover1 from "./fixtures/cover-1.svg?url";
import cover2 from "./fixtures/cover-2.svg?url";
import cover3 from "./fixtures/cover-3.svg?url";

Object.assign(window, { __TAURI_INTERNALS__: { convertFileSrc: (path: string) => path } });

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
  return <TrackCard track={track} onChange={(p) => setTrack((t) => ({ ...t, ...p }))} onRemove={() => setTrack(initial)} />;
}

function Gallery() {
  const [value, setValue] = useState("");
  return (
    <div className="min-h-screen bg-background pb-24 text-foreground">
      <div className="mx-auto flex max-w-5xl flex-col gap-12 px-6 py-10">
        <h1 className="text-2xl font-semibold">Sniptape — component gallery (dev only)</h1>

        <Section title="Header">
          <State label="Empty">
            <AppHeader error={null} value={value} onChange={(e) => setValue(e.target.value)} />
          </State>
          <State label="With text">
            <AppHeader error={null} value="https://www.youtube.com/watch?v=abcdefghijk" readOnly />
          </State>
          <State label="With error">
            <AppHeader error="Aucun nouveau lien YouTube trouvé." value="pas un lien" readOnly />
          </State>
        </Section>

        <Section title="Empty state">
          <EmptyState />
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
