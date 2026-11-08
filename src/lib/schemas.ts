import { z } from "zod";

export const companyBriefSchema = z.object({
  summary: z.string(),
  whatTheyDo: z.string(),
  culture: z.array(z.string()),
  recentNews: z.array(z.object({ headline: z.string(), takeaway: z.string() })),
  interviewReputation: z.string(),
  talkingPoints: z.array(z.string()),
  questionsToAskThem: z.array(z.string()),
});
export type CompanyBrief = z.infer<typeof companyBriefSchema>;

export const interviewGuideSchema = z.object({
  overview: z.string(),
  stages: z.array(
    z.object({
      name: z.string(),
      format: z.string(),
      duration: z.string(),
      focus: z.string(),
      tips: z.array(z.string()),
    }),
  ),
  likelyQuestions: z.array(z.object({ question: z.string(), why: z.string() })),
  redFlags: z.array(z.string()),
});
export type InterviewGuide = z.infer<typeof interviewGuideSchema>;

export const cvReviewSchema = z.object({
  matchScore: z.number(),
  verdict: z.string(),
  strengths: z.array(z.string()),
  requirements: z.array(
    z.object({
      requirement: z.string(),
      status: z.enum(["strong", "partial", "missing"]),
      advice: z.string(),
    }),
  ),
  improvements: z.array(
    z.object({
      priority: z.enum(["high", "medium", "low"]),
      area: z.string(),
      suggestion: z.string(),
    }),
  ),
  missingKeywords: z.array(z.string()),
});
export type CvReview = z.infer<typeof cvReviewSchema>;

export const reportSchema = z.object({
  overallScore: z.number(),
  headline: z.string(),
  summary: z.string(),
  dimensions: z.array(
    z.object({ name: z.string(), score: z.number(), comment: z.string() }),
  ),
  perQuestion: z.array(
    z.object({
      question: z.string(),
      score: z.number(),
      whatWorked: z.string(),
      whatToFix: z.string(),
      strongerAnswer: z.string(),
    }),
  ),
  nextSteps: z.array(z.string()),
});
export type InterviewReport = z.infer<typeof reportSchema>;

export const swissCvReviewSchema = z.object({
  swissScore: z.number(),
  cvLanguage: z.enum(["German", "French", "Italian", "English", "Other"]),
  experienceLevel: z.enum(["student", "graduate", "experienced"]),
  verdict: z.string(),
  checks: z.array(
    z.object({
      ruleId: z.string(),
      label: z.string(),
      status: z.enum(["pass", "warn", "fail"]),
      finding: z.string(),
      fix: z.string(),
    }),
  ),
  salaryField: z.string(),
  salaryDegree: z.enum(["bachelor_uni", "master_uni", "doctorate_uni", "bachelor_uas", "master_uas"]),
  likelyAssessmentCentre: z.boolean(),
});
export type SwissCvReview = z.infer<typeof swissCvReviewSchema>;

export const QUESTION_KINDS = [
  "intro",
  "behavioural",
  "technical",
  "company-fit",
  "closing",
] as const;
