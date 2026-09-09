import { describe, expect, it } from "vitest";
import {
  formatCycleLabel,
  formatDisplayDate,
  formatDisplayDateMedium,
  formatTimestamp,
  formatTransactionDate,
  parseDateString,
} from "@/lib/date-utils";

describe("date-utils", () => {
  it("parses ISO date strings in local time", () => {
    const date = parseDateString("2026-07-21");
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(6);
    expect(date.getDate()).toBe(21);
  });

  it("formats transaction dates in NZ order", () => {
    expect(formatTransactionDate("2026-07-21")).toBe("21/07/2026");
  });

  it("formats display dates in NZ order", () => {
    expect(formatDisplayDate(new Date(2026, 6, 21))).toBe("21/07/2026");
  });

  it("formats medium display dates with day before month", () => {
    expect(formatDisplayDateMedium(new Date(2026, 6, 21))).toBe("21 Jul 2026");
  });

  it("formats cycle labels with day before month", () => {
    expect(formatCycleLabel(6, 7, 2026)).toBe("20 Jul – 19 Aug 2026");
  });

  it("formats timestamps in NZ locale", () => {
    const formatted = formatTimestamp(new Date(2026, 6, 21, 14, 30).getTime());
    expect(formatted).toContain("21/07/2026");
  });
});
