import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin, { type Region } from "wavesurfer.js/dist/plugins/regions.esm.js";
import { convertFileSrc } from "@tauri-apps/api/core";
import { openUrl } from "@tauri-apps/plugin-opener";
import { ArrowLeftToLine, ArrowRightToLine, Loader2, Music, Pause, Play, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Tooltip } from "@/components/ui/tooltip";
import { TrimEndIcon, TrimStartIcon } from "@/components/icons";
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

const isMac = navigator.userAgent.includes("Mac");
const MOD = isMac ? "⌘" : "Ctrl+";
const REMOVE_KEY = isMac ? "⌘⌫" : "Ctrl+Suppr";
const SHORTCUTS = ["Space", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "T", "A"]
  .concat(["ArrowLeft", "ArrowRight", "Enter", isMac ? "Backspace" : "Delete"].map((k) => `${isMac ? "Meta" : "Control"}+${k}`))
  .join(" ");
const isMod = (e: React.KeyboardEvent) => (isMac ? e.metaKey : e.ctrlKey);
const isRemove = (e: React.KeyboardEvent) => isMod(e) && (e.key === "Backspace" || e.key === "Delete");
const cardClass = "rounded-2xl bg-card shadow-card outline-none focus-visible:ring-2 focus-visible:ring-primary-ui";

