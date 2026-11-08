import { unzipSync, strFromU8 } from "fflate";

function cleanup(text: string): string {
  return text
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export interface CvExtract {
  text: string;
  pageCount: number | null;
  hasPhoto: boolean | null;
}

/** Extract plain text (plus page count and likely photo for PDFs) from an uploaded CV. */
export async function extractCvText(bytes: Uint8Array, fileName: string): Promise<CvExtract> {
  const lower = fileName.toLowerCase();

  if (lower.endsWith(".pdf")) {
    const { getDocumentProxy, extractText } = await import("unpdf");
    const pdf = await getDocumentProxy(new Uint8Array(bytes));
    const pageCount = pdf.numPages;
    let hasPhoto: boolean | null = null;
    try {
      const page = await pdf.getPage(1);
      const ops = await page.getOperatorList();
      // 85 = paintImageXObject, 86 = paintInlineImageXObject (pdf.js OPS)
      hasPhoto = ops.fnArray.some((fn: number) => fn === 85 || fn === 86);
    } catch {
      hasPhoto = null;
    }
    const { text } = await extractText(pdf, { mergePages: true });
    return { text: cleanup(Array.isArray(text) ? text.join("\n") : text), pageCount, hasPhoto };
  }

  if (lower.endsWith(".docx")) {
    const files = unzipSync(bytes);
    const doc = files["word/document.xml"];
    if (!doc) throw new Error("This Word file could not be read.");
    const xml = strFromU8(doc);
    const hasPhoto = Object.keys(files).some((k) => k.startsWith("word/media/"));
    const text = xml
      .replace(/<w:p[^>]*>/g, "\n")
      .replace(/<w:tab[^>]*\/>/g, " ")
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    return { text: cleanup(text), pageCount: null, hasPhoto };
  }

  return { text: cleanup(new TextDecoder().decode(bytes)), pageCount: null, hasPhoto: null };
}
