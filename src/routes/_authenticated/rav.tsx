import { useAppTranslations } from "@/lib/app-i18n";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { RavPanel } from "@/components/RavPanel";
export const Route = createFileRoute("/_authenticated/rav")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Monthly RAV applications — Offer Ready" },
      {
        name: "description",
        content:
          "Track actual job applications and download your monthly Arbeitsbemühungen preparation report.",
      },
      { property: "og:title", content: "Monthly RAV applications — Offer Ready" },
      {
        property: "og:description",
        content: "Your monthly job-search ledger and report download.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RavPage,
});
function RavPage() {
  const { t } = useAppTranslations();
  return (
    <AppShell>
      <h1 className="text-2xl font-semibold">{t("Your job-search record")}</h1>
      <RavPanel />
    </AppShell>
  );
}
