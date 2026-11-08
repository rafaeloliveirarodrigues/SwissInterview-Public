import { jsPDF } from "jspdf";
import type { RavApplication } from "./career-schemas";
import { monthBounds } from "./career-tools";
import { translate } from "./app-i18n";
import type { UiLang } from "./landing-i18n";
export function exportRav(
  month: string,
  rows: RavApplication[],
  name: string,
  target: number,
  lang: UiLang = "en",
) {
  const t = (text: string) => translate(lang, text);
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  let y = 16;
  function line(text: string, bold = false) {
    const lines = pdf.splitTextToSize(text, 180) as string[];
    if (y + lines.length * 5 > 280) {
      pdf.addPage();
      y = 16;
    }
    pdf.setFont("helvetica", bold ? "bold" : "normal");
    pdf.setFontSize(10);
    pdf.text(lines, 15, y);
    y += lines.length * 5 + 2;
  }
  line(t("Personal job-search efforts"), true);
  line(`${t("Month")}: ${month} | ${t("Name")}: ${name || "________________________"}`);
  line(`${rows.length} | ${t("Personal monthly target")}: ${target}`);
  line(
    translate(lang, "Submit by {date}", {
      date: monthBounds(month).deadline.split("-").reverse().join("."),
    }),
  );
  line(t("Preparation copy — not an automatic submission. Confirm acceptance with RAV."));
  rows.forEach((r, i) => {
    if (y > 210) {
      pdf.addPage();
      y = 16;
    }
    line(
      `${i + 1}. ${r.application_date.split("-").reverse().join(".")} | ${r.company} | ${r.role}`,
      true,
    );
    line(
      `${t("Application method")}: ${t(r.method)} | ${t("Workload")}: ${t(r.workload)} | ${t("Assigned by RAV")}: ${t(r.rav_assigned ? "Yes" : "No")}`,
    );
    line(
      `${t("Address")}: ${[r.street, r.street_number, r.po_box && `${t("PO box")} ${r.po_box}`, r.postal_city, r.country].filter(Boolean).join(", ") || t("Not provided")}`,
    );
    line(
      `${t("Contact person")}: ${r.contact || t("Not provided")} | ${t("Email")}: ${r.email || t("Not provided")} | ${t("Phone")}: ${r.phone || t("Not provided")}`,
    );
    line(
      `${t("Job link (https://)")}: ${r.job_url || t("Not provided")} | ${t("Application result")}: ${t(r.outcome)}`,
    );
    y += 3;
  });
  line(`${t("Place / date")}: ____________________    ${t("Signature")}: ____________________`);
  const blob = pdf.output("blob"),
    url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = `RAV-${month}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
