import type { CycleDates, CycleInfo, Transaction } from "@/lib/types";

export function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

export function getCycleDates(monthOffset = 0): CycleDates {
  const today = new Date();
  const currentDay = today.getDate();
  const baseStartMonth =
    currentDay >= 20 ? today.getMonth() : today.getMonth() - 1;
  const start = new Date(today.getFullYear(), baseStartMonth + monthOffset, 20);
  const end = new Date(
    today.getFullYear(),
    baseStartMonth + monthOffset + 1,
    19,
    23,
    59,
    59,
    999,
  );
  return { start, end };
}

export function getTransactionCycle(timestamp: number): CycleInfo {
  const d = new Date(timestamp);
  let year = d.getFullYear();
  let month = d.getMonth();
  const day = d.getDate();

  if (day < 20) {
    month -= 1;
    if (month < 0) {
      month = 11;
      year -= 1;
    }
  }

  const startYear = year;
  const startMonth = month;
  let endYear = startYear;
  let endMonth = startMonth + 1;
  if (endMonth > 11) {
    endMonth = 0;
    endYear++;
  }

  const formatMonth = (m: number) =>
    new Date(2000, m, 1).toLocaleDateString(undefined, { month: "short" });

  return {
    key: `${startYear}-${String(startMonth + 1).padStart(2, "0")}`,
    label: `${formatMonth(startMonth)} 20 - ${formatMonth(endMonth)} 19, ${endYear}`,
  };
}

export function filterTransactionsByCycle(
  transactions: Transaction[],
  cycleDates: CycleDates,
): Transaction[] {
  const startTs = cycleDates.start.getTime();
  const endTs = cycleDates.end.getTime();
  return transactions.filter((t) => {
    const ts = dateStringToTimestamp(t.transactionDate);
    return ts >= startTs && ts <= endTs;
  });
}

export function formatDateStr(date: Date): string {
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function dateStringToTimestamp(dateStr: string): number {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).getTime();
}
