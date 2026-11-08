import { describe, it, expect } from 'vitest';
import { measureSpeech, salaryEstimate, monthBounds } from './career-tools';
import { RAV_TARGET } from './swiss-cv';
describe('Swiss career tools', () => {
  const input = { base: 100000, basis: 'annual' as const, thirteenth: true, bonus: 0, pension: 0, accident: 0, other: 0, tax: null };
  it('does not add a 13th salary twice to annual compensation', () => expect(salaryEstimate(input).gross).toBe(100000));
  it('includes 13 monthly payments and a separate bonus', () => expect(salaryEstimate({ ...input, basis: 'monthly', base: 8000, bonus: 6000 }).gross).toBe(110000));
  it('uses 5.3% employee AHV in 2026', () => expect(salaryEstimate(input).ahv).toBe(5300));
  it('caps ALV at CHF 148200', () => expect(salaryEstimate({ ...input, base: 200000 }).alv).toBeCloseTo(1630.2));
  it('does not treat missing tax as zero', () => expect(salaryEstimate(input).afterTax).toBeNull());
  it('calculates WPM from recording duration', () => expect(measureSpeech('one two three four', 2, 'en').wpm).toBe(120));
  it('does not invent WPM for typed answers', () => expect(measureSpeech('one two', null, 'en').wpm).toBeNull());
  it('counts multilingual filler phrases', () => expect(measureSpeech('Ähm ich bin quasi bereit', 3, 'de').fillerCount).toBe(2));
  it('counts consecutive fillers separately', () => expect(measureSpeech('um um uh', 2, 'en').fillerCount).toBe(3));
  it('rejects invalid salary amounts', () => expect(()=>salaryEstimate({...input,tax:-1})).toThrow());
  it('defaults RAV target to 10 actual applications', () => expect(RAV_TARGET).toBe(10));
  it('rejects year zero', () => expect(() => monthBounds('0000-01')).toThrow());
  it('keeps month boundaries and next-month deadline correct', () => expect(monthBounds('2026-12')).toEqual({start:'2026-12-01',end:'2027-01-01',deadline:'2027-01-05'}));
});