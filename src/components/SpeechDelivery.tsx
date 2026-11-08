import { useAppTranslations } from "@/lib/app-i18n";
import type { SpeechMetrics } from "@/lib/career-tools";
export function SpeechDelivery({ metrics }: { metrics: SpeechMetrics }) {
  const { t } = useAppTranslations();

  return (
    <div className="border-t border-border pt-4">
      <h3 className="text-sm font-semibold">{t("Speech delivery")}</h3>
      <div className="mt-2 flex flex-wrap gap-6 text-sm">
        <span>
          <strong>{metrics.wpm ?? "—"}</strong> {t("words/min")}
        </span>
        <span>
          <strong>{metrics.wordCount}</strong> {t("spoken words")}
        </span>
        <span>
          <strong>{metrics.fillerCount}</strong> {t("possible fillers")}
        </span>
        <span>{t("{count}s recorded", { count: Math.round(metrics.durationSeconds) })}</span>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {t(
          "Approximate rate over total recording time, including pauses. Fillers are transcript-based and context-dependent; transcription may omit them.",
        )}
      </p>
      {metrics.fillers.length > 0 && (
        <p className="mt-2 text-sm">
          {metrics.fillers.map((f) => `${f.phrase} × ${f.count}`).join(" · ")}
        </p>
      )}
    </div>
  );
}
