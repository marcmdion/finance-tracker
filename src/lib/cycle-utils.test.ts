import { describe, expect, it } from "vitest";
import { getCycleDates } from "@/lib/cycle-utils";

describe("getCycleDates", () => {
  it("uses the 20th as the cycle start when today is on or after the 20th", () => {
    const dates = getCycleDates(0);
    expect(dates.start.getDate()).toBe(20);
    expect(dates.end.getDate()).toBe(19);
  });

  it("moves to the previous month when today is before the 20th", () => {
    const reference = new Date(2026, 6, 10);
    const currentDay = reference.getDate();
    const baseStartMonth =
      currentDay >= 20 ? reference.getMonth() : reference.getMonth() - 1;
    const start = new Date(reference.getFullYear(), baseStartMonth, 20);

    expect(start.getMonth()).toBe(5);
    expect(start.getDate()).toBe(20);
  });
});
