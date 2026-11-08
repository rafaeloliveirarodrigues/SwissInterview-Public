import { Check, ChevronDown, Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UI_LANGS, useUiLang } from "@/lib/landing-i18n";
const LANGUAGE_LABEL = { en: "Language", de: "Sprache", fr: "Langue", it: "Lingua" };

/**
 * Compact language picker: a single button showing the active language,
 * opening a short menu. Fits next to other header actions on mobile.
 */
export function LanguageMenu() {
  const [lang, setLang] = useUiLang();
  const active = UI_LANGS.find((l) => l.code === lang) ?? {
    code: "en" as const,
    label: "EN",
    name: "English",
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`${LANGUAGE_LABEL[lang]}: ${active.name}`}
        className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Globe className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
        <span aria-hidden="true">{active.label}</span>
        <span className="sr-only">{active.name}</span>
        <ChevronDown className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        {UI_LANGS.map((l) => (
          <DropdownMenuItem
            key={l.code}
            lang={l.code}
            aria-current={lang === l.code ? "true" : undefined}
            onSelect={() => setLang(l.code)}
            className="justify-between"
          >
            <span>
              <span className="text-xs text-muted-foreground tabular-nums">{l.label}</span>
              <span className="ml-2">{l.name}</span>
            </span>
            {lang === l.code ? (
              <Check className="h-4 w-4 text-primary" aria-label="Active language" />
            ) : (
              <Check className="h-4 w-4 opacity-0" aria-hidden="true" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
