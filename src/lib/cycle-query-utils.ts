import type { CycleDates } from "@/lib/types";

export function cycleToDateStrings(cycleDates: CycleDates): {
  start: string;
  end: string;
} {
  const toDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return {
    start: toDateString(cycleDates.start),
    end: toDateString(cycleDates.end),
  };
}
