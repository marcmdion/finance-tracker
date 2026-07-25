import { getTransactionCycle } from "@/lib/cycle-utils";
import { centsToAmount } from "@/lib/money-utils";
import { transactionTimestamp } from "@/lib/transaction-utils";
import type { SummaryData, Transaction } from "@/lib/types";

export function buildSummaryData(transactions: Transaction[]): SummaryData {
  const cycleMap = new Map<string, string>();
  const incomes = new Map<string, Record<string, number>>();
  const expenses = new Map<string, Record<string, number>>();
  const totals: SummaryData["totals"] = {
    income: {},
    expense: {},
    net: {},
  };

  transactions.forEach((t) => {
    const cycle = getTransactionCycle(transactionTimestamp(t));
    const amount = centsToAmount(t.amountCents);
    cycleMap.set(cycle.key, cycle.label);

    if (!totals.income[cycle.key]) totals.income[cycle.key] = 0;
    if (!totals.expense[cycle.key]) totals.expense[cycle.key] = 0;
    if (!totals.net[cycle.key]) totals.net[cycle.key] = 0;

    if (t.type === "income") {
      if (!incomes.has(t.category)) incomes.set(t.category, {});
      const catObj = incomes.get(t.category)!;
      catObj[cycle.key] = (catObj[cycle.key] || 0) + amount;
      totals.income[cycle.key] += amount;
      totals.net[cycle.key] += amount;
    } else {
      if (!expenses.has(t.category)) expenses.set(t.category, {});
      const catObj = expenses.get(t.category)!;
      catObj[cycle.key] = (catObj[cycle.key] || 0) + amount;
      totals.expense[cycle.key] += amount;
      totals.net[cycle.key] -= amount;
    }
  });

  return {
    cycles: Array.from(cycleMap.entries()).sort((a, b) =>
      a[0].localeCompare(b[0]),
    ),
    incomes: Array.from(incomes.entries()).sort((a, b) =>
      a[0].localeCompare(b[0]),
    ),
    expenses: Array.from(expenses.entries()).sort((a, b) =>
      a[0].localeCompare(b[0]),
    ),
    totals,
  };
}
