import { useAppTranslations } from "@/lib/app-i18n";
import { useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { FileUp, Loader2, X } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createPrep } from "@/lib/prep.functions";
import { LANGUAGES, type InterviewLanguage } from "@/lib/swiss-cv";

export const Route = createFileRoute("/_authenticated/new")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "New preparation — Offer Ready" },
      {
        name: "description",
        content: "Add your CV and the job description to build a tailored interview preparation.",
      },
      { property: "og:title", content: "New preparation — Offer Ready" },
      { property: "og:description", content: "Add your CV and the job you are targeting." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NewPrep,
});

const STAGES = [
  "Reading your CV",
  "Researching the company",
  "Writing your interview guide",
  "Reviewing your CV against the job",
];

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.readAsDataURL(file);
  });
}

function NewPrep() {
  const { t, lang } = useAppTranslations();

  const navigate = useNavigate();
  const create = useServerFn(createPrep);
  const inputRef = useRef<HTMLInputElement>(null);

  const [roleTitle, setRoleTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [pastedCv, setPastedCv] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<InterviewLanguage>(lang);
  useEffect(() => setLanguage(lang), [lang]);
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState(0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file && pastedCv.trim().length < 50) {
      toast.error(t("Add your CV as a file, or paste it in as text."));
      return;
    }

    setBusy(true);
    setStage(0);
    const ticker = setInterval(() => setStage((s) => Math.min(s + 1, STAGES.length - 1)), 9000);

    try {
      const fileBase64 = file ? await fileToBase64(file) : "";
      const result = await create({
        data: {
          roleTitle: roleTitle.trim(),
          companyName: companyName.trim(),
          jobDescription: jobDescription.trim(),
          fileName: file?.name ?? "",
          fileBase64,
          pastedCv,
          language,
        },
      });
      navigate({ to: "/prep/$prepId", params: { prepId: result.prepId } });
    } catch (error) {
      toast.error(
        error instanceof Error ? t(error.message) : t("We couldn't build that preparation."),
      );
      setBusy(false);
    } finally {
      clearInterval(ticker);
    }
  }

  if (busy) {
    return (
      <AppShell>
        <div className="mx-auto max-w-md py-20 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <h1 className="mt-6 text-xl font-semibold">{t("Building your preparation")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("This takes a minute or two. Please keep this page open.")}
          </p>
          <ul className="mt-8 space-y-3 text-left">
            {STAGES.map((label, i) => (
              <li
                key={t(label)}
                className={`flex items-center gap-3 text-sm ${
                  i <= stage ? "text-foreground" : "text-muted-foreground/60"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    i < stage ? "bg-success" : i === stage ? "bg-primary" : "bg-muted"
                  }`}
                />
                {t(label)}
              </li>
            ))}
          </ul>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold">{t("New preparation")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("Tell us the job and give us your CV. Everything else is generated for you.")}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-2">
            <Label>{t("Interview language")}</Label>
            <div
              className="flex flex-wrap gap-2"
              role="radiogroup"
              aria-label={t("Interview language")}
            >
              {(Object.keys(LANGUAGES) as InterviewLanguage[]).map((code) => (
                <Button
                  key={code}
                  type="button"
                  size="sm"
                  role="radio"
                  aria-checked={language === code}
                  variant={language === code ? "default" : "outline"}
                  onClick={() => setLanguage(code)}
                >
                  {LANGUAGES[code].label}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("Questions, voice and feedback will use this language.")}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="role">{t("Job title")}</Label>
              <Input
                id="role"
                required
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder={t("Senior Product Manager")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">{t("Company")}</Label>
              <Input
                id="company"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Stripe"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="jd">{t("Job description")}</Label>
            <Textarea
              id="jd"
              required
              rows={10}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder={t("Paste the full job ad here.")}
            />
          </div>

          <div className="space-y-2">
            <Label>{t("Your CV")}</Label>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.docx,.txt,.md"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            {file ? (
              <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
                <span className="truncate text-sm">{file.name}</span>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setFile(null);
                    if (inputRef.current) inputRef.current.value = "";
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-card/50 px-4 py-10 text-sm text-muted-foreground transition-colors hover:border-primary/50"
              >
                <FileUp className="h-5 w-5 text-primary" />
                {t("Upload a PDF or Word CV")}
              </button>
            )}
            <details className="pt-1">
              <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                {t("Or paste your CV as text instead")}
              </summary>
              <Textarea
                rows={8}
                className="mt-3"
                value={pastedCv}
                onChange={(e) => setPastedCv(e.target.value)}
                placeholder={t("Paste your CV here.")}
              />
            </details>
          </div>

          <Button type="submit" size="lg" className="w-full">
            {t("Build my preparation")}
          </Button>
        </form>
      </div>
    </AppShell>
  );
}
