import type { ComponentProps } from "react";
import { Download, Link2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AppHeader({ error, ...input }: { error: string | null } & ComponentProps<typeof Input>) {
  return (
    <header className="sticky top-0 z-10 border-b bg-chrome px-6 py-4">
      <div className="mx-auto flex max-w-4xl flex-col gap-3">
        <h1 className="flex items-center gap-2 text-lg font-semibold">
          <svg viewBox="34 40 188 176" className="size-6 text-primary" aria-hidden>
            <path fill="currentColor" fillRule="evenodd" d="M72 96.0 A56.0 56.0 0 0 1 184 96.0 V160.0 A56.0 56.0 0 0 1 72 160.0 Z M102.0 102.0 A10.0 10.0 0 0 1 122.0 102.0 V154.0 A10.0 10.0 0 0 1 102.0 154.0 Z M134.0 86.0 A10.0 10.0 0 0 1 154.0 86.0 V170.0 A10.0 10.0 0 0 1 134.0 170.0 Z M34.0 104.0 A12.0 12.0 0 0 1 58.0 104.0 V152.0 A12.0 12.0 0 0 1 34.0 152.0 Z M198.0 104.0 A12.0 12.0 0 0 1 222.0 104.0 V152.0 A12.0 12.0 0 0 1 198.0 152.0 Z" />
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
