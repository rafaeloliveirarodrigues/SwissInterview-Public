import { useAppTranslations } from "@/lib/app-i18n";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { practiceQuestion, listPractice } from "@/lib/career.functions";
import type { PracticeFeedback } from "@/lib/career-schemas";
import { AnswerRecorder } from "./AnswerRecorder";
import { SpeechDelivery } from "./SpeechDelivery";
import type { SpeechMetrics } from "@/lib/career-tools";
export function PracticeQuestion({ turnId }: { turnId: string }) {
  const { t, locale } = useAppTranslations();

  const [open, setOpen] = useState(false),
    [answer, setAnswer] = useState(""),
    [busy, setBusy] = useState(false);
  const [speech, setSpeech] = useState<{
    transcript: string;
    durationSeconds: number;
    language: string;
  } | null>(null);
  const practice = useServerFn(practiceQuestion),
    load = useServerFn(listPractice);
  const attempts = useQuery({
    queryKey: ["practice", turnId],
    queryFn: () => load({ data: { turnId } }),
    enabled: open,
  });
  async function submit() {
    setBusy(true);
    try {
      await practice({ data: { turnId, answer, ...(speech ? { speech } : {}) } });
      await attempts.refetch();
      setAnswer("");
      setSpeech(null);
    } catch (e) {
      toast.error(e instanceof Error ? t(e.message) : t("Could not score answer."));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="border-t border-border pt-4">
      <Button variant="outline" size="sm" onClick={() => setOpen(!open)}>
        <RotateCcw className="mr-2 h-4 w-4" />
        {t("Practise this question")}
      </Button>
      {open && (
        <div className="mt-4 space-y-3">
          <p className="text-xs text-muted-foreground">
            {t(
              "Free practice · your original interview score stays unchanged. Recorded audio is sent for transcription.",
            )}
          </p>
          <Textarea
            aria-label={t("Practice answer")}
            maxLength={10000}
            rows={5}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
          <div className="flex flex-wrap gap-3">
            <AnswerRecorder
              disabled={busy}
              onRecorded={(text, durationSeconds) => {
                setAnswer((p) => `${p} ${text}`.trim());
                setSpeech((p) => ({
                  transcript: `${p?.transcript ?? ""} ${text}`.trim(),
                  durationSeconds: (p?.durationSeconds ?? 0) + durationSeconds,
                  language: "en",
                }));
              }}
            />
            <Button disabled={busy || answer.trim().length < 2} onClick={submit}>
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("Score practice answer")}
            </Button>
          </div>
          {attempts.isError && (
            <p className="text-sm text-destructive">{t("Could not load practice history.")}</p>
          )}
          {attempts.data?.map((a) => {
            const f = a.feedback as unknown as PracticeFeedback;
            return (
              <div key={a.id} className="border-t border-border py-3 text-sm">
                <strong>
                  {Math.round(f.score)}/100 · {new Date(a.created_at).toLocaleString(locale)}
                </strong>
                <p className="mt-2 whitespace-pre-wrap text-muted-foreground">{a.answer}</p>
                <p className="mt-2">
                  <strong>{t("What worked:")}</strong>
                  {f.whatWorked}
                </p>
                <p className="mt-2">
                  <strong>{t("Improve:")}</strong>
                  {f.whatToFix}
                </p>
                <p className="mt-2">
                  <strong>{t("Stronger answer:")}</strong>
                  {f.strongerAnswer}
                </p>
                {a.speech_metrics && (
                  <SpeechDelivery metrics={a.speech_metrics as unknown as SpeechMetrics} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
