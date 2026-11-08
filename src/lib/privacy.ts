// Client-safe privacy constants and rules (shared by UI, server and tests).

/** Bump when the privacy policy changes materially; users are asked to consent again. */
export const PRIVACY_POLICY_VERSION = 1;

export const CONTROLLER = {
  name: "Rafael Rodrigues",
  street: "Hamelirainstrasse 3",
  city: "8302 Kloten",
  country: "Switzerland",
  email: "ror@digisustainability.io",
} as const;

export const INACTIVITY_WARN_MONTHS = 21;
export const INACTIVITY_DELETE_MONTHS = 24;
/** Minimum time between the warning email and deletion. */
export const MIN_WARNING_NOTICE_DAYS = 30;

/** localStorage key holding the policy version ticked on the sign-in page before an account existed. */
export const PENDING_CONSENT_KEY = "offer-ready-privacy-consent-pending";

export function hasCurrentConsent(version: number | null | undefined) {
  return typeof version === "number" && version >= PRIVACY_POLICY_VERSION;
}

export function addMonths(date: Date, months: number) {
  const d = new Date(date);
  d.setUTCMonth(d.getUTCMonth() + months);
  return d;
}

export type InactivityAction = "none" | "warn" | "delete";

/**
 * Decide what the monthly job does for one account.
 * - warn once at 21+ months of inactivity (or again if activity happened after the last warning)
 * - delete at 24+ months, but only if a warning was sent at least 30 days earlier
 */
export function inactivityAction(input: {
  lastActive: Date;
  warnedAt: Date | null;
  now: Date;
}): InactivityAction {
  const { lastActive, now } = input;
  const warnedAt = input.warnedAt && input.warnedAt > lastActive ? input.warnedAt : null;
  if (now < addMonths(lastActive, INACTIVITY_WARN_MONTHS)) return "none";
  if (!warnedAt) return "warn";
  const noticeOk = now.getTime() - warnedAt.getTime() >= MIN_WARNING_NOTICE_DAYS * 86_400_000;
  if (now >= addMonths(lastActive, INACTIVITY_DELETE_MONTHS) && noticeOk) return "delete";
  return "none";
}

export function latestDate(...dates: (string | null | undefined)[]) {
  const times = dates.filter(Boolean).map((d) => new Date(d as string).getTime()).filter((t) => !Number.isNaN(t));
  return new Date(times.length ? Math.max(...times) : 0);
}
