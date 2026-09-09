import {
  formatTimestamp,
  formatTransactionDate,
  getTodayFilenameDate,
} from "@/lib/date-utils";
import type { Transaction } from "@/lib/types";
import { centsToAmount } from "@/lib/money-utils";

export function exportTransactionsToCsv(transactions: Transaction[]): string {
  const headers = [
    "Date",
    "Type",
    "Name",
    "Category",
    "Amount",
    "Created At",
    "Updated At",
  ];

  const rows = transactions
    .slice()
    .sort((a, b) => b.transactionDate.localeCompare(a.transactionDate))
    .map((transaction) => [
      formatTransactionDate(transaction.transactionDate),
      transaction.type,
      escapeCsvField(transaction.name),
      escapeCsvField(transaction.category),
      centsToAmount(transaction.amountCents).toFixed(2),
      formatTimestamp(transaction.createdAt),
      transaction.updatedAt ? formatTimestamp(transaction.updatedAt) : "",
    ]);

  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function escapeCsvField(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function buildExportFilename(prefix = "finance-strategist"): string {
  return `${prefix}-${getTodayFilenameDate()}.csv`;
}
