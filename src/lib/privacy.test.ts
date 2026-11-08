import { describe, expect, it } from "vitest";
import { hasCurrentConsent, inactivityAction, PRIVACY_POLICY_VERSION } from "./privacy";

const d = (s: string) => new Date(s);

describe("privacy rules", () => {
  it("current policy is version 1", () => {
    expect(PRIVACY_POLICY_VERSION).toBe(1);
    expect(hasCurrentConsent(null)).toBe(false);
    expect(hasCurrentConsent(1)).toBe(true);
  });

  it("does nothing before 21 months of inactivity", () => {
    expect(inactivityAction({ lastActive: d("2024-01-15"), warnedAt: null, now: d("2025-10-01") })).toBe("none");
  });

  it("warns at 21 months", () => {
    expect(inactivityAction({ lastActive: d("2024-01-15"), warnedAt: null, now: d("2025-10-16") })).toBe("warn");
  });

  it("does not delete at 22 months even after a warning", () => {
    expect(inactivityAction({ lastActive: d("2024-01-15"), warnedAt: d("2025-10-16"), now: d("2025-11-20") })).toBe("none");
  });

  it("deletes at 24 months after a warning", () => {
    expect(inactivityAction({ lastActive: d("2024-01-15"), warnedAt: d("2025-10-16"), now: d("2026-01-16") })).toBe("delete");
  });

  it("never deletes without a prior warning email", () => {
    expect(inactivityAction({ lastActive: d("2020-01-01"), warnedAt: null, now: d("2026-01-01") })).toBe("warn");
  });

  it("ignores a warning sent before the user came back", () => {
    expect(inactivityAction({ lastActive: d("2024-01-15"), warnedAt: d("2023-01-01"), now: d("2026-02-01") })).toBe("warn");
  });
});
