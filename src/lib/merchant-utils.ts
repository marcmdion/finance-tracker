import type { Transaction } from "@/lib/types";

export interface MerchantRecategorizeRule {
  id: string;
  merchantPattern: RegExp;
  targetName: string;
  targetCategory: string;
  sourceCategory?: string;
  type?: Transaction["type"];
}

export function matchesMerchantRule(
  transaction: Transaction,
  rule: MerchantRecategorizeRule,
): boolean {
  if (!rule.merchantPattern.test(transaction.name.trim())) {
    return false;
  }

  if (rule.sourceCategory && transaction.category !== rule.sourceCategory) {
    return false;
  }

  if (rule.type && transaction.type !== rule.type) {
    return false;
  }

  return true;
}

export function findMerchantMatches(
  transactions: Transaction[],
  rule: MerchantRecategorizeRule,
): Transaction[] {
  return transactions.filter((transaction) =>
    matchesMerchantRule(transaction, rule),
  );
}

export function merchantMigrationStorageKey(userId: string, migrationId: string) {
  return `merchant-migration:${userId}:${migrationId}`;
}

export function isMerchantMigrationComplete(
  userId: string,
  migrationId: string,
): boolean {
  if (typeof window === "undefined") return true;
  return (
    window.localStorage.getItem(
      merchantMigrationStorageKey(userId, migrationId),
    ) === "done"
  );
}

export function markMerchantMigrationComplete(
  userId: string,
  migrationId: string,
) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    merchantMigrationStorageKey(userId, migrationId),
    "done",
  );
}
