import type { Transaction } from "@/lib/types";

export function getCategorySummaries(
  transactions: Transaction[],
): { name: string; count: number }[] {
  const counts = new Map<string, number>();

  transactions.forEach((transaction) => {
    const category = transaction.category.trim();
    if (!category) return;
    counts.set(category, (counts.get(category) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function findSimilarCategories(categories: string[]): string[][] {
  const groups: string[][] = [];
  const used = new Set<string>();

  categories.forEach((category) => {
    if (used.has(category)) return;

    const normalized = category.trim().toLowerCase();
    const group = categories.filter(
      (candidate) => candidate.trim().toLowerCase() === normalized,
    );

    group.forEach((item) => used.add(item));
    if (group.length > 1) {
      groups.push(group);
    }
  });

  return groups;
}
