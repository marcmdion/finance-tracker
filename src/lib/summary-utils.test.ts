import { describe, expect, it } from "vitest";
import { buildSummaryData } from "@/lib/summary-utils";
import type { Transaction } from "@/lib/types";

const sampleTransactions: Transaction[] = [
  {
    id: "1",
    type: "income",
    amountCents: 500000,
    name: "Salary",
    category: "Income",
    transactionDate: "2026-07-21",
    createdAt: Date.now(),
  },
  {
    id: "2",
    type: "expense",
    amountCents: 5000,
    name: "Groceries",
    category: "Food/Groceries",
    transactionDate: "2026-07-22",
    createdAt: Date.now(),
  },
];

describe("buildSummaryData", () => {
  it("aggregates income and expenses by cycle", () => {
    const summary = buildSummaryData(sampleTransactions);
    expect(summary.incomes.length).toBe(1);
    expect(summary.expenses.length).toBe(1);
    expect(Object.keys(summary.totals.income).length).toBeGreaterThan(0);
    expect(Object.keys(summary.totals.expense).length).toBeGreaterThan(0);
  });
});
