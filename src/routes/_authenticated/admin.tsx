import { useAppTranslations } from "@/lib/app-i18n";
import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { adminCreateCode, adminListCodes, adminToggleCode } from "@/lib/credits.functions";
import { useCredits } from "@/components/CreditsPanel";
import { CREDITS } from "@/lib/swiss-cv";

export const Route = createFileRoute("/_authenticated/admin")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Promo codes — Offer Ready" },
      { name: "description", content: "Create and manage event promo codes for Offer Ready." },
      { property: "og:title", content: "Promo codes — Offer Ready" },
      { property: "og:description", content: "Manage event promo codes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { t, locale } = useAppTranslations();

  const credits = useCredits();
  const list = useServerFn(adminListCodes);
  const create = useServerFn(adminCreateCode);
  const toggle = useServerFn(adminToggleCode);
  const qc = useQueryClient();
  const isAdmin = !!credits.data?.isAdmin;
  const codes = useQuery({ queryKey: ["promo-codes"], queryFn: () => list(), enabled: isAdmin });

  const [code, setCode] = useState("");
  const [grants, setGrants] = useState(String(CREDITS.promoGrant));
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [note, setNote] = useState("");

  const createM = useMutation({
    mutationFn: () =>
      create({
        data: {
          code,
          grants: Number(grants),
          maxUses: maxUses ? Number(maxUses) : null,
          expiresAt: expiresAt ? new Date(expiresAt + "T23:59:59").toISOString() : null,
          note,
        },
      }),
    onSuccess: () => {
      toast.success(t("Code created."));
      setCode("");
      setNote("");
      qc.invalidateQueries({ queryKey: ["promo-codes"] });
    },
    onError: (e) =>
      toast.error(e instanceof Error ? t(e.message) : t("Could not create the code.")),
  });

  const toggleM = useMutation({
    mutationFn: (v: { id: string; active: boolean }) => toggle({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["promo-codes"] }),
  });

  if (credits.isLoading)
    return (
      <AppShell>
        <Loader2 className="h-5 w-5 animate-spin" />
      </AppShell>
    );
  if (!isAdmin)
    return (
      <AppShell>
        <p className="text-sm text-muted-foreground">
          {t("This page is only for the site owner.")}
        </p>
        <Link to="/dashboard" className="mt-4 inline-block text-sm text-primary">
          {t("Back to dashboard")}
        </Link>
      </AppShell>
    );

  return (
    <AppShell>
      <h1 className="text-2xl font-semibold">{t("Promo codes")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {t("Give these out at events. Each person can use a code once.")}
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          createM.mutate();
        }}
        className="mt-8 grid gap-4 rounded-2xl border border-border bg-card p-6 sm:grid-cols-2"
      >
        <div className="space-y-2">
          <Label htmlFor="code">{t("Code")}</Label>
          <Input
            id="code"
            required
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="SWISSCAREER26"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="grants">{t("Interviews it adds")}</Label>
          <Input
            id="grants"
            type="number"
            min={1}
            max={50}
            value={grants}
            onChange={(e) => setGrants(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="max">{t("Total uses (optional)")}</Label>
          <Input
            id="max"
            type="number"
            min={1}
            value={maxUses}
            onChange={(e) => setMaxUses(e.target.value)}
            placeholder={t("No limit")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="exp">{t("Expires (optional)")}</Label>
          <Input
            id="exp"
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="note">{t("Note (optional)")}</Label>
          <Input
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="ISA Career Circle, Zurich"
          />
        </div>
        <Button type="submit" disabled={createM.isPending} className="sm:col-span-2">
          {createM.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{" "}
          {t("Create code")}
        </Button>
      </form>

      <div className="mt-8 space-y-3">
        {(codes.data ?? []).map((c) => (
          <div
            key={c.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3"
          >
            <div>
              <p className="font-mono font-semibold">{c.code}</p>
              <p className="text-xs text-muted-foreground">
                {t("+{grants} interviews · used {uses}", { grants: c.grants, uses: c.uses })}
                {c.max_uses ? " · " + t("of {count}", { count: c.max_uses }) : ""}
                {c.expires_at
                  ? " · " +
                    t("expires {date}", { date: new Date(c.expires_at).toLocaleDateString(locale) })
                  : ""}
                {c.note ? ` · ${c.note}` : ""}
              </p>
            </div>
            <label className="flex items-center gap-2 text-xs">
              {c.active ? t("On") : t("Off")}
              <Switch
                checked={c.active}
                onCheckedChange={(v) => toggleM.mutate({ id: c.id, active: v })}
              />
            </label>
          </div>
        ))}
        {codes.data?.length === 0 && (
          <p className="text-sm text-muted-foreground">{t("No codes yet.")}</p>
        )}
      </div>
    </AppShell>
  );
}
