import { useState } from "react";
import { AudioLines, Download, Link2, Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AppHeader({ onAddLinks }: { onAddLinks?: () => void }) {
  return (
    <header className="sticky top-0 z-10 border-b bg-chrome px-6 py-3">
      <div className="mx-auto flex max-w-4xl items-center gap-3">
        <h1 className="flex items-center gap-2 text-lg font-semibold">
          <svg viewBox="34 40 188 176" className="size-6 text-primary" aria-hidden>
            <path fill="currentColor" fillRule="evenodd" d="M72 96.0 A56.0 56.0 0 0 1 184 96.0 V160.0 A56.0 56.0 0 0 1 72 160.0 Z M102.0 102.0 A10.0 10.0 0 0 1 122.0 102.0 V154.0 A10.0 10.0 0 0 1 102.0 154.0 Z M134.0 86.0 A10.0 10.0 0 0 1 154.0 86.0 V170.0 A10.0 10.0 0 0 1 134.0 170.0 Z M34.0 104.0 A12.0 12.0 0 0 1 58.0 104.0 V152.0 A12.0 12.0 0 0 1 34.0 152.0 Z M198.0 104.0 A12.0 12.0 0 0 1 222.0 104.0 V152.0 A12.0 12.0 0 0 1 198.0 152.0 Z" />
          </svg>
          Sniptape
        </h1>
        {onAddLinks && (
          <Button variant="outline" className="ml-auto rounded-full" onClick={onAddLinks}>
            <Plus />
            Ajouter des liens
          </Button>
        )}
      </div>
    </header>
  );
}

type PasteScreenProps = {
  links: string[];
  newCount: number;
  changed: boolean;
  onPasteText: (text: string) => boolean;
  onRemoveLink: (id: string) => void;
  onExtract: () => void;
  onCancel?: () => void;
};

export function PasteScreen({ links, newCount, changed, onPasteText, onRemoveLink, onExtract, onCancel }: PasteScreenProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = (text: string) => {
    if (onPasteText(text)) {
      setValue("");
      setError(null);
      return true;
    }
    return false;
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-6 px-6 py-12">
      <div className="flex flex-col gap-2 text-center">
        <h2 className="text-2xl font-semibold">Ajoutez des vidéos YouTube</h2>
        <p className="text-muted-foreground">Collez un ou plusieurs liens, puis lancez l’extraction.</p>
      </div>

      <div className="flex flex-col gap-2">
        <div className="relative">
          <Link2 className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            autoFocus
            aria-label="Liens YouTube"
            placeholder="https://www.youtube.com/watch?v=…"
            className="h-14 rounded-2xl border-transparent bg-card pl-12 text-base shadow-card md:text-base dark:bg-card"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onPaste={(e) => {
              if (submit(e.clipboardData.getData("text"))) e.preventDefault();
            }}
            onKeyDown={(e) => {
              if (e.key !== "Enter" || !value.trim()) return;
              if (!submit(value)) setError("Aucun lien YouTube trouvé.");
            }}
          />
        </div>
        {error && <p className="px-1 text-sm text-destructive">{error}</p>}
      </div>

      {links.length > 0 && (
        <ul className="flex flex-wrap justify-center gap-2" aria-label="Liens détectés">
          {links.map((id) => (
            <li
              key={id}
              className="flex items-center gap-1.5 rounded-full bg-accent py-1 pr-1 pl-3 text-sm text-accent-foreground"
            >
              <AudioLines className="size-4 text-primary-ui" aria-hidden />
              youtu.be/{id}
              <Button
                variant="ghost"
                size="icon-xs"
                className="rounded-full"
                onClick={() => onRemoveLink(id)}
                aria-label={`Retirer le lien youtu.be/${id}`}
              >
                <X />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex justify-center gap-3">
        {onCancel && (
          <Button variant="ghost" size="lg" className="h-11 rounded-full px-6" onClick={onCancel}>
            Annuler
          </Button>
        )}
        <Button size="lg" className="h-11 rounded-full px-6" disabled={!changed} onClick={onExtract}>
          {newCount > 0 ? `Extraire l’audio (${newCount})` : changed ? "Valider" : "Extraire l’audio"}
        </Button>
      </div>
    </div>
  );
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
