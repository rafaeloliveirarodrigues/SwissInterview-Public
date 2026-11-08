import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { LanguageMenu } from "@/components/LanguageMenu";
import { getMediaConsent, recordMediaConsent } from "@/lib/privacy.functions";
import { useLegal } from "@/lib/legal-copy";

/** Camera/microphone notice with a required checkbox; children (which request media) mount only after consent. */
export function MediaConsent({ sessionId, children }: { sessionId: string; children: ReactNode }) {
  const { L } = useLegal();
  const M = L.media;
  const navigate = useNavigate();
  const load = useServerFn(getMediaConsent);
  const record = useServerFn(recordMediaConsent);
  const [state, setState] = useState<"loading" | "ask" | "ok">("loading");
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    load({ data: { sessionId } })
      .then((r) => !cancelled && setState(r.consentAt ? "ok" : "ask"))
      .catch(() => !cancelled && setState("ask"));
    return () => {
      cancelled = true;
    };
  }, [sessionId, load]);

  async function accept() {
    setBusy(true);
    try {
      await record({ data: { sessionId } });
      setState("ok");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  if (state === "ok") return <>{children}</>;
  if (state === "loading")
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );

  return (
    <main className="flex min-h-screen flex-col items-center justify-center surface-grid px-6 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <Camera className="h-6 w-6 text-primary" />
          <LanguageMenu />
        </div>
        <h1 className="mt-4 font-display text-2xl font-semibold">{M.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{M.intro}</p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm">
          {M.items.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
        <div className="mt-6 flex items-start gap-2 text-sm">
          <Checkbox
            id="media-consent"
            checked={checked}
            onCheckedChange={(v) => setChecked(v === true)}
            aria-required="true"
            className="mt-0.5"
          />
          <label htmlFor="media-consent" className="leading-snug">
            {M.checkbox}
          </label>
        </div>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button variant="ghost" onClick={() => navigate({ to: "/dashboard" })}>
            {M.back}
          </Button>
          <Button onClick={accept} disabled={!checked || busy}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {M.start}
          </Button>
        </div>
      </div>
    </main>
  );
}
