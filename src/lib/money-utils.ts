import type { TransactionFormData } from "@/lib/types";

export function parseAmountToCents(amount: string): number | null {
  const parsed = Number.parseFloat(amount);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return Math.round(parsed * 100);
}

export function validateTransactionAmount(amount: string): string | null {
  if (!amount.trim()) {
    return "Amount is required.";
  }

  const parsed = Number.parseFloat(amount);
  if (!Number.isFinite(parsed) || Number.isNaN(parsed)) {
    return "Enter a valid number.";
  }

  if (parsed <= 0) {
    return "Amount must be greater than zero.";
  }

  if (parsed > 10_000_000) {
    return "Amount is too large.";
  }

  return null;
}

export function centsToAmount(cents: number): number {
  return cents / 100;
}

export function formatMoney(cents: number, options?: { signed?: boolean; type?: "income" | "expense" }): string {
  const value = centsToAmount(Math.abs(cents));
  const formatted = `$${value.toFixed(2)}`;

  if (!options?.signed) {
    return formatted;
  }

  if (options.type === "income") {
    return `+${formatted}`;
  }

  if (options.type === "expense") {
    return `−${formatted}`;
  }

  return formatted;
}

export function formDataAmountError(formData: TransactionFormData): string | null {
  return validateTransactionAmount(formData.amount);
}