function PositionField({ value, label, onCommit }: { value: number; label: string; onCommit: (t: number) => void }) {
  const [text, setText] = useState(formatTime(value));
  const [editing, setEditing] = useState(false);
  useEffect(() => {
    if (!editing) setText(formatTime(value));
  }, [value, editing]);

  const commit = () => {
    const t = parseTime(text);
    if (t !== null) onCommit(t);
    setEditing(false);
  };

  return (
    <Input
      tabIndex={-1}
      value={text}
      inputMode="decimal"
      aria-label={`${label} (flèches : ±0,1 s, Maj : ±1 s)`}
      className="h-8 w-20 rounded-md px-2 text-center text-sm md:text-sm"
      onFocus={() => setEditing(true)}
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") return e.currentTarget.blur();
        if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
        e.preventDefault();
        const next = (parseTime(text) ?? value) + (e.shiftKey ? 1 : 0.1) * (e.key === "ArrowUp" ? 1 : -1);
        setText(formatTime(Math.max(0, next)));
        onCommit(next);
      }}
    />
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
  const [position, setPosition] = useState(0);
  const positionRef = useRef(0);
  const cardRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const artistRef = useRef<HTMLInputElement>(null);
  const editStart = useRef("");
  positionRef.current = position;
  const [advanced, setAdvanced] = useState(false);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const trimRef = useRef({ start: track.start, end: track.end });
  trimRef.current = { start: track.start, end: track.end };

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
      cursorWidth: 0,
      interact: false,
      plugins: [regions],
    });
    ws.on("decode", (duration) => {
      const kept = trimRef.current;
      const end = kept.end > 0 ? Math.min(kept.end, duration) : duration;
      const start = Math.min(kept.start, end);
      const r = regions.addRegion({ start, end, drag: false, resize: true, color: "transparent" });
      region.current = r;
      setDecoded(true);
      onChangeRef.current({ start, end, duration });
      r.on("update", () => {
        setDragging(true);
        onChangeRef.current({ start: r.start, end: r.end });
      });
      let last = { start, end };
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
      });
    scheme.addEventListener("change", recolor);
    ws.on("timeupdate", (t) => setPosition(t));
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

  const seek = (t: number) => {
    const clamped = Math.min(Math.max(0, t), track.duration);
    wave.current?.setTime(clamped);
    positionRef.current = clamped;
    setPosition(clamped);
  };

  const sourceUrl = `https://www.youtube.com/watch?v=${track.id}`;
  const openSource = () => {
    openUrl(sourceUrl).catch(() => window.open(sourceUrl, "_blank"));
  };

  const sourceLabel = sourceUrl.replace("https://www.", "");
  const sourceLink = (
    <a
      tabIndex={-1}
      href={sourceUrl}
      onClick={(e) => {
        e.preventDefault();
        openSource();
      }}
      className="relative truncate text-xs text-muted-foreground underline-offset-2 hover:underline"
    >
      {sourceLabel}
    </a>
  );

  if (track.status === "loading")
    return (
      <article
        tabIndex={0}
        aria-busy
        aria-keyshortcuts={isMac ? "Meta+Backspace" : "Control+Delete"}
        onKeyDown={(e) => {
          if (e.target !== e.currentTarget || !isRemove(e)) return;
          e.preventDefault();
          onRemove();
        }}
        className={cn(cardClass, "relative flex items-center gap-3 overflow-hidden py-2 pr-2 pl-4")}>
        <div
          role="progressbar"
          aria-label={`Extraction de ${sourceLabel}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(track.progress * 100)}
          className="absolute inset-y-0 left-0 bg-accent transition-[width] duration-500 ease-out"
          style={{ width: `${track.progress * 100}%` }}
        />
        <Loader2 className="relative size-4 shrink-0 text-primary-ui motion-safe:animate-spin" aria-hidden />
        {sourceLink}
        <Button tabIndex={-1} variant="ghost" size="icon" className="relative ml-auto" onClick={onRemove} aria-label={`Retirer ${sourceLabel}`}>
          <X />
        </Button>
      </article>
    );

  const name = track.title || track.id;
  const startSynced = Math.abs(position - track.start) < 0.05;
  const endSynced = Math.abs(position - track.end) < 0.05;
  const start = pct(track.start, track.duration);
  const end = pct(track.end, track.duration);
  const canCutStart = !startSynced && position <= track.end - MIN_LENGTH;
  const canCutEnd = !endSynced && position >= track.start + MIN_LENGTH;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.target !== e.currentTarget) return;
    const key = e.key.toLowerCase();
    const plain = !e.metaKey && !e.ctrlKey && !e.altKey;
    if (isRemove(e)) onRemove();
    else if (plain && (key === "t" || key === "a")) {
      const input = (key === "t" ? titleRef : artistRef).current;
      editStart.current = key === "t" ? track.title : track.artist;
      input?.focus();
      input?.select();
    }
    else if (track.status !== "ready") return;
    else if (e.key === " ") togglePlay();
    else if (e.key === "Enter" && isMod(e)) onChange({ selected: !track.selected });
    else if (decoded && (e.key === "ArrowUp" || e.key === "ArrowDown")) seek(e.key === "ArrowUp" ? track.start : track.end);
    else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      if (!decoded) return;
      const left = e.key === "ArrowLeft";
      if (isMod(e)) {
        if (left ? canCutStart : canCutEnd) setTrim(left ? "start" : "end", position);
      } else seek(positionRef.current + (e.shiftKey ? 0.1 : 1) * (left ? -1 : 1));
    } else return;
    e.preventDefault();
  };

  return (
    <article
      tabIndex={0}
      aria-label={name}
      ref={cardRef}
      aria-keyshortcuts={SHORTCUTS}
      onKeyDown={onKeyDown}
      className={cn(cardClass, "flex flex-col gap-4 p-4")}
    >
      <div className="flex items-center gap-4">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-muted shadow-card">
          {track.cover ? (
            <img src={convertFileSrc(track.cover)} alt="" className="size-full object-cover" />
          ) : (
            <Music className="absolute inset-0 m-auto size-6 text-muted-foreground" aria-hidden />
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          {(["title", "artist"] as const).map((field) => (
            <Tooltip key={field} className="flex" label={field === "title" ? "Modifier le titre (T)" : "Modifier l’artiste (A)"}>
              <Input
                ref={field === "title" ? titleRef : artistRef}
                tabIndex={-1}
                aria-label={`${field === "title" ? "Titre" : "Artiste"} de la piste « ${name} »`}
                value={track[field]}
                placeholder={field === "title" ? "Titre" : "Artiste"}
                onFocus={() => (editStart.current = track[field])}
                onChange={(e) => onChange({ [field]: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key !== "Enter" && e.key !== "Escape") return;
                  e.preventDefault();
                  if (e.key === "Escape") onChange({ [field]: editStart.current });
                  cardRef.current?.focus();
                }}
                className={cn(fieldClass, field === "title" ? "text-lg font-semibold md:text-lg" : "text-muted-foreground")}
              />
            </Tooltip>
          ))}
          <div className="flex px-2">{sourceLink}</div>
        </div>

        {track.status === "ready" && decoded && (
          <div className="shrink-0 text-right">
            <div className="text-3xl font-semibold leading-none">{formatTime(track.end - track.start)}</div>
            <div className="mt-1 text-xs text-muted-foreground">sur {formatTime(track.duration)}</div>
          </div>
        )}

        <div className="flex shrink-0 items-center gap-1 self-start">
          <Tooltip label={`${track.selected ? "Désélectionner" : "Sélectionner"} (${MOD}Entrée)`}>
            <Checkbox
              tabIndex={-1}
              checked={track.selected}
              disabled={track.status !== "ready"}
              onCheckedChange={(v) => onChange({ selected: v === true })}
              aria-label={`Sélectionner « ${name} »`}
              className="mx-2"
            />
          </Tooltip>
          <Tooltip label={`Retirer (${REMOVE_KEY})`}>
            <Button tabIndex={-1} variant="ghost" size="icon" onClick={onRemove} aria-label={`Retirer « ${name} »`}>
              <X />
            </Button>
          </Tooltip>
        </div>
      </div>

      {track.status === "error" && <p className="text-sm text-destructive">{track.error}</p>}

      {track.status === "ready" && (
        <div className="flex flex-col gap-3 select-none">
          <div className="flex items-center gap-4">
            <Tooltip label={`${playing ? "Pause" : "Écouter"} (Espace)`}>
              <Button
                tabIndex={-1}
                size="icon-lg"
                onClick={togglePlay}
                aria-label={`${playing ? "Pause" : "Écouter"} « ${name} »`}
                className="shrink-0 rounded-full"
              >
                {playing ? <Pause className="fill-current" /> : <Play className="fill-current" />}
              </Button>
            </Tooltip>
            <div className="relative flex-1" role="group" aria-label={`Découpe de « ${name} »`}>
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
            <div className="w-8 shrink-0" />
          </div>

          <div className="flex items-center gap-4">
            <div className="w-9 shrink-0" />
            <Slider
              tabIndex={-1}
              thumbLabel="Position (← →, Maj : ±0,1 s)"
              className="flex-1"
              min={0}
              max={track.duration || 1}
              step={0.1}
              value={[position]}
              onValueChange={([v]) => seek(v)}
              disabled={!decoded}
              aria-label={`Position de lecture de « ${name} »`}
            />
            <Button
              tabIndex={-1}
              variant="ghost"
              size="icon-sm"
              className={cn("shrink-0", advanced ? "text-primary-ui" : "text-muted-foreground")}
              onClick={() => setAdvanced((a) => !a)}
              aria-expanded={advanced}
              aria-label={`Réglage précis de « ${name} »`}
            >
              <SlidersHorizontal />
            </Button>
          </div>

          {advanced && (
            <div className="flex flex-wrap items-center gap-2 pl-13">
              <span className="text-sm text-muted-foreground">Position</span>
              <PositionField value={position} label={`Position de lecture de « ${name} »`} onCommit={seek} />
              {[
                { label: "Aller au début", keys: "↑", icon: <ArrowLeftToLine />, disabled: startSynced, run: () => seek(track.start) },
                { label: "Aller à la fin", keys: "↓", icon: <ArrowRightToLine />, disabled: endSynced, run: () => seek(track.end) },
                null,
                { label: "Couper avant", keys: `${MOD}←`, icon: <TrimStartIcon />, disabled: !canCutStart, run: () => setTrim("start", position) },
                { label: "Couper après", keys: `${MOD}→`, icon: <TrimEndIcon />, disabled: !canCutEnd, run: () => setTrim("end", position) },
              ].map((a, i) =>
                a ? (
                  <Tooltip key={a.label} label={`${a.label} (${a.keys})`}>
                    <Button tabIndex={-1} variant="ghost" size="icon-sm" disabled={a.disabled} onClick={a.run} aria-label={a.label}>
                      {a.icon}
                    </Button>
                  </Tooltip>
                ) : (
                  <span key={i} className="mx-1 h-5 w-px bg-border" aria-hidden />
                ),
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
