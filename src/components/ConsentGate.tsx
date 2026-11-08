import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PolicyCheckbox } from "@/components/PolicyCheckbox";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { getConsentStatus, recordPrivacyConsent } from "@/lib/privacy.functions";
import { hasCurrentConsent, PENDING_CONSENT_KEY, PRIVACY_POLICY_VERSION } from "@/lib/privacy";
import { useLegal } from "@/lib/legal-copy";

/** Shows a one-time modal for signed-in users who have not accepted the current policy version. */
export function ConsentGate() {
  const { user } = useAuth();
  const { L } = useLegal();
  const navigate = useNavigate();
  const status = useServerFn(getConsentStatus);
  const record = useServerFn(recordPrivacyConsent);
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const uid = user?.id;

  useEffect(() => {
    if (!uid) {
      setOpen(false);
      return;
    }
    let cancelled = false;
    status()
      .then(async (s) => {
        if (cancelled || hasCurrentConsent(s.version)) return;
        let pending: string | null = null;
        try {
          pending = localStorage.getItem(PENDING_CONSENT_KEY);
        } catch {
          /* storage blocked */
        }
        if (pending === String(PRIVACY_POLICY_VERSION)) {
          await record();
          try {
            localStorage.removeItem(PENDING_CONSENT_KEY);
          } catch {
            /* ignore */
          }
          return;
        }
        if (!cancelled) setOpen(true);
      })
      .catch(() => {
        /* Not fatal: retried on next navigation/sign-in. */
      });
    return () => {
      cancelled = true;
    };
  }, [uid, status, record]);

  async function accept() {
    setBusy(true);
    try {
      await record();
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : L.consent.required);
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setOpen(false);
    navigate({ to: "/" });
  }

  return (
    <Dialog open={open} onOpenChange={() => undefined}>
      <DialogContent
        className="[&>button]:hidden"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{L.consent.modalTitle}</DialogTitle>
          <DialogDescription>{L.consent.modalBody}</DialogDescription>
        </DialogHeader>
        <PolicyCheckbox id="consent-modal" checked={checked} onChange={setChecked} />
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={signOut}>
            {L.consent.signOut}
          </Button>
          <Button onClick={accept} disabled={!checked || busy}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {L.consent.modalAccept}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
