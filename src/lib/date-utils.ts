export const DATE_LOCALE = "en-NZ";

const DISPLAY_DATE: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "numeric",
  year: "numeric",
};

const DISPLAY_DATE_MEDIUM: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
};

const DISPLAY_DATETIME: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
};

export function parseDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString(DATE_LOCALE, DISPLAY_DATE);
}

export function formatDisplayDateMedium(date: Date): string {
  return date.toLocaleDateString(DATE_LOCALE, DISPLAY_DATE_MEDIUM);
}

export function formatTransactionDate(dateStr: string): string {
  return formatDisplayDate(parseDateString(dateStr));
}

export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString(DATE_LOCALE, DISPLAY_DATETIME);
}

export function formatMonthShort(monthIndex: number): string {
  return new Date(2000, monthIndex, 1).toLocaleDateString(DATE_LOCALE, {
    month: "short",
  });
}

export function formatCycleLabel(
  startMonth: number,
  endMonth: number,
  endYear: number,
): string {
  return `20 ${formatMonthShort(startMonth)} – 19 ${formatMonthShort(endMonth)} ${endYear}`;
}

export function getTodayString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getTodayFilenameDate(): string {
  return formatDisplayDate(new Date()).replace(/\//g, "-");
}
