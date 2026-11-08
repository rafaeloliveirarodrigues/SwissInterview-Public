import { useAppTranslations } from "@/lib/app-i18n";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Briefcase, Plus } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { listPreps } from "@/lib/prep.functions";
import { listSessions } from "@/lib/interview.functions";
import { CreditsBadge } from "@/components/CreditsPanel";

export const Route = createFileRoute("/_authenticated/dashboard")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Your preparations — Offer Ready" },
      { name: "description", content: "Your saved job preparations and mock interview scores." },
      { property: "og:title", content: "Your preparations — Offer Ready" },
      { property: "og:description", content: "Saved job preparations and mock interview scores." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

function scoreColor(score: number) {
  if (score >= 75) return "text-success";
  if (score >= 50) return "text-warning";
  return "text-destructive";
}

function Dashboard() {
  const { t, locale } = useAppTranslations();

  const preps = useQuery({ queryKey: ["preps"], queryFn: () => listPreps() });
  const sessions = useQuery({ queryKey: ["sessions"], queryFn: () => listSessions() });

  return (
    <AppShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{t("Your preparations")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t(
              "Each preparation holds one job: the research, the guide, your CV review and your mock interviews.",
            )}
          </p>
          <div className="mt-3">
            <CreditsBadge />
          </div>
        </div>
        <Button asChild>
          <Link to="/new">
            <Plus className="mr-1 h-4 w-4" /> {t("New preparation")}
          </Link>
        </Button>
      </div>

      <section className="mt-8">
        {preps.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
        ) : preps.data && preps.data.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {preps.data.map((prep) => (
              <Link
                key={prep.id}
                to="/prep/$prepId"
                params={{ prepId: prep.id }}
                className="group rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/50"
              >
                <Briefcase className="h-5 w-5 text-primary" />
                <h2 className="mt-4 text-base font-semibold leading-snug">{prep.role_title}</h2>
                <p className="text-sm text-muted-foreground">{prep.company_name}</p>
                <p className="mt-4 flex items-center text-xs font-medium text-muted-foreground">
                  {t("Open")}
                  <ArrowUpRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <h2 className="text-base font-semibold">{t("Nothing here yet")}</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              {t(
                "Add your CV and the job you are going for, and we will build the research, the guide and your mock interview.",
              )}
            </p>
            <Button asChild className="mt-6">
              <Link to="/new">{t("Start your first preparation")}</Link>
            </Button>
          </div>
        )}
      </section>

      {sessions.data && sessions.data.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg font-semibold">{t("Interview history")}</h2>
          <div className="mt-4 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            {sessions.data.map((session) => {
              const prep = session.preps as unknown as {
                role_title: string;
                company_name: string;
              } | null;
              return (
                <Link
                  key={session.id}
                  to="/results/$sessionId"
                  params={{ sessionId: session.id }}
                  className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-secondary/50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {prep?.role_title ?? "Interview"}
                      <span className="text-muted-foreground"> · {prep?.company_name ?? ""}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(session.created_at).toLocaleString(locale)} ·{" "}
                      {session.status === "completed" ? t("Scored") : t("Unfinished")}
                    </p>
                  </div>
                  <span
                    className={`font-display text-lg font-semibold ${
                      session.overall_score == null
                        ? "text-muted-foreground"
                        : scoreColor(session.overall_score)
                    }`}
                  >
                    {session.overall_score ?? "—"}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </AppShell>
  );
}
