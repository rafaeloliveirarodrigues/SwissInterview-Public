import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Download, Loader2, ShieldCheck, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { deleteAccount } from "@/lib/prep.functions";
import { exportMyData, getConsentStatus } from "@/lib/privacy.functions";
import { useLegal } from "@/lib/legal-copy";
import { UI_LOCALES } from "@/lib/app-i18n";

export const Route = createFileRoute("/_authenticated/privacy-data")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Privacy & data — Offer Ready" },
      { name: "description", content: "Download your data or delete your Offer Ready account." },
      { property: "og:title", content: "Privacy & data — Offer Ready" },
      { property: "og:description", content: "Download your data or delete your account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrivacyDataPage,
});

function PrivacyDataPage() {
  const { L, lang } = useLegal();
  const D = L.data;
  const navigate = useNavigate();
  const exportData = useServerFn(exportMyData);
  const removeAccount = useServerFn(deleteAccount);
  const status = useServerFn(getConsentStatus);
  const [busy, setBusy] = useState<"export" | "delete" | null>(null);
  const [consent, setConsent] = useState<{ version: number | null; consentAt: string | null } | null>(null);

  useEffect(() => {
    status().then(setConsent).catch(() => undefined);
  }, [status]);

  async function download() {
    setBusy("export");
    try {
      const data = await exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `offer-ready-data-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30_000);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed.");
    } finally {
      setBusy(null);
    }
  }

  async function remove() {
    if (!confirm(D.deleteConfirm)) return;
    setBusy("delete");
    try {
      await removeAccount();
      await supabase.auth.signOut();
      toast.success(D.deleted);
      navigate({ to: "/" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not delete your account.");
      setBusy(null);
    }
  }

  return (
    <AppShell>
      <h1 className="font-display text-3xl font-semibold">{D.title}</h1>
      <p className="mt-2 text-muted-foreground">{D.intro}</p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <section className="rounded-2xl border border-border bg-card p-5">
          <Download className="h-5 w-5 text-primary" />
          <h2 className="mt-3 font-semibold">{D.downloadH}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{D.downloadBody}</p>
          <Button className="mt-4" onClick={download} disabled={busy !== null}>
            {busy === "export" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {D.downloadBtn}
          </Button>
        </section>
        <section className="rounded-2xl border border-border bg-card p-5">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h2 className="mt-3 font-semibold">{D.policyH}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{D.policyBody}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            {consent?.consentAt && consent.version
              ? D.consentOn
                  .replace("{version}", String(consent.version))
                  .replace("{date}", new Date(consent.consentAt).toLocaleDateString(UI_LOCALES[lang]))
              : consent
                ? D.noConsent
                : ""}
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/privacy">{L.footer.privacy}</Link>
          </Button>
        </section>
        <section className="rounded-2xl border border-destructive/40 bg-card p-5">
          <Trash2 className="h-5 w-5 text-destructive" />
          <h2 className="mt-3 font-semibold">{D.deleteH}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{D.deleteBody}</p>
          <Button variant="destructive" className="mt-4" onClick={remove} disabled={busy !== null}>
            {busy === "delete" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {D.deleteBtn}
          </Button>
        </section>
      </div>
    </AppShell>
  );
}
