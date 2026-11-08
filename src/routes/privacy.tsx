import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
import { useLegal } from "@/lib/legal-copy";

export const Route = createFileRoute("/privacy")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Datenschutzerklärung / Privacy policy – Offer Ready" },
      { name: "description", content: "Wie Offer Ready Lebensläufe, Interview-Transkripte und Kontodaten nach Schweizer DSG und DSGVO bearbeitet. Video bleibt im Browser, Audio wird nicht gespeichert." },
      { property: "og:title", content: "Datenschutzerklärung / Privacy policy – Offer Ready" },
      { property: "og:description", content: "How Offer Ready processes your CV, interview transcripts and account data under Swiss revFADP and GDPR." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const { L } = useLegal();
  const P = L.privacy;
  return (
    <LegalPage>
      <p className="inline-flex rounded-full border border-border px-3 py-1 text-xs font-semibold">
        {P.version}
      </p>
      <h1 className="mt-4 font-display text-3xl font-semibold">{P.title}</h1>
      <p className="mt-1 text-xs text-muted-foreground">{P.updated}</p>
      {P.sections.map((s) => (
        <section key={s.h} className="mt-8">
          <h2 className="text-lg font-semibold">{s.h}</h2>
          {s.li && (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-muted-foreground">
              {s.li.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
          {s.p?.map((p) => (
            <p key={p} className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {p}
            </p>
          ))}
        </section>
      ))}
    </LegalPage>
  );
}
