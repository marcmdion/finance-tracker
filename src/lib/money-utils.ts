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

export function roundToCents(amount: number): number {
  const cents = Math.round(amount * 100);
  return cents === 0 ? 0 : cents / 100;
}

export function isNegativeAmount(amount: number): boolean {
  return roundToCents(amount) < 0;
}

const amountFormatter = new Intl.NumberFormat("en-NZ", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatAmount(amount: number): string {
  return amountFormatter.format(Math.abs(roundToCents(amount)));
}

export function formatCurrency(amount: number): string {
  return `$${formatAmount(amount)}`;
}

export function formatSignedCurrency(amount: number): string {
  const rounded = roundToCents(amount);

  if (isNegativeAmount(rounded)) {
    return `−$${formatAmount(rounded)}`;
  }

  return `$${formatAmount(rounded)}`;
}

export function formatMoney(cents: number, options?: { signed?: boolean; type?: "income" | "expense" }): string {
  const formatted = formatCurrency(centsToAmount(Math.abs(cents)));

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
