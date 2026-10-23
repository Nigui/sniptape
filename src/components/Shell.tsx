import type { ComponentProps } from "react";
import { Download, Link2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AppHeader({ error, ...input }: { error: string | null } & ComponentProps<typeof Input>) {
  return (
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
            placeholder="Collez un ou plusieurs liens YouTube"
            {...input}
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </header>
  );
}

export function EmptyState() {
  return <p className="py-16 text-center text-muted-foreground">Collez des liens YouTube ci-dessus pour commencer.</p>;
}

export function AppFooter({ count, busy, onDownload }: { count: number; busy: boolean; onDownload: () => void }) {
  return (
    <footer className="sticky bottom-0 border-t bg-chrome px-6 py-3">
      <div className="mx-auto flex max-w-4xl items-center gap-3">
        <span className="text-sm text-muted-foreground">{count} {count > 1 ? "sélectionnés" : "sélectionné"}</span>
        <Button size="lg" className="ml-auto h-11 rounded-full px-6" disabled={!count || busy} onClick={onDownload}>
          {busy ? <Loader2 className="animate-spin" /> : <Download />}
          {count > 1 ? `Télécharger le ZIP (${count})` : "Télécharger le MP3"}
        </Button>
      </div>
    </footer>
  );
}
