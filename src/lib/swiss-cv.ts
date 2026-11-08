/**
 * Swiss application knowledge, summarised (not copied) from
 * "Career Starter 2026" (talendo ag). Client-safe: no server imports.
 */

export const APP_VERSION = "2.1";

export const SWISS_CV_RULES: { id: string; label: string; detail: string }[] = [
  { id: "contact", label: "Contact details", detail: "Name, address, phone, email and LinkedIn present, without labels like 'Address:' or 'Phone:'." },
  { id: "personal", label: "Personal details", detail: "Date of birth and nationality are expected in Switzerland; non-Swiss candidates should state their work permit (B, C, G…)." },
  { id: "photo", label: "Professional photo", detail: "A professional, authentic application photo is customary in Switzerland." },
  { id: "order", label: "Reverse chronological order", detail: "Education and experience start with the most recent entry; drop very old, irrelevant items." },
  { id: "sections", label: "Standard sections", detail: "Contact, personal info, education, work experience, other activities, languages, IT skills, interests." },
  { id: "languages", label: "Language levels", detail: "Each language with a clear level (native, fluent, very good, good, basic or CEFR A1–C2)." },
  { id: "length", label: "Length", detail: "Students and graduates: one page. Experienced professionals: at most two pages." },
  { id: "keywords", label: "Job ad keywords", detail: "Key terms and required skills from the job ad appear in the CV." },
  { id: "references", label: "References", detail: "Don't list references unless the ad asks; prepare at least two informed referees separately." },
  { id: "format", label: "Clean format", detail: "No signature, no header or footer, a plain readable font, no fancy headings." },
  { id: "spelling", label: "Spelling and grammar", detail: "No spelling or grammar mistakes." },
  { id: "interests", label: "Specific interests", detail: "Interests that show personality (team sport, club role, endurance sport), not 'travel, cinema, reading'." },
  { id: "generic", label: "Not generic", detail: "Specific achievements, numbers and domain context for this role — not a generic CV sent everywhere (ISA 2026: recruiters screen out interchangeable CVs)." },
  { id: "honesty", label: "Honest claims", detail: "No inflated achievements, skills or diplomas — everything can be verified." },
];

export const SWISS_TIPS = {
  interview: [
    "Prepare to answer about your motivation for this company and role specifically.",
    "Greet everyone properly and keep eye contact — the first impression counts.",
    "Have two or three thoughtful questions ready for the end.",
    "Expect the salary question by the second interview at the latest.",
  ],
  assessmentCentre: [
    "You are assessed the whole time, including during breaks.",
    "Be confident but collegial towards other candidates.",
    "Stay authentic — playing a role all day is exhausting and assessors notice.",
    "Bring a watch and keep to the schedule.",
    "Use trial assessment centres offered by universities if you can.",
  ],
  salary: [
    "State your expectation as a specific annual gross figure in CHF.",
    "Research typical starting salaries for your degree and industry before the first interview.",
    "Salary negotiations are individual — tables are only a guide.",
  ],
  application: [
    "Email: inviting subject line, short text, sign off with full name, address and phone, attach all documents.",
    "Online forms: use free-text fields, save your progress, don't forget uploads.",
    "LinkedIn: up-to-date profile with a concise keyword title, 'Open to' activated, CV and references ready.",
  ],
};

export type Degree = "bachelor_uni" | "master_uni" | "doctorate_uni" | "bachelor_uas" | "master_uas";

export const DEGREE_LABELS: Record<Degree, string> = {
  bachelor_uni: "Bachelor (university)",
  master_uni: "Master (university)",
  doctorate_uni: "Doctorate (university)",
  bachelor_uas: "Bachelor (applied sciences)",
  master_uas: "Master (applied sciences)",
};

/** Annual gross starting salaries in CHF (Career Starter 2026). null = no data. */
export const STARTING_SALARIES: Record<string, Partial<Record<Degree, number>>> = {
  "Humanities and social sciences": { bachelor_uni: 72000, master_uni: 79300, doctorate_uni: 90000 },
  Economics: { bachelor_uni: 80000, master_uni: 87100, doctorate_uni: 108000, bachelor_uas: 82400, master_uas: 100000 },
  Law: { bachelor_uni: 63300, master_uni: 65000, doctorate_uni: 120000 },
  "Exact and natural sciences": { bachelor_uni: 75600, master_uni: 75000, doctorate_uni: 89000 },
  "Medicine and pharmacy": { bachelor_uni: 45000, master_uni: 89300, doctorate_uni: 100300 },
  "Technical sciences": { bachelor_uni: 54000, master_uni: 80000, doctorate_uni: 95900 },
  "Technology and IT": { bachelor_uas: 85800, master_uas: 89000 },
  "Architecture, construction and planning": { bachelor_uas: 78000, master_uas: 81300 },
  "Chemistry and life sciences": { bachelor_uas: 81300, master_uas: 89000 },
  "Agriculture and forestry": { bachelor_uas: 80000 },
  "Social work": { bachelor_uas: 81500, master_uas: 102000 },
  "Applied psychology": { bachelor_uas: 83200, master_uas: 101000 },
  Health: { bachelor_uas: 73300, master_uas: 92500 },
  "Applied linguistics": { bachelor_uas: 78000 },
  "Music, theatre and other arts": { bachelor_uas: 57000, master_uas: 67600 },
};

export const SALARY_FIELDS = Object.keys(STARTING_SALARIES);

