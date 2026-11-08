import { useAppTranslations } from "@/lib/app-i18n";
import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { FileText, Loader2, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { reviewReference, listReferences, deleteReference } from "@/lib/career.functions";
import { LANGUAGES, LIMITS } from "@/lib/swiss-cv";
export const Route = createFileRoute("/_authenticated/references")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Arbeitszeugnis evaluator — Offer Ready" },
      {
        name: "description",
        content:
          "Review Swiss employment reference wording and prepare honest interview responses.",
      },
      { property: "og:title", content: "Arbeitszeugnis evaluator — Offer Ready" },
      {
        property: "og:description",
        content: "Contextual employment-reference review and interview preparation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: References,
});
function References() {
  const { t, lang } = useAppTranslations();

  const [text, setText] = useState(""),
    [file, setFile] = useState<File | null>(null),
    [language, setLanguage] = useState<string>(lang),
    [busy, setBusy] = useState(false);
  useEffect(() => setLanguage(lang), [lang]);
  const review = useServerFn(reviewReference),
    load = useServerFn(listReferences),
    remove = useServerFn(deleteReference);
  const reviews = useQuery({ queryKey: ["references"], queryFn: () => load() });
  async function submit() {
    setBusy(true);
    try {
      let fileBase64 = "";
      if (file) {
        if (file.size > LIMITS.fileBytes) throw new Error(t("Use a file under 10MB."));
        fileBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === "string") resolve(reader.result.split(",")[1] ?? "");
            else reject(new Error(t("Could not read file.")));
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }
      await review({ data: { text, fileBase64, fileName: file?.name ?? "", language } });
      await reviews.refetch();
      toast.success(t("Reference reviewed."));
    } catch (e) {
      toast.error(e instanceof Error ? t(e.message) : t("Could not review letter."));
    } finally {
      setBusy(false);
    }
  }
  return (
    <AppShell>
      <h1 className="text-2xl font-semibold">{t("Arbeitszeugnis evaluator")}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {t(
          "Wording in context—not a definitive grade or legal advice. Original files are not retained; your review is private.",
        )}
      </p>
      <div className="mt-6 space-y-4">
        <Label className="block">
          {t("Reference letter · PDF, DOCX or TXT")}
          <Input
            className="mt-2"
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </Label>
        <Textarea
          aria-label={t("Reference letter text")}
          rows={7}
          maxLength={30000}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("Or paste your Arbeitszeugnis here (also for scanned PDFs).")}
        />
        <div className="flex flex-wrap gap-3">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger aria-label={t("Review language")} className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(LANGUAGES).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button disabled={busy || (!file && text.trim().length < 40)} onClick={submit}>
            {busy ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="mr-2 h-4 w-4" />
            )}
            {t("Review reference")}
          </Button>
        </div>
      </div>
      {reviews.isError && <p className="mt-6 text-destructive">{t("Could not load reviews.")}</p>}
      {reviews.data?.map((r) => (
        <section key={r.id} className="mt-10 border-t border-border pt-6">
          <div className="flex justify-between gap-3">
            <h2 className="text-lg font-semibold">{r.file_name}</h2>
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("Delete reference review")}
              onClick={async () => {
                if (!confirm(t("Delete this reference review?"))) return;
                try {
                  await remove({ data: { id: r.id } });
                  await reviews.refetch();
                } catch {
                  toast.error(t("Could not delete review."));
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-3 text-sm leading-relaxed">{r.report.summary}</p>
          <div className="mt-5 space-y-5">
            {r.report.passages.map((p, i) => (
              <div key={i} className="border-l-2 border-primary pl-4">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  {t("{level} concern", { level: t(p.concern) })}
                </p>
                <blockquote className="mt-2 text-sm italic">“{p.quote}”</blockquote>
                <p className="mt-2 text-sm">{p.interpretation}</p>
                <p className="mt-2 text-sm text-muted-foreground">{p.context}</p>
                <p className="mt-2 text-sm">
                  <strong>{t("Interview response:")}</strong>
                  {p.interviewResponse}
                </p>
              </div>
            ))}
          </div>
          <h3 className="mt-6 font-semibold">{t("Missing or unclear")}</h3>
          <ul className="mt-2 list-disc space-y-2 pl-5 text-sm">
            {r.report.omissions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
          <h3 className="mt-6 font-semibold">{t("Next steps")}</h3>
          <ul className="mt-2 list-disc space-y-2 pl-5 text-sm">
            {r.report.nextSteps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </section>
      ))}
    </AppShell>
  );
}
