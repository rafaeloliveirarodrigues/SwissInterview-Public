import { FILLERS, PAYROLL_2026, toLanguage } from './swiss-cv';
export interface SpeechMetrics { transcript: string; durationSeconds: number; wordCount: number; wpm: number | null; fillers: { phrase: string; count: number }[]; fillerCount: number }
export function measureSpeech(transcript: string, durationSeconds: number | null, language: string): SpeechMetrics {
  const words = transcript.match(/[\p{L}\p{N}]+(?:['’][\p{L}]+)*/gu) ?? [];
  const normalized = ` ${transcript.toLowerCase().replace(/[^\p{L}\p{N}'’]+/gu, ' ')} `;
  const fillers = FILLERS[toLanguage(language)].map(phrase => ({ phrase, count: Array.from(normalized.matchAll(new RegExp(`(?= ${phrase} )`, 'gu'))).length })).filter(f => f.count > 0);
  return { transcript, durationSeconds: durationSeconds ?? 0, wordCount: words.length, wpm: durationSeconds && durationSeconds > 0 ? Math.round(words.length * 60 / durationSeconds) : null, fillers, fillerCount: fillers.reduce((n, f) => n + f.count, 0) };
}
export function salaryEstimate(input: { base: number; basis: 'annual' | 'monthly'; thirteenth: boolean; bonus: number; pension: number; accident: number; other: number; tax: number | null }) {
  if ([input.base,input.bonus,input.pension,input.accident,input.other,input.tax ?? 0].some(n=>!Number.isFinite(n)||n<0)) throw new Error('Amounts must be finite and non-negative.');
  const baseAnnual = input.basis === 'annual' ? input.base : input.base * (input.thirteenth ? 13 : 12);
  const gross = baseAnnual + input.bonus;
  const ahv = gross * PAYROLL_2026.ahv;
  const alv = Math.min(gross, PAYROLL_2026.alvCeiling) * PAYROLL_2026.alv;
  const deductions = ahv + alv + input.pension + input.accident + input.other;
  return { gross, baseAnnual, regularGross: baseAnnual / (input.thirteenth ? 13 : 12), ahv, alv, deductions, beforeTax: gross - deductions, afterTax: input.tax === null ? null : gross - deductions - input.tax };
}
export function monthBounds(month: string) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) throw new Error('Choose a valid month.');
  const [year, m] = month.split('-').map(Number);
  if (year === undefined || m === undefined || year < 1900 || year > 9998) throw new Error('Choose a valid month.');
  const endYear = m === 12 ? year + 1 : year;
  const endMonth = m === 12 ? 1 : m + 1;
  return { start: `${month}-01`, end: `${endYear}-${String(endMonth).padStart(2, '0')}-01`, deadline: `${endYear}-${String(endMonth).padStart(2, '0')}-05` };
}