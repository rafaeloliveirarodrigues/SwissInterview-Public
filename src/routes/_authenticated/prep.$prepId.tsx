import { useAppTranslations } from "@/lib/app-i18n";
import { useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
  Download,
  Loader2,
  Mic,
  Newspaper,
  Sparkles,
  Trash2,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { deletePrep, getPrep, refreshSwissReview } from "@/lib/prep.functions";
import { SwissCvPanel } from "@/components/SwissCvPanel";
import { startSession } from "@/lib/interview.functions";
import { CreditsBadge, LimitDialog, useCredits } from "@/components/CreditsPanel";
import { Coffee } from "lucide-react";
import { exportSectionsToPdf, slugify } from "@/lib/pdf-export";

export const Route = createFileRoute("/_authenticated/prep/$prepId")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Your preparation — Offer Ready" },
      {
        name: "description",
        content: "Company briefing, interview guide and CV review for the job you are targeting.",
      },
      { property: "og:title", content: "Your preparation — Offer Ready" },
      { property: "og:description", content: "Company briefing, interview guide and CV review." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrepPage,
});

const statusStyles: Record<string, { icon: typeof CheckCircle2; className: string }> = {
  strong: { icon: CheckCircle2, className: "text-success" },
  partial: { icon: CircleDashed, className: "text-warning" },
  missing: { icon: AlertTriangle, className: "text-destructive" },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 text-sm leading-relaxed">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function PrepPage() {
  const { t, locale } = useAppTranslations();

  const { prepId } = Route.useParams();
  const navigate = useNavigate();
  const fetchPrep = useServerFn(getPrep);
  const start = useServerFn(startSession);
  const remove = useServerFn(deletePrep);
  const [activeTab, setActiveTab] = useState("company");
  const [exporting, setExporting] = useState(false);
  const companyRef = useRef<HTMLDivElement>(null);
  const guideRef = useRef<HTMLDivElement>(null);
  const cvRef = useRef<HTMLDivElement>(null);
  const swissRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const refreshSwiss = useServerFn(refreshSwissReview);

  const { data, isLoading } = useQuery({
    queryKey: ["prep", prepId],
    queryFn: () => fetchPrep({ data: { prepId } }),
  });

  const [limitOpen, setLimitOpen] = useState(false);
  const credits = useCredits();
  const startMutation = useMutation({
    mutationFn: (kind: "interview" | "coffee") => start({ data: { prepId, kind } }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["credits"] });
      navigate({ to: "/interview/$sessionId", params: { sessionId: result.sessionId } });
    },
    onError: (e) => {
      if (e instanceof Error && e.message.includes("LIMIT_REACHED")) setLimitOpen(true);
      else toast.error(t("We couldn't start the interview. Try again."));
    },
  });
  function begin(kind: "interview" | "coffee") {
    if (credits.data && credits.data.remaining <= 0) setLimitOpen(true);
    else startMutation.mutate(kind);
  }

  const deleteMutation = useMutation({
    mutationFn: () => remove({ data: { prepId } }),
    onSuccess: () => navigate({ to: "/dashboard" }),
  });

  const swissMutation = useMutation({
    mutationFn: () => refreshSwiss({ data: { prepId } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["prep", prepId] }),
    onError: () => toast.error(t("We couldn't run the Swiss CV check. Try again.")),
  });

  if (isLoading || !data) {
    return (
      <AppShell>
        <Skeleton className="h-10 w-72" />
        <Skeleton className="mt-6 h-96 rounded-2xl" />
      </AppShell>
    );
  }

  const { prep, sessions } = data;
  const brief = prep.company_brief;
  const guide = prep.interview_guide;
  const review = prep.cv_review;

  async function handleExport() {
    setExporting(true);
    const previous = activeTab;
    try {
      const tabs: [string, React.RefObject<HTMLDivElement | null>][] = [
        ["company", companyRef],
        ["guide", guideRef],
        ["cv", cvRef],
        ["swiss", swissRef],
      ];
      const sections: HTMLDivElement[] = [];
      for (const [tab, ref] of tabs) {
        setActiveTab(tab);
        await new Promise((r) => setTimeout(r, 300));
        if (ref.current) sections.push(ref.current);
      }
      await exportSectionsToPdf({
        title: `${prep.role_title} — ${prep.company_name}`,
        subtitle: "Company briefing, interview guide, CV analysis and Swiss CV check",
        filename: `${slugify(`${prep.role_title}-${prep.company_name}`)}-preparation.pdf`,
        sections,
      });
    } catch {
      toast.error(t("We couldn't create the PDF. Try again."));
    } finally {
      setActiveTab(previous);
      setExporting(false);
    }
  }

  return (
    <AppShell>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{prep.role_title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{prep.company_name}</p>
          <div className="mt-2">
            <CreditsBadge />
          </div>
        </div>
        <LimitDialog open={limitOpen} onOpenChange={setLimitOpen} />
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="lg" onClick={handleExport} disabled={exporting}>
            {exporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {t("Download PDF")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm(t("Delete this preparation and its interviews?")))
                deleteMutation.mutate();
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => begin("coffee")}
            disabled={startMutation.isPending}
          >
            <Coffee className="mr-2 h-4 w-4" /> {t("Networking coffee chat")}
          </Button>
          <Button size="lg" onClick={() => begin("interview")} disabled={startMutation.isPending}>
            {startMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Mic className="mr-2 h-4 w-4" />
            )}
            {t("Start mock interview")}
          </Button>
        </div>
      </div>

      {sessions.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {sessions.map((s) => (
            <Link
              key={s.id}
              to="/results/$sessionId"
              params={{ sessionId: s.id }}
              className="rounded-full border border-border bg-card px-3 py-1 text-xs hover:border-primary/50"
            >
              {new Date(s.created_at).toLocaleDateString(locale)} ·{" "}
              {s.overall_score != null ? `${s.overall_score}/100` : t("unfinished")}
            </Link>
          ))}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
        <TabsList className="h-auto flex-wrap">
          <TabsTrigger value="company">{t("Company")}</TabsTrigger>
          <TabsTrigger value="guide">{t("Interview guide")}</TabsTrigger>
          <TabsTrigger value="cv">{t("CV review")}</TabsTrigger>
          <TabsTrigger value="swiss">{t("Swiss CV check")}</TabsTrigger>
        </TabsList>

        <TabsContent value="company" ref={companyRef} className="mt-6 space-y-4">
          {brief ? (
            <>
              <Section title={t("The short version")}>
                <p className="text-sm leading-relaxed">{brief.summary}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {brief.whatTheyDo}
                </p>
              </Section>
              <div className="grid gap-4 lg:grid-cols-2">
                <Section title={t("How they work")}>
                  <Bullets items={brief.culture} />
                </Section>
                <Section title={t("How they interview")}>
                  <p className="text-sm leading-relaxed">{brief.interviewReputation}</p>
                </Section>
              </div>
              <Section title={t("Recent news worth mentioning")}>
                <div className="space-y-4">
                  {brief.recentNews.map((item, i) => (
                    <div key={i} className="flex gap-3">
                      <Newspaper className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                      <div>
                        <p className="text-sm font-medium">{item.headline}</p>
                        <p className="text-sm text-muted-foreground">{item.takeaway}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
              <div className="grid gap-4 lg:grid-cols-2">
                <Section title={t("Your talking points")}>
                  <Bullets items={brief.talkingPoints} />
                </Section>
                <Section title={t("Questions to ask them")}>
                  <Bullets items={brief.questionsToAskThem} />
                </Section>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">{t("No briefing available.")}</p>
          )}
        </TabsContent>

        <TabsContent value="guide" ref={guideRef} className="mt-6 space-y-4">
          {guide ? (
            <>
              <Section title={t("What to expect")}>
                <p className="text-sm leading-relaxed">{guide.overview}</p>
              </Section>
              <div className="space-y-4">
                {guide.stages.map((stage, i) => (
                  <div key={i} className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 font-display text-sm font-semibold text-primary">
                        {i + 1}
                      </span>
                      <h3 className="text-base font-semibold">{stage.name}</h3>
                      <Badge variant="secondary">{stage.duration}</Badge>
                      <Badge variant="outline">{stage.format}</Badge>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">{stage.focus}</p>
                    <div className="mt-4">
                      <Bullets items={stage.tips} />
                    </div>
                  </div>
                ))}
              </div>
              <Section title={t("Questions they are likely to ask")}>
                <div className="space-y-4">
                  {guide.likelyQuestions.map((q, i) => (
                    <div key={i}>
                      <p className="text-sm font-medium">{q.question}</p>
                      <p className="text-sm text-muted-foreground">{q.why}</p>
                    </div>
                  ))}
                </div>
              </Section>
              <Section title={t("What loses people the offer")}>
                <Bullets items={guide.redFlags} />
              </Section>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">{t("No guide available.")}</p>
          )}
        </TabsContent>

        <TabsContent value="cv" ref={cvRef} className="mt-6 space-y-4">
          {review ? (
            <>
              <Section title={t("Match against this job")}>
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-4xl font-semibold text-primary">
                    {Math.round(review.matchScore)}
                  </span>
                  <span className="text-sm text-muted-foreground">/ 100</span>
                </div>
                <Progress value={review.matchScore} className="mt-4" />
                <p className="mt-4 text-sm leading-relaxed">{review.verdict}</p>
              </Section>
              <Section title={t("What is working")}>
                <Bullets items={review.strengths} />
              </Section>
              <Section title={t("Requirement by requirement")}>
                <div className="space-y-4">
                  {review.requirements.map((req, i) => {
                    const style = statusStyles[req.status] ?? statusStyles["partial"]!;
                    const Icon = style.icon;
                    return (
                      <div key={i} className="flex gap-3">
                        <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${style.className}`} />
                        <div>
                          <p className="text-sm font-medium">{req.requirement}</p>
                          <p className="text-sm text-muted-foreground">{req.advice}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Section>
              <Section title={t("Fix these first")}>
                <div className="space-y-4">
                  {review.improvements.map((item, i) => (
                    <div key={i} className="flex gap-3">
                      <Badge
                        variant={item.priority === "high" ? "default" : "secondary"}
                        className="mt-0.5 shrink-0"
                      >
                        {t(item.priority)}
                      </Badge>
                      <div>
                        <p className="text-sm font-medium">{item.area}</p>
                        <p className="text-sm text-muted-foreground">{item.suggestion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
              {review.missingKeywords.length > 0 && (
                <Section title={t("Words the job ad uses that your CV does not")}>
                  <div className="flex flex-wrap gap-2">
                    {review.missingKeywords.map((word, i) => (
                      <Badge key={i} variant="outline">
                        {word}
                      </Badge>
                    ))}
                  </div>
                </Section>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">{t("No CV review available.")}</p>
          )}
        </TabsContent>

        <TabsContent value="swiss" ref={swissRef} className="mt-6">
          <SwissCvPanel
            review={prep.swiss_cv_review}
            refreshing={swissMutation.isPending}
            onRefresh={() => swissMutation.mutate()}
          />
        </TabsContent>
      </Tabs>

      <div className="mt-10 rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center">
        <Sparkles className="mx-auto h-5 w-5 text-primary" />
        <h2 className="mt-3 text-lg font-semibold">{t("Ready to be interviewed?")}</h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
          {t(
            "Eight questions, asked out loud, tailored to this job and your CV. You answer on camera and get scored afterwards.",
          )}
        </p>
        <Button
          className="mt-5"
          onClick={() => begin("interview")}
          disabled={startMutation.isPending}
        >
          {startMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t("Start mock interview")}
        </Button>
      </div>
    </AppShell>
  );
}
