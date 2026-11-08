import { useAppTranslations } from "@/lib/app-i18n";
import { CheckCircle2, AlertTriangle, XCircle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { SwissCvReview } from "@/lib/schemas";
import { DEGREE_LABELS, SWISS_TIPS, salaryRange } from "@/lib/swiss-cv";

const chf = (n: number) => `CHF ${n.toLocaleString("de-CH")}`;

const STATUS = {
  pass: { icon: CheckCircle2, className: "text-success" },
  warn: { icon: AlertTriangle, className: "text-primary" },
  fail: { icon: XCircle, className: "text-destructive" },
} as const;

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Tips({ items }: { items: string[] }) {
  const { t } = useAppTranslations();
  return (
    <ul className="space-y-2 text-sm">
      {items.map((tip) => (
        <li key={tip} className="flex gap-2">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
          {t(tip)}
        </li>
      ))}
    </ul>
  );
}

export function SwissCvPanel({
  review,
  onRefresh,
  refreshing,
}: {
  review: SwissCvReview | null;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  const { t } = useAppTranslations();

  if (!review) {
    return (
      <Card title={t("Swiss CV check")}>
        <p className="text-sm text-muted-foreground">
          {t("This preparation was made before the Swiss CV check existed.")}
        </p>
        <Button className="mt-4" onClick={onRefresh} disabled={refreshing}>
          {refreshing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          {t("Run Swiss CV check")}
        </Button>
      </Card>
    );
  }

  const range = salaryRange(review.salaryField, review.salaryDegree);

  return (
    <div className="space-y-4">
      <Card title={t("Swiss market fit")}>
        <div className="flex items-baseline gap-3">
          <span className="font-display text-4xl font-semibold text-primary">
            {Math.round(review.swissScore)}
          </span>
          <span className="text-sm text-muted-foreground">/ 100</span>
          <span className="ml-auto text-xs text-muted-foreground">
            {t("CV in {language} · {level}", {
              language: review.cvLanguage,
              level: t(review.experienceLevel),
            })}
          </span>
        </div>
        <Progress value={review.swissScore} className="mt-4" />
        <p className="mt-4 text-sm leading-relaxed">{review.verdict}</p>
      </Card>

      <Card title={t("Swiss checklist")}>
        <div className="space-y-4">
          {review.checks.map((c, i) => {
            const s = STATUS[c.status] ?? STATUS.warn;
            const Icon = s.icon;
            return (
              <div key={i} className="flex gap-3">
                <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${s.className}`} />
                <div>
                  <p className="text-sm font-medium">{t(c.label)}</p>
                  <p className="text-sm text-muted-foreground">{c.finding}</p>
                  {c.status !== "pass" && <p className="mt-1 text-sm">→ {c.fix}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card title={t("Salary expectations")}>
        {range ? (
          <>
            <p className="font-display text-2xl font-semibold">
              {chf(range.low)} – {chf(range.high)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t(
                "Typical starting salary: {salary} per year · {field}, {degree}. Guidance only, from the Career Starter 2026 survey.",
                {
                  salary: chf(range.mid),
                  field: t(review.salaryField),
                  degree: t(DEGREE_LABELS[review.salaryDegree]),
                },
              )}
            </p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            {t("No survey figure for this degree and field.")}
          </p>
        )}
        <div className="mt-4">
          <Tips items={SWISS_TIPS.salary} />
        </div>
      </Card>

      <Card title={t("Swiss application tips")}>
        <Tips items={[...SWISS_TIPS.interview, ...SWISS_TIPS.application]} />
      </Card>

      {review.likelyAssessmentCentre && (
        <Card title={t("Assessment centre")}>
          <Tips items={SWISS_TIPS.assessmentCentre} />
        </Card>
      )}

      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={onRefresh} disabled={refreshing}>
          {refreshing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          {t("Re-run check")}
        </Button>
      </div>
    </div>
  );
}
