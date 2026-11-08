import { jsPDF } from "jspdf";
import html2canvas from "html2canvas-pro";

/**
 * Renders each section element to a canvas and lays it out into an A4 PDF,
 * splitting tall sections across pages. Runs entirely in the browser.
 */
export async function exportSectionsToPdf(opts: {
  filename: string;
  title?: string;
  subtitle?: string;
  sections: HTMLElement[];
}) {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 12;
  const contentW = pageW - margin * 2;

  const backgroundColor =
    getComputedStyle(document.body).backgroundColor || "#0d0f14";

  let y = margin;

  if (opts.title) {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    pdf.setTextColor(245, 245, 245);
    pdf.text(opts.title, margin, y);
    y += 7;
    if (opts.subtitle) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);
      pdf.setTextColor(160, 165, 175);
      pdf.text(opts.subtitle, margin, y);
      y += 5;
    }
    pdf.setTextColor(0, 0, 0);
    y += 4;
  }

  for (const el of opts.sections) {
    const canvas = await html2canvas(el, {
      scale: 1.5,
      backgroundColor,
      useCORS: true,
      logging: false,
    });
    if (canvas.width === 0 || canvas.height === 0) continue;

    const pxToMm = contentW / canvas.width;
    let offset = 0;

    while (offset < canvas.height) {
      let maxSlicePx = Math.floor((pageH - margin - y) / pxToMm);
      if (maxSlicePx < 10) {
        pdf.addPage();
        y = margin;
        maxSlicePx = Math.floor((pageH - margin - y) / pxToMm);
      }
      const sliceH = Math.min(maxSlicePx, canvas.height - offset);

      const slice = document.createElement("canvas");
      slice.width = canvas.width;
      slice.height = sliceH;
      const ctx = slice.getContext("2d");
      if (!ctx) break;
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, slice.width, slice.height);
      ctx.drawImage(canvas, 0, offset, canvas.width, sliceH, 0, 0, canvas.width, sliceH);

      pdf.addImage(
        slice.toDataURL("image/jpeg", 0.85),
        "JPEG",
        margin,
        y,
        contentW,
        sliceH * pxToMm,
      );

      offset += sliceH;
      y += sliceH * pxToMm + 4;
      if (offset < canvas.height) {
        pdf.addPage();
        y = margin;
      }
    }
    y += 2;
  }

  pdf.save(opts.filename);
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
