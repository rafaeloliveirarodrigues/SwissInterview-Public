import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FileText, Mic, Building2, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import interviewer from "@/assets/interviewer.jpg";
import { LANDING, useUiLang } from "@/lib/landing-i18n";
import { LanguageMenu } from "@/components/LanguageMenu";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Vorstellungsgespräch vorbereiten mit KI – Offer Ready" },
      {
        name: "description",
        content:
          "Lebenslauf und Stellenanzeige hochladen: Offer Ready recherchiert das Unternehmen, führt ein gesprochenes Interview und bewertet deine Antworten.",
      },
      {
        property: "og:title",
        content: "Vorstellungsgespräch vorbereiten mit KI – Offer Ready",
      },
      {
        property: "og:description",
        content:
          "Lebenslauf und Stellenanzeige hochladen: Offer Ready recherchiert das Unternehmen, führt ein gesprochenes Interview und bewertet deine Antworten.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://swissinterview.com/" },
      { property: "og:image", content: "https://swissinterview.com/og-image.jpg" },
      { name: "twitter:image", content: "https://swissinterview.com/og-image.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const icons = [FileText, Building2, Mic, BarChart3];

function Landing() {
  const { user } = useAuth();
  const [lang, setLang] = useUiLang();
  const t = LANDING[lang];

  return (
    <main className="min-h-screen surface-grid">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="font-display text-lg font-semibold tracking-tight">Offer Ready</span>
        <div className="flex items-center gap-2">
          <LanguageMenu />
          <Button asChild variant="ghost" size="sm">
            <Link to={user ? "/dashboard" : "/auth"}>{user ? t.dashboard : t.signIn}</Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-16 pt-10 lg:grid-cols-2 lg:pt-20">
        <div>
          <p className="mb-4 inline-flex rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            {t.tagline}
          </p>
          <h1 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">
            {t.h1a}{" "}
            <span className="text-primary">{t.h1b}</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
            {t.intro}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to={user ? "/new" : "/auth"}>
                {t.start} <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to={user ? "/dashboard" : "/auth"}>{t.history}</Link>
            </Button>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md">
          <div className="absolute -inset-4 rounded-[2rem] bg-primary/10 blur-2xl" />
          <img
            src={interviewer}
            alt={t.alt}
            width={816}
            height={816}
            className="relative w-full rounded-[1.75rem] border border-border object-cover shadow-2xl"
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.steps.map((step, i) => {
            const Icon = icons[i] ?? FileText;
            return (
            <div key={i} className="rounded-2xl border border-border bg-card p-5">
              <Icon className="h-5 w-5 text-primary" />
              <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t.step} {i + 1}
              </p>
              <h2 className="mt-1 text-base font-semibold">{step.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </div>
            );
          })}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
