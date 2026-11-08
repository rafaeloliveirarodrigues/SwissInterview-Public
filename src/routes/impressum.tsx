import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
import { useLegal } from "@/lib/legal-copy";
import { CONTROLLER } from "@/lib/privacy";

export const Route = createFileRoute("/impressum")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Impressum / Legal notice – Offer Ready" },
      { name: "description", content: "Impressum und rechtliche Hinweise von Offer Ready (swissinterview.com), betrieben von Rafael Rodrigues, Kloten." },
      { property: "og:title", content: "Impressum / Legal notice – Offer Ready" },
      { property: "og:description", content: "Legal notice and contact for Offer Ready (swissinterview.com)." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ImpressumPage,
});

function ImpressumPage() {
  const { L } = useLegal();
  const I = L.impressum;
  return (
    <LegalPage>
      <h1 className="font-display text-3xl font-semibold">{I.title}</h1>
      <h2 className="mt-8 text-lg font-semibold">{I.responsible}</h2>
      <address className="mt-2 not-italic leading-relaxed text-muted-foreground">
        {CONTROLLER.name}
        <br />
        {CONTROLLER.street}
        <br />
        {CONTROLLER.city}
        <br />
        {CONTROLLER.country}
      </address>
      <h2 className="mt-6 text-lg font-semibold">{I.contact}</h2>
      <p className="mt-2 text-muted-foreground">
        <a className="underline" href={`mailto:${CONTROLLER.email}`}>
          {CONTROLLER.email}
        </a>
      </p>
      <h2 className="mt-6 text-lg font-semibold">{I.disclaimerH}</h2>
      {I.disclaimer.map((p, i) => (
        <p key={i} className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {p}
        </p>
      ))}
    </LegalPage>
  );
}
