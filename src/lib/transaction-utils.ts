import { dateStringToTimestamp } from "@/lib/cycle-utils";
import { parseAmountToCents } from "@/lib/money-utils";
import type { Transaction, TransactionFormData, TransactionType } from "@/lib/types";

type FirestoreTransaction = Record<string, unknown>;

function timestampToDateString(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function normalizeTransaction(
  id: string,
  data: FirestoreTransaction,
): Transaction {
  const amountCents =
    typeof data.amountCents === "number"
      ? data.amountCents
      : Math.round(Number(data.amount ?? 0) * 100);

  const transactionDate =
    typeof data.transactionDate === "string"
      ? data.transactionDate
      : typeof data.date === "string"
        ? data.date
        : timestampToDateString(Number(data.createdAt ?? Date.now()));

  const createdAt =
    typeof data.recordedAt === "number"
      ? data.recordedAt
      : Number(data.createdAt ?? Date.now());

  return {
    id,
    type: (data.type as TransactionType) ?? "expense",
    amountCents,
    name: String(data.name ?? ""),
    category: String(data.category ?? ""),
    transactionDate,
    createdAt,
    updatedAt:
      typeof data.updatedAt === "number" ? data.updatedAt : undefined,
  };
}

export function needsMigration(data: FirestoreTransaction): boolean {
  return (
    typeof data.transactionDate !== "string" ||
    typeof data.amountCents !== "number" ||
    typeof data.recordedAt !== "number"
  );
}

export function toFirestorePayload(
  transaction: Omit<Transaction, "id">,
): FirestoreTransaction {
  return {
    type: transaction.type,
    amountCents: transaction.amountCents,
    name: transaction.name,
    category: transaction.category,
    transactionDate: transaction.transactionDate,
    recordedAt: transaction.createdAt,
    updatedAt: transaction.updatedAt ?? Date.now(),
  };
}

export function formDataToTransaction(
  formData: TransactionFormData,
  existing?: Transaction,
): Omit<Transaction, "id"> | null {
  const amountCents = parseAmountToCents(formData.amount);
  if (amountCents === null) {
    return null;
  }

  const now = Date.now();

  return {
    type: formData.type,
    amountCents,
    name: formData.name.trim(),
    category: formData.category.trim(),
    transactionDate: formData.date,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}

export function transactionTimestamp(transaction: Transaction): number {
  return dateStringToTimestamp(transaction.transactionDate);
}

export function transactionToFormData(transaction: Transaction) {
  return {
    type: transaction.type,
    amount: (transaction.amountCents / 100).toFixed(2),
    name: transaction.name,
    category: transaction.category,
    date: transaction.transactionDate,
  };
}
