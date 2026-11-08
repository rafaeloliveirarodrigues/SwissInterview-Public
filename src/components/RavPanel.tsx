import { useAppTranslations } from "@/lib/app-i18n";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Download, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { listApplications, saveApplication, deleteApplication } from "@/lib/career.functions";
import { ravSchema, type RavApplication } from "@/lib/career-schemas";
import { monthBounds } from "@/lib/career-tools";
import { exportRav } from "@/lib/rav-export";
import { RAV_TARGET, SWISS_TOOL_SOURCES } from "@/lib/swiss-cv";
function empty(): RavApplication {
  return {
    prep_id: null,
    application_date: new Date().toLocaleDateString("en-CA"),
    company: "",
    role: "",
    method: "Elektronisch",
    street: "",
    street_number: "",
    po_box: "",
    country: "Schweiz",
    postal_city: "",
    contact: "",
    email: "",
    phone: "",
    job_url: "",
    rav_assigned: false,
    workload: "Vollzeit",
    outcome: "Noch offen",
  };
}
export function RavPanel({
  prep,
}: {
  prep?: { id: string; role_title: string; company_name: string } | undefined;
}) {
  const { t, lang } = useAppTranslations();

  const [month, setMonth] = useState(""),
    [name, setName] = useState(""),
    [target, setTarget] = useState<number>(RAV_TARGET),
    [form, setForm] = useState<RavApplication>(empty),
    [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    const d = new Date();
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }, []);
  const load = useServerFn(listApplications),
    save = useServerFn(saveApplication),
    remove = useServerFn(deleteApplication);
  const rows = useQuery({
    queryKey: ["rav", month],
    queryFn: () => load({ data: { month } }),
    enabled: !!month,
  });
  const bounds = month ? monthBounds(month) : null;
  function add() {
    setForm({
      ...empty(),
      prep_id: prep?.id ?? null,
      company: prep?.company_name ?? "",
      role: prep?.role_title ?? "",
    });
    setOpen(true);
  }
  async function submit() {
    const valid = ravSchema.safeParse(form);
    if (!valid.success) {
      const message = valid.error.issues[0]?.message ?? "Check the application fields.";
      toast.error(t(message.startsWith("String must") ? "Check the application fields." : message));
      return;
    }
    setBusy(true);
    try {
      await save({ data: valid.data });
      setMonth(valid.data.application_date.slice(0, 7));
      setOpen(false);
      await rows.refetch();
      toast.success(t("Application saved."));
    } catch (e) {
      toast.error(e instanceof Error ? t(e.message) : t("Could not save application."));
    } finally {
      setBusy(false);
    }
  }
  const fields: { key: keyof RavApplication; label: string; max?: number; type?: string }[] = [
    { key: "application_date", label: t("Application date"), type: "date" },
    { key: "company", label: t("Company"), max: 100 },
    { key: "role", label: t("Job title"), max: 100 },
    { key: "street", label: t("Street") },
    { key: "street_number", label: t("Street number") },
    { key: "po_box", label: t("PO box") },
    { key: "country", label: t("Country") },
    { key: "postal_city", label: t("Postal code / city") },
    { key: "contact", label: t("Contact person"), max: 100 },
    { key: "email", label: t("Email"), max: 100, type: "email" },
    { key: "phone", label: t("Phone"), max: 100 },
    { key: "job_url", label: t("Job link (https://)"), type: "url" },
  ];
  return (
    <section className="mt-10 border-t border-border pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">{t("Monthly RAV report")}</h2>
        <Button variant="outline" onClick={add}>
          <Plus className="mr-2 h-4 w-4" />
          {t("Add real application")}
        </Button>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        {t(
          "Only actual job-search efforts count. A mock interview is not an application. Confirm your target and report format with your RAV adviser.",
        )}
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <Label>
          {t("Month")}
          <Input
            className="mt-2"
            type="month"
            value={month}
            onChange={(e) => {
              if (/^\d{4}-\d{2}$/.test(e.target.value)) setMonth(e.target.value);
            }}
          />
        </Label>
        <Label>
          {t("Your name (for report)")}
          <Input
            className="mt-2"
            value={name}
            maxLength={150}
            onChange={(e) => setName(e.target.value)}
          />
        </Label>
        <Label>
          {t("Monthly target")}
          <Input
            className="mt-2"
            type="number"
            min={1}
            max={100}
            value={target}
            onChange={(e) => setTarget(Math.max(1, Math.min(100, Number(e.target.value))))}
          />
        </Label>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <strong>
          {t("{current} / {target} applications", { current: rows.data?.length ?? 0, target })}
        </strong>
        <span className="text-sm text-muted-foreground">
          {t("Submit by {date}", { date: bounds?.deadline ?? "" })}
        </span>
        <Button
          disabled={!rows.data?.length}
          onClick={() => {
            if (rows.data) exportRav(month, rows.data as RavApplication[], name, target, lang);
          }}
        >
          <Download className="mr-2 h-4 w-4" />
          {t("Download RAV report")}
        </Button>
      </div>
      {rows.isLoading && <p className="mt-4 text-sm">{t("Loading applications…")}</p>}
      {rows.isError && <p className="mt-4 text-destructive">{t("Could not load applications.")}</p>}
      <div className="mt-5 divide-y divide-border">
        {rows.data?.map((r) => (
          <div key={r.id} className="flex items-center justify-between gap-3 py-4">
            <div className="min-w-0">
              <p className="break-words text-sm font-semibold">
                {r.company} · {r.role}
              </p>
              <p className="text-xs text-muted-foreground">
                {r.application_date} · {t(r.method)} · {t(r.outcome)}
              </p>
              {!r.postal_city && !r.email && !r.phone && (
                <p className="mt-1 text-xs text-warning">
                  {t("Employer address or contact information missing")}
                </p>
              )}
            </div>
            <div className="flex shrink-0">
              <Button
                size="icon"
                variant="ghost"
                aria-label={t("Edit application")}
                onClick={() => {
                  setForm(r as RavApplication);
                  setOpen(true);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                aria-label={t("Delete application")}
                onClick={async () => {
                  if (!confirm(t("Delete this application?"))) return;
                  try {
                    await remove({ data: { id: r.id } });
                    await rows.refetch();
                  } catch {
                    toast.error(t("Could not delete application."));
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      <a
        href={SWISS_TOOL_SOURCES.rav}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-block text-xs text-primary underline"
      >
        {t("Official forms and Job-Room submission ↗")}
      </a>
      <p className="mt-2 text-xs text-muted-foreground">
        {t("Download is a preparation copy, not an official submission or proof of acceptance.")}
      </p>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? t("Edit application") : t("Real job application")}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
            className="grid gap-4 sm:grid-cols-2"
          >
            {fields.map((f) => (
              <Label key={f.key}>
                {f.label}
                <Input
                  className="mt-2"
                  aria-label={f.label}
                  required={["company", "role", "application_date"].includes(f.key)}
                  type={f.type ?? "text"}
                  maxLength={f.max ?? 200}
                  value={String(form[f.key] ?? "")}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                />
              </Label>
            ))}
            {(
              [
                {
                  key: "method",
                  label: t("Application method"),
                  options: ["Elektronisch", "Brieflich", "Persönlich", "Telefonisch"],
                },
                { key: "workload", label: t("Workload"), options: ["Vollzeit", "Teilzeit"] },
                {
                  key: "outcome",
                  label: t("Application result"),
                  options: ["Vorstellungsgespräch", "Noch offen", "Anstellung", "Absage"],
                },
              ] as const
            ).map((f) => (
              <div key={f.key}>
                <Label>{f.label}</Label>
                <Select value={form[f.key]} onValueChange={(v) => setForm({ ...form, [f.key]: v })}>
                  <SelectTrigger aria-label={f.label} className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {f.options.map((v) => (
                      <SelectItem key={v} value={v}>
                        {t(v)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.rav_assigned}
                onChange={(e) => setForm({ ...form, rav_assigned: e.target.checked })}
              />
              {t("Assigned by RAV")}
            </label>
            <Button type="submit" disabled={busy} className="sm:col-span-2">
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("Save application")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
