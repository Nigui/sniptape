import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin, { type Region } from "wavesurfer.js/dist/plugins/regions.esm.js";
import { convertFileSrc } from "@tauri-apps/api/core";
import { Music, Pause, Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { formatTime, parseTime } from "@/lib/text";
import { cn } from "@/lib/utils";

export type Track = {
  id: string;
  status: "loading" | "ready" | "error";
  progress: number;
  error?: string;
  selected: boolean;
  title: string;
  artist: string;
  duration: number;
  audio: string;
  cover: string | null;
  start: number;
  end: number;
};

type Props = {
  track: Track;
  onChange: (patch: Partial<Track>) => void;
  onRemove: () => void;
};

const cssColor = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

const pct = (t: number, duration: number) => (duration > 0 ? (t / duration) * 100 : 0);

const MIN_LENGTH = 0.5;

function TimeField(props: {
  label: string;
  trackTitle: string;
  value: number;
  onCommit: (t: number) => number;
  onHere: () => void;
}) {
  const { label, trackTitle, value, onCommit, onHere } = props;
  const [text, setText] = useState(formatTime(value));
  const [editing, setEditing] = useState(false);
  useEffect(() => {
    if (!editing) setText(formatTime(value));
  }, [value, editing]);

  const commit = () => {
    const t = parseTime(text);
    setText(formatTime(t === null ? value : onCommit(t)));
    setEditing(false);
  };

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <Input
        value={text}
        inputMode="decimal"
        aria-label={`${label} de « ${trackTitle} » (flèches : ±0,1 s, Maj : ±1 s)`}
        className="h-7 w-[4.5rem] rounded-md px-2 text-center text-xs md:text-xs"
        onFocus={() => setEditing(true)}
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") return e.currentTarget.blur();
          if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
          e.preventDefault();
          const step = (e.shiftKey ? 1 : 0.1) * (e.key === "ArrowUp" ? 1 : -1);
          setText(formatTime(onCommit((parseTime(text) ?? value) + step)));
        }}
      />
      <Button
        variant="ghost"
        size="xs"
        onClick={onHere}
        aria-label={`Placer le ${label.toLowerCase()} de « ${trackTitle} » à la position de lecture`}
      >
        Ici
      </Button>
    </div>
  );
}

const fieldClass =
  "h-auto text-ellipsis rounded-md border-transparent bg-transparent px-2 py-1 shadow-none hover:bg-muted focus-visible:bg-card dark:bg-transparent";

function Grip({ at, time, active, settle }: { at: number; time: number; active: boolean; settle: number }) {
  const bubble = at < 8 ? "left-0" : at > 92 ? "right-0" : "left-1/2 -translate-x-1/2";
  return (
    <div className="pointer-events-none absolute inset-y-0 w-0" style={{ left: `${at}%` }}>
      <div
        className={cn(
          "absolute -top-7 whitespace-nowrap rounded-full bg-foreground px-2 py-0.5 text-xs font-semibold text-background transition-opacity duration-150",
          bubble,
          active ? "opacity-100" : "opacity-0",
        )}
      >
        {formatTime(time)}
      </div>
      <div className="absolute inset-y-0 left-0 w-0.5 -translate-x-1/2 bg-primary-ui" />
      <div
        key={settle}
        className={cn(settle > 0 && "grip-settle", "absolute top-1/2 left-0 h-9 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary-ui bg-card shadow-card")}
      />
    </div>
  );
}

