import { useAppTranslations } from "@/lib/app-i18n";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { salaryEstimate } from "@/lib/career-tools";
import { CANTONS, SWISS_TOOL_SOURCES } from "@/lib/swiss-cv";

export function SalarySimulator() {
  const { t, locale } = useAppTranslations();

  const chf = (n: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "CHF",
      maximumFractionDigits: 0,
    }).format(n);
  const [base, setBase] = useState(100000),
    [basis, setBasis] = useState<"annual" | "monthly">("annual"),
    [thirteenth, setThirteenth] = useState(true),
    [bonus, setBonus] = useState(0),
    [pension, setPension] = useState(0),
    [accident, setAccident] = useState(0),
    [other, setOther] = useState(0),
    [tax, setTax] = useState(""),
    [canton, setCanton] = useState("ZH"),
    [municipality, setMunicipality] = useState("");
  const safe = (n: number) => (Number.isFinite(n) ? Math.max(0, n) : 0);
  const estimate = salaryEstimate({
    base: safe(base),
    basis,
    thirteenth,
    bonus: safe(bonus),
    pension: safe(pension),
    accident: safe(accident),
    other: safe(other),
    tax: tax === "" ? null : safe(Number(tax)),
  });
  const fields: [string, number, (n: number) => void][] = [
    [t("Base salary (CHF)"), base, setBase],
    [t("Annual bonus (CHF)"), bonus, setBonus],
    [t("Annual employee pension contribution (CHF)"), pension, setPension],
    [t("Annual accident premium (CHF)"), accident, setAccident],
    [t("Other annual deductions (CHF)"), other, setOther],
  ];
  return (
    <section>
      <h1 className="text-2xl font-semibold">{t("Swiss salary & tax budget")}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {t(
          "2026 · Standard employees below reference age. Pension and insurance amounts depend on your employer; zero means excluded.",
        )}
      </p>
      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={basis === "annual" ? "default" : "outline"}
              onClick={() => setBasis("annual")}
            >
              {t("Annual base")}
            </Button>
            <Button
              variant={basis === "monthly" ? "default" : "outline"}
              onClick={() => setBasis("monthly")}
            >
              {t("Monthly base")}
            </Button>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={thirteenth}
              onChange={(e) => setThirteenth(e.target.checked)}
            />
            {t("13 salary payments")}
          </label>
          <p className="text-xs text-muted-foreground">
            {t(
              "Annual base already includes the 13th salary. Monthly base is multiplied by 12 or 13. Bonus is separate and may not be guaranteed.",
            )}
          </p>
          {fields.map(([label, value, set]) => (
            <div key={label}>
              <Label>
                {label}
                <Input
                  className="mt-2"
                  type="number"
                  min={0}
                  max={10000000}
                  value={value}
                  onChange={(e) => set(Math.max(0, Number(e.target.value)))}
                />
              </Label>
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{t("Canton")}</Label>
              <Select
                value={canton}
                onValueChange={(v) => {
                  setCanton(v);
                  setTax("");
                }}
              >
                <SelectTrigger aria-label={t("Canton")} className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CANTONS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Label>
              {t("Municipality")}
              <Input
                className="mt-2"
                value={municipality}
                onChange={(e) => {
                  setMunicipality(e.target.value);
                  setTax("");
                }}
                placeholder="Zürich"
              />
            </Label>
          </div>
          <Button asChild variant="outline">
            <a href={SWISS_TOOL_SOURCES.tax} target="_blank" rel="noopener noreferrer">
              {t("Official federal tax calculator ↗")}
            </a>
          </Button>
          <Label className="block">
            {t("Annual tax estimate for {place} (CHF)", { place: municipality || canton })}
            <Input
              className="mt-2"
              type="number"
              min={0}
              value={tax}
              onChange={(e) => setTax(e.target.value)}
              placeholder={t("Enter the official calculator’s result")}
            />
          </Label>
          <p className="text-xs text-muted-foreground">
            {t(
              "No canton tax rate is assumed. Use your municipality, civil status, children, religion, permit and tax year in the official calculator. This is a budgeting reserve, not a withholding-tax calculation.",
            )}
          </p>
        </div>
        <div className="border-t border-border pt-6 lg:border-t-0 lg:border-l lg:pl-8">
          <h2 className="text-lg font-semibold">{t("Annual breakdown")}</h2>
          <dl className="mt-5 space-y-4">
            {[
              [t("Total gross including bonus"), estimate.gross],
              [t("Regular gross payment"), estimate.regularGross],
              [t("AHV / IV / EO · 5.30%"), estimate.ahv],
              [t("ALV · 1.10%, capped at CHF 148,200"), estimate.alv],
              [t("All entered deductions"), estimate.deductions],
              [t("Net before income tax"), estimate.beforeTax],
            ].map(([label, value]) => (
              <div key={String(label)} className="flex justify-between gap-4 text-sm">
                <dt>{label}</dt>
                <dd className="shrink-0 font-semibold">{chf(Number(value))}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6 border-t border-border pt-5">
            <p className="text-xs text-muted-foreground">
              {t("Annual income after entered tax estimate")}
            </p>
            <p className="mt-2 text-3xl font-semibold text-primary">
              {estimate.afterTax === null ? t("Not calculated") : chf(estimate.afterTax)}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {estimate.afterTax === null
                ? t("Tax estimate required.")
                : t("{amount} annualised monthly average", { amount: chf(estimate.afterTax / 12) })}
            </p>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            {t(
              "Not a payslip or tax assessment. Health-insurance premiums and personal expenses are not deducted. Bonus-month cash flow may differ.",
            )}
          </p>
          <a
            className="mt-4 block text-xs text-primary underline"
            href={SWISS_TOOL_SOURCES.contributions}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("Official 2026 contribution rates")}
          </a>
        </div>
      </div>
    </section>
  );
}
