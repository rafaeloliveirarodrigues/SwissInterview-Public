import { describe, expect, it } from "vitest";
import { fileMatchesType, maxCvPages, salaryRange, validatePrepInput } from "./swiss-cv";

const ok = { roleTitle: "PM", companyName: "UBS", jobDescription: "x".repeat(100), fileBase64: "", fileName: "" };

describe("Swiss rules", () => {
  it("looks up Economics master at university as CHF 87,100", () => {
    expect(salaryRange("Economics", "master_uni")?.mid).toBe(87100);
  });
  it("returns null when the guide has no figure", () => {
    expect(salaryRange("Law", "bachelor_uas")).toBeNull();
  });
  it("graduates get one page, experienced people two", () => {
    expect(maxCvPages(0)).toBe(1);
    expect(maxCvPages(5)).toBe(2);
  });
  it("rejects job descriptions over 12,000 characters", () => {
    expect(() => validatePrepInput({ ...ok, jobDescription: "x".repeat(12001) })).toThrow();
    expect(() => validatePrepInput(ok)).not.toThrow();
  });
  it("rejects CV files over 10MB", () => {
    expect(() => validatePrepInput({ ...ok, fileName: "a.pdf", fileBase64: "A".repeat(14_000_000) })).toThrow();
  });
  it("rejects a fake PDF", () => {
    expect(fileMatchesType(new Uint8Array([0x50, 0x4b, 3, 4]), "cv.pdf")).toBe(false);
    expect(fileMatchesType(new Uint8Array([0x25, 0x50, 0x44, 0x46]), "cv.pdf")).toBe(true);
  });
});

import { CREDITS, afterCoffee, afterPromo, canStartInterview } from "./swiss-cv";

describe("Free interview limit", () => {
  it("new accounts get 3 full interviews", () => {
    expect(CREDITS.free).toBe(3);
  });
  it("cannot start an interview with 0 left", () => {
    expect(canStartInterview(0)).toBe(false);
    expect(canStartInterview(1)).toBe(true);
  });
  it("a coffee resets the balance to 3", () => {
    expect(afterCoffee(0)).toBe(3);
    expect(afterCoffee(5)).toBe(5);
  });
  it("an event code adds 6 interviews", () => {
    expect(afterPromo(0)).toBe(6);
    expect(afterPromo(2)).toBe(8);
  });
});
