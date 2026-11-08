import { useAppTranslations } from "@/lib/app-i18n";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Coffee, Loader2, Ticket } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getCredits, redeemPromo } from "@/lib/credits.functions";
import { COFFEE_URL, CREDITS } from "@/lib/swiss-cv";

export function useCredits() {
  const fetchCredits = useServerFn(getCredits);
  return useQuery({ queryKey: ["credits"], queryFn: () => fetchCredits() });
}

export function CreditsBadge() {
  const { t } = useAppTranslations();

  const { data } = useCredits();
  if (!data) return null;
  return (
    <span className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
      {data.remaining > 0
        ? t("{count} free interviews left", { count: data.remaining })
        : t("No free interviews left")}
    </span>
  );
}

export function LimitDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { t } = useAppTranslations();

  const redeem = useServerFn(redeemPromo);
  const queryClient = useQueryClient();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleRedeem(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await redeem({ data: { code } });
      await queryClient.invalidateQueries({ queryKey: ["credits"] });
      toast.success(t("Code applied — you now have {count} interviews.", { count: r.remaining }));
      setCode("");
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? t(err.message) : t("This code is not valid."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("You've used your free interviews")}</DialogTitle>
          <DialogDescription>
            {t(
              "Offer Ready is free. If it helped you, buy me a coffee and your limit resets to {count} interviews. Use the same email as your account.",
              { count: CREDITS.coffeeResetTo },
            )}
          </DialogDescription>
        </DialogHeader>
        <Button asChild size="lg">
          <a href={COFFEE_URL} target="_blank" rel="noopener noreferrer">
            <Coffee className="mr-2 h-4 w-4" /> {t("Buy me a coffee")}
          </a>
        </Button>
        <p className="text-xs text-muted-foreground">
          {t(
            "Already bought one? Refresh this page in a minute. If nothing changes, message me and I'll send you a code.",
          )}
        </p>
        <form onSubmit={handleRedeem} className="mt-2 flex gap-2">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={t("Promo code")}
            aria-label={t("Promo code")}
            required
          />
          <Button type="submit" variant="outline" disabled={busy}>
            {busy ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Ticket className="mr-2 h-4 w-4" />
            )}
            {t("Apply")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