/** Suggested range: ±5% around the guide's figure, rounded to CHF 1,000. */
export function salaryRange(field: string, degree: Degree): { low: number; mid: number; high: number } | null {
  const mid = STARTING_SALARIES[field]?.[degree];
  if (mid == null) return null;
  const r = (n: number) => Math.round(n / 1000) * 1000;
  return { low: r(mid * 0.95), mid, high: r(mid * 1.05) };
}

/** Max CV pages for the candidate's experience level. */
export function maxCvPages(yearsExperience: number): 1 | 2 {
  return yearsExperience < 2 ? 1 : 2;
}

export const LIMITS = {
  fileBytes: 10 * 1024 * 1024,
  jobDescription: 12000,
  title: 200,
  answer: 10000,
  audioBytes: 14 * 1024 * 1024,
} as const;

/** Throws a user-facing error when prep input is out of bounds. */
export function validatePrepInput(input: { roleTitle: string; companyName: string; jobDescription: string; fileBase64: string; fileName: string }) {
  if (!input.roleTitle.trim() || input.roleTitle.length > LIMITS.title) throw new Error("Job title must be 1–200 characters.");
  if (!input.companyName.trim() || input.companyName.length > LIMITS.title) throw new Error("Company must be 1–200 characters.");
  if (input.jobDescription.trim().length < 30) throw new Error("Paste the full job description.");
  if (input.jobDescription.length > LIMITS.jobDescription) throw new Error("Job description is too long (max 12,000 characters).");
  if (input.fileBase64) {
    if (input.fileBase64.length * 0.75 > LIMITS.fileBytes) throw new Error("CV file must be under 10MB.");
    if (!/\.(pdf|docx|txt|md)$/i.test(input.fileName)) throw new Error("Upload a PDF, Word (.docx) or text file.");
  }
}

/** Check file magic bytes match the extension. */
export function fileMatchesType(bytes: Uint8Array, fileName: string): boolean {
  const n = fileName.toLowerCase();
  if (n.endsWith(".pdf")) return bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;
  if (n.endsWith(".docx")) return bytes[0] === 0x50 && bytes[1] === 0x4b;
  return !bytes.slice(0, 2048).includes(0);
}

/* ---------- Free plan limits ---------- */
export const CREDITS = {
  /** Full mock interviews every new account gets. */
  free: 3,
  /** A Buy Me a Coffee payment tops the balance back up to this. */
  coffeeResetTo: 3,
  /** Default interviews a promo (event) code adds. */
  promoGrant: 6,
} as const;

/** Placeholder until the owner shares the real Buy Me a Coffee page. */
export const COFFEE_URL = "https://buymeacoffee.com/rafaeloliveirarodrigues";

export function afterCoffee(remaining: number): number {
  return Math.max(remaining, CREDITS.coffeeResetTo);
}
export function afterPromo(remaining: number, grants: number = CREDITS.promoGrant): number {
  return Math.max(remaining, 0) + grants;
}
export function canStartInterview(remaining: number): boolean {
  return remaining > 0;
}

/* ---------- Interview languages ---------- */
export type InterviewLanguage = "en" | "de" | "fr" | "it";
export const LANGUAGES: Record<InterviewLanguage, { label: string; name: string; prompt: string }> = {
  en: { label: "English", name: "English", prompt: "Write everything in English." },
  de: { label: "Deutsch", name: "German", prompt: "Write everything in Swiss Standard German (Hochdeutsch, Swiss spelling with 'ss' instead of 'ß'). Use Swiss terms such as 'Lohnvorstellung', 'Bewerbungsgespräch', CHF." },
  fr: { label: "Français", name: "French", prompt: "Write everything in French as used in Suisse romande (e.g. 'septante', 'nonante', 'prétentions salariales', CHF)." },
  it: { label: "Italiano", name: "Italian", prompt: "Write everything in Italian as used in Ticino (e.g. 'pretese salariali', 'colloquio di lavoro', CHF)." },
};
export function toLanguage(v: unknown): InterviewLanguage {
  return v === "de" || v === "fr" || v === "it" ? v : "en";
}

/* ---------- ISA 2026 market insights (summarised in our own words) ---------- */
export const ISA_INSIGHTS = [
  "The Swiss market rewards specialists with clear domain context over generalists with generic CVs.",
  "Senior professionals are hired for judgement: expect questions on trade-offs, risk and decisions under uncertainty.",
  "Many roles are filled through networks before they are advertised — informal coffee chats matter.",
  "Spend most of your search time on networking and targeted outreach, and less on mass applications.",
  "Show a concrete, quantified track record and how it transfers to the hiring company's situation.",
];

export const PAYROLL_2026 = { ahv: 0.053, alv: 0.011, alvCeiling: 148200 } as const;
export const RAV_TARGET = 10;
export const CANTONS = ['AG','AI','AR','BE','BL','BS','FR','GE','GL','GR','JU','LU','NE','NW','OW','SG','SH','SO','SZ','TG','TI','UR','VD','VS','ZG','ZH'] as const;
export const SWISS_TOOL_SOURCES = {
  tax: 'https://swisstaxcalculator.estv.admin.ch/',
  contributions: 'https://sozialversicherungen.admin.ch/de/d/6877/download',
  rav: 'https://www.arbeit.swiss/de/stellensuchende/eservices-und-formulare-fuer-die-arbeitslosenentschaedigung',
};
export const FILLERS: Record<InterviewLanguage, string[]> = {
  en: ['um', 'uh', 'erm', 'you know', 'i mean'],
  de: ['äh', 'ähm', 'sozusagen', 'quasi'],
  fr: ['euh', 'bah', 'ben', 'du coup'],
  it: ['ehm', 'cioè', 'diciamo', 'praticamente'],
};
