import { useAppTranslations } from "@/lib/app-i18n";
import type { ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Plus, Ticket } from "lucide-react";
import { useCredits } from "@/components/CreditsPanel";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { SiteFooter } from "./SiteFooter";
import { useLegal } from "@/lib/legal-copy";
import { APP_VERSION } from "@/lib/swiss-cv";
import { LanguageMenu } from "./LanguageMenu";

export function AppShell({ children }: { children: ReactNode }) {
  const { t } = useAppTranslations();

  const navigate = useNavigate();
  const { L } = useLegal();
  const credits = useCredits();

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  return (
    <div className="flex min-h-screen flex-col surface-grid">
      <header className="border-b border-border/60">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-6 py-4">
          <Link to="/dashboard" className="font-display text-base font-semibold tracking-tight">
            Offer Ready
          </Link>
          <div className="flex items-center gap-2">
            <LanguageMenu />
            {credits.data?.isAdmin && (
              <Button asChild size="sm" variant="ghost">
                <Link to="/admin">
                  <Ticket className="mr-1 h-4 w-4" /> {t("Promo codes")}
                </Link>
              </Button>
            )}
            <Button asChild size="sm" variant="ghost">
              <Link to="/new">
                <Plus className="mr-1 h-4 w-4" /> {t("New prep")}
              </Link>
            </Button>
            <Button size="sm" variant="ghost" onClick={signOut} aria-label={t("Sign out")}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      <nav aria-label={t("Career tools")} className="border-b border-border/60">
        <div className="mx-auto flex max-w-6xl flex-wrap gap-1 px-6 py-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/references">{t("Arbeitszeugnis")}</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link to="/salary">{t("Salary & tax")}</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link to="/rav">{t("RAV report")}</Link>
          </Button>
        </div>
      </nav>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">{children}</main>
      <SiteFooter>
        <span className="flex flex-wrap items-center gap-x-3">
          <span title="New in v2.1: German, French and Italian interviews, networking coffee chat, sign-in with an email code, ISA 2026 market insights">
            Offer Ready v{APP_VERSION} ·{" "}
            {t(
              "Free: {count} mock interviews · Swiss CV check based on Career Starter 2026 and ISA 2026",
              { count: 3 },
            )}
          </span>
          <Link to="/privacy-data" className="font-medium hover:text-foreground hover:underline">
            {L.footer.data}
          </Link>
        </span>
      </SiteFooter>
    </div>
  );
}