export function TrackCard({ track, onChange, onRemove }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const wave = useRef<WaveSurfer | null>(null);
  const region = useRef<Region | null>(null);
  const [playing, setPlaying] = useState(false);
  const [decoded, setDecoded] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [settle, setSettle] = useState({ start: 0, end: 0 });
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (track.status !== "ready" || !container.current) return;
    const regions = RegionsPlugin.create();
    const ws = WaveSurfer.create({
      container: container.current,
      url: convertFileSrc(track.audio),
      height: 88,
      barWidth: 3,
      barGap: 2,
      barRadius: 3,
      normalize: true,
      waveColor: cssColor("--primary"),
      progressColor: cssColor("--primary-strong"),
      cursorColor: cssColor("--foreground"),
      cursorWidth: 2,
      plugins: [regions],
    });
    ws.on("decode", (duration) => {
      const r = regions.addRegion({ start: 0, end: duration, drag: false, resize: true, color: "transparent" });
      region.current = r;
      setDecoded(true);
      onChangeRef.current({ start: 0, end: duration, duration });
      r.on("update", () => {
        setDragging(true);
        onChangeRef.current({ start: r.start, end: r.end });
      });
      let last = { start: 0, end: duration };
      r.on("update-end", () => {
        setDragging(false);
        const moved = Math.abs(r.start - last.start) > Math.abs(r.end - last.end) ? "start" : "end";
        last = { start: r.start, end: r.end };
        setSettle((s) => ({ ...s, [moved]: s[moved] + 1 }));
        onChangeRef.current({ start: r.start, end: r.end });
      });
    });
    const scheme = matchMedia("(prefers-color-scheme: dark)");
    const recolor = () =>
      ws.setOptions({
        waveColor: cssColor("--primary"),
        progressColor: cssColor("--primary-strong"),
        cursorColor: cssColor("--foreground"),
      });
    scheme.addEventListener("change", recolor);
    ws.on("play", () => setPlaying(true));
    ws.on("pause", () => setPlaying(false));
    wave.current = ws;
    return () => {
      scheme.removeEventListener("change", recolor);
      ws.destroy();
      wave.current = null;
      region.current = null;
      setDecoded(false);
    };
  }, [track.status, track.audio]);

  const togglePlay = () => {
    const ws = wave.current;
    const r = region.current;
    if (!ws || !r) return;
    if (ws.isPlaying()) return ws.pause();
    const t = ws.getCurrentTime();
    ws.play(t >= r.start && t < r.end ? t : r.start, r.end);
  };

  const setTrim = (which: "start" | "end", t: number) => {
    let { start, end } = track;
    if (which === "start") start = Math.min(Math.max(0, t), end - MIN_LENGTH);
    else end = Math.max(Math.min(track.duration, t), start + MIN_LENGTH);
    region.current?.setOptions({ start, end });
    onChange({ start, end });
    return which === "start" ? start : end;
  };

  const setTrimHere = (which: "start" | "end") => {
    const ws = wave.current;
    if (ws) setTrim(which, ws.getCurrentTime());
  };

  const name = track.title || track.id;
  const untrimmed = track.start < 0.05 && track.end > track.duration - 0.05;
  const loading = track.status === "loading";
  const start = pct(track.start, track.duration);
  const end = pct(track.end, track.duration);

  return (
    <article className="flex flex-col gap-4 rounded-2xl bg-card p-4 shadow-card">
      <div className="flex items-center gap-4">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-muted shadow-card">
          {track.cover ? (
            <img src={convertFileSrc(track.cover)} alt="" className="size-full object-cover" />
          ) : (
            <Music className="absolute inset-0 m-auto size-6 text-muted-foreground" aria-hidden />
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <Input
            aria-label={`Titre de la piste « ${name} »`}
            value={track.title}
            placeholder={loading ? "Chargement du titre…" : "Titre"}
            onChange={(e) => onChange({ title: e.target.value })}
            className={cn(fieldClass, "text-lg font-semibold md:text-lg")}
          />
          <Input
            aria-label={`Artiste de la piste « ${name} »`}
            value={track.artist}
            placeholder="Artiste"
            onChange={(e) => onChange({ artist: e.target.value })}
            className={cn(fieldClass, "text-muted-foreground")}
          />
        </div>

        {track.status === "ready" && decoded && (
          <div className="shrink-0 text-right">
            <div className="text-3xl font-semibold leading-none">{formatTime(track.end - track.start)}</div>
            <div className="mt-1 text-xs text-muted-foreground">sur {formatTime(track.duration)}</div>
          </div>
        )}

        <div className="flex shrink-0 items-center gap-1 self-start">
          <Checkbox
            checked={track.selected}
            disabled={track.status !== "ready"}
            onCheckedChange={(v) => onChange({ selected: v === true })}
            aria-label={`Sélectionner « ${name} »`}
            className="mx-2"
          />
          <Button variant="ghost" size="icon" onClick={onRemove} aria-label={`Retirer « ${name} »`}>
            <X />
          </Button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Progress value={track.progress * 100} className="h-1.5 flex-1" />
          <span className="w-28 text-right">Extraction… {Math.round(track.progress * 100)} %</span>
        </div>
      )}

      {track.status === "error" && <p className="text-sm text-destructive">{track.error}</p>}

      {track.status === "ready" && (
        <div className="flex items-center gap-4">
          <Button
            size="icon-lg"
            onClick={togglePlay}
            aria-label={`${playing ? "Pause" : "Écouter"} « ${name} »`}
            className="shrink-0 rounded-full"
          >
            {playing ? <Pause className="fill-current" /> : <Play className="fill-current" />}
          </Button>
          <div className="relative flex-1">
            <div className="relative" role="group" aria-label={`Découpe de « ${name} »`}>
              {decoded && (
                <div
                  className="pointer-events-none absolute inset-y-0 rounded-md bg-primary/10"
                  style={{ left: `${start}%`, width: `${end - start}%` }}
                />
              )}
              <div ref={container} className={cn("wave relative origin-center", decoded && "wave-enter")} />
              {decoded && (
                <>
                  <div className="pointer-events-none absolute inset-y-0 left-0 bg-trim-dim" style={{ width: `${start}%` }} />
                  <div className="pointer-events-none absolute inset-y-0 right-0 bg-trim-dim" style={{ width: `${100 - end}%` }} />
                  <Grip at={start} time={track.start} active={dragging} settle={settle.start} />
                  <Grip at={end} time={track.end} active={dragging} settle={settle.end} />
                </>
              )}
            </div>
            <div className="mt-2 flex items-center justify-between gap-4">
              <TimeField label="Début" trackTitle={name} value={track.start} onCommit={(t) => setTrim("start", t)} onHere={() => setTrimHere("start")} />
              {decoded && untrimmed && (
                <p className="text-center text-xs text-muted-foreground">
                  Faites glisser les poignées orange pour couper le début et la fin.
                </p>
              )}
              <TimeField label="Fin" trackTitle={name} value={track.end} onCommit={(t) => setTrim("end", t)} onHere={() => setTrimHere("end")} />
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
