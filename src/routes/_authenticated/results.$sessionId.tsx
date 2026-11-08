import { useAppTranslations } from "@/lib/app-i18n";
import { useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ArrowLeft, Download, Loader2, Quote } from "lucide-react";
import { exportSectionsToPdf, slugify } from "@/lib/pdf-export";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getSession } from "@/lib/interview.functions";
import { SpeechDelivery } from "@/components/SpeechDelivery";
import { PracticeQuestion } from "@/components/PracticeQuestion";
import { RavPanel } from "@/components/RavPanel";
import type { SpeechMetrics } from "@/lib/career-tools";

export const Route = createFileRoute("/_authenticated/results/$sessionId")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Interview results — Offer Ready" },
      {
        name: "description",
        content: "Your mock interview score, answer-by-answer feedback and stronger model answers.",
      },
      { property: "og:title", content: "Interview results — Offer Ready" },
      { property: "og:description", content: "Your mock interview score and feedback." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResultsPage,
});

function scoreTone(score: number) {
  if (score >= 75) return "text-success";
  if (score >= 50) return "text-warning";
  return "text-destructive";
}

function ResultsPage() {
  const { t } = useAppTranslations();

  const { sessionId } = Route.useParams();
  const load = useServerFn(getSession);
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [exporting, setExporting] = useState(false);
  const scoreRef = useRef<HTMLDivElement>(null);
  const answersRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["session", sessionId],
    queryFn: () => load({ data: { sessionId } }),
  });

  if (isLoading || !data) {
    return (
      <AppShell>
        <Skeleton className="h-10 w-72" />
        <Skeleton className="mt-6 h-96 rounded-2xl" />
      </AppShell>
    );
  }

  const report = data.session.report;
  const prep = data.session.preps as unknown as {
    id: string;
    role_title: string;
    company_name: string;
  } | null;

  if (!report) {
    return (
      <AppShell>
        <h1 className="text-2xl font-semibold">{t("This interview wasn't scored")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("It looks like the interview was closed before it finished.")}
        </p>
        <Button asChild className="mt-6">
          <Link to="/dashboard">{t("Back to your preparations")}</Link>
        </Button>
      </AppShell>
    );
  }

  async function handleExport() {
    if (!report) return;
    setExporting(true);
    const previous = openItems;
    setOpenItems(report.perQuestion.map((_, i) => `q-${i}`));
    await new Promise((r) => setTimeout(r, 300));
    try {
      await exportSectionsToPdf({
        title: prep ? `${prep.role_title} — ${prep.company_name}` : t("Mock interview results"),
        subtitle: "Interview scores, answer-by-answer feedback and improvement plan",
        filename: `${slugify(prep ? `${prep.role_title}-${prep.company_name}` : "interview")}-results.pdf`,
        sections: [scoreRef.current, answersRef.current, stepsRef.current].filter(
          (el): el is HTMLDivElement => el !== null,
        ),
      });
    } catch {
      toast.error(t("We couldn't create the PDF. Try again."));
    } finally {
      setOpenItems(previous);
      setExporting(false);
    }
  }

  return (
    <AppShell>
      <div className="mb-4 flex items-center justify-between gap-2">
        {prep ? (
          <Button asChild variant="ghost" size="sm" className="-ml-2">
            <Link to="/prep/$prepId" params={{ prepId: prep.id }}>
              <ArrowLeft className="mr-1 h-4 w-4" /> {prep.role_title} · {prep.company_name}
            </Link>
          </Button>
        ) : (
          <span />
        )}
        <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
          {exporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {t("Download PDF")}
        </Button>
      </div>

      <div ref={scoreRef} className="rounded-3xl border border-border bg-card p-8">
        <div className="flex flex-wrap items-end gap-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {t("Overall")}
            </p>
            <p className={`font-display text-6xl font-semibold ${scoreTone(report.overallScore)}`}>
              {Math.round(report.overallScore)}
              <span className="text-2xl text-muted-foreground">/100</span>
            </p>
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold">{report.headline}</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{report.summary}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {report.dimensions.map((dim) => (
            <div key={t(dim.name)}>
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium">{t(dim.name)}</span>
                <span className="font-display text-sm font-semibold">{Math.round(dim.score)}</span>
              </div>
              <Progress value={dim.score} className="mt-2" />
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{dim.comment}</p>
            </div>
          ))}
        </div>
      </div>

      <div ref={answersRef}>
        <h2 className="mt-10 text-lg font-semibold">{t("Answer by answer")}</h2>
        <Accordion type="multiple" value={openItems} onValueChange={setOpenItems} className="mt-4">
          {report.perQuestion.map((item, i) => (
            <AccordionItem key={i} value={`q-${i}`}>
              <AccordionTrigger className="text-left">
                <span className="flex w-full items-center gap-4 pr-4">
                  <span className={`font-display text-base font-semibold ${scoreTone(item.score)}`}>
                    {Math.round(item.score)}
                  </span>
                  <span className="flex-1 text-sm font-medium">{item.question}</span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-success">
                    {t("What worked")}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed">{item.whatWorked}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-warning">
                    {t("What to fix")}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed">{item.whatToFix}</p>
                </div>
                <div className="rounded-xl border border-border bg-secondary/40 p-4">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                    <Quote className="h-3.5 w-3.5" /> {t("A stronger answer")}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed">{item.strongerAnswer}</p>
                </div>
                {(() => {
                  const answeredTurns = data.turns.filter((t) => (t.answer ?? "").trim());
                  const turn =
                    answeredTurns.find((t) => t.question === item.question) ?? answeredTurns[i];
                  if (!turn) return null;
                  return (
                    <>
                      {turn.speech_metrics ? (
                        <SpeechDelivery metrics={turn.speech_metrics as SpeechMetrics} />
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          {t(
                            "Speech rate unavailable—no recorded-answer measurements for this question.",
                          )}
                        </p>
                      )}
                      <PracticeQuestion turnId={turn.id} />
                    </>
                  );
                })()}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div ref={stepsRef} className="mt-10 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">{t("Do this before the real interview")}</h2>
        <ul className="mt-4 space-y-3">
          {report.nextSteps.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ul>
      </div>

      {prep && (
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/prep/$prepId" params={{ prepId: prep.id }}>
              {t("Run another mock interview")}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/dashboard">{t("Back to dashboard")}</Link>
          </Button>
        </div>
      )}
      <RavPanel prep={prep ?? undefined} />
    </AppShell>
  );
}
