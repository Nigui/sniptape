import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin, { type Region } from "wavesurfer.js/dist/plugins/regions.esm.js";
import { convertFileSrc } from "@tauri-apps/api/core";
import { Pause, Play, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { formatTime } from "@/lib/text";

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

export function TrackCard({ track, onChange, onRemove }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const wave = useRef<WaveSurfer | null>(null);
  const region = useRef<Region | null>(null);
  const [playing, setPlaying] = useState(false);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (track.status !== "ready" || !container.current) return;
    const regions = RegionsPlugin.create();
    const ws = WaveSurfer.create({
      container: container.current,
      url: convertFileSrc(track.audio),
      height: 72,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      waveColor: cssColor("--muted-foreground"),
      progressColor: cssColor("--primary"),
      cursorColor: cssColor("--primary"),
      plugins: [regions],
    });
    ws.on("decode", (duration) => {
      const r = regions.addRegion({
        start: 0,
        end: duration,
        drag: true,
        resize: true,
        color: "color-mix(in oklch, var(--primary) 18%, transparent)",
      });
      region.current = r;
      onChangeRef.current({ start: 0, end: duration, duration });
      r.on("update-end", () => onChangeRef.current({ start: r.start, end: r.end }));
    });
    ws.on("play", () => setPlaying(true));
    ws.on("pause", () => setPlaying(false));
    wave.current = ws;
    return () => {
      ws.destroy();
      wave.current = null;
      region.current = null;
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

  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={track.selected}
            disabled={track.status !== "ready"}
            onCheckedChange={(v) => onChange({ selected: v === true })}
            aria-label="Sélectionner pour le téléchargement"
          />
          {track.cover && (
            <img src={convertFileSrc(track.cover)} alt="" className="size-10 rounded-md object-cover" />
          )}
          <div className="grid flex-1 grid-cols-2 gap-2">
            <div className="grid gap-1">
              <Label htmlFor={`title-${track.id}`} className="text-xs text-muted-foreground">Titre</Label>
              <Input
                id={`title-${track.id}`}
                value={track.title}
                placeholder={track.id}
                onChange={(e) => onChange({ title: e.target.value })}
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor={`artist-${track.id}`} className="text-xs text-muted-foreground">Artiste</Label>
              <Input
                id={`artist-${track.id}`}
                value={track.artist}
                onChange={(e) => onChange({ artist: e.target.value })}
              />
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onRemove} aria-label="Retirer">
            <X />
          </Button>
        </div>

        {track.status === "loading" && (
          <div className="flex items-center gap-3">
            <Progress value={track.progress * 100} className="flex-1" />
            <Badge variant="secondary">{Math.round(track.progress * 100)}%</Badge>
          </div>
        )}

        {track.status === "error" && (
          <p className="text-sm text-destructive">{track.error}</p>
        )}

        {track.status === "ready" && (
          <>
            <div ref={container} />
            <div className="flex items-center gap-3 text-sm text-muted-foreground tabular-nums">
              <Button variant="outline" size="icon" onClick={togglePlay} aria-label={playing ? "Pause" : "Lecture"}>
                {playing ? <Pause /> : <Play />}
              </Button>
              <span>Début {formatTime(track.start)}</span>
              <span>Fin {formatTime(track.end)}</span>
              <span className="ml-auto">Durée {formatTime(track.end - track.start)}</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
