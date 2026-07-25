import { centsToAmount } from "@/lib/money-utils";
import type { SankeyData, Transaction } from "@/lib/types";

export function buildSankeyData(
  transactions: Transaction[],
  totalIncome: number,
  totalExpenses: number,
  netBalance: number,
): SankeyData | null {
  if (totalIncome === 0 && totalExpenses === 0) return null;

  const nodes: SankeyData["nodes"] = [];
  const links: SankeyData["links"] = [];
  const nodeMap = new Map<string, number>();
  const totalFlow = Math.max(totalIncome, totalExpenses);

  const addNode = (id: string, displayLabel: string) => {
    if (!nodeMap.has(id)) {
      nodeMap.set(id, nodes.length);
      nodes.push({ name: id, displayLabel, totalFlow });
    }
    return nodeMap.get(id)!;
  };

  const budgetId = addNode("Total Budget", "Total Budget");

  const incomesByCategory = transactions
    .filter((t) => t.type === "income")
    .reduce<Record<string, number>>((acc, t) => {
      const cat = t.category || "Other Income";
      acc[cat] = (acc[cat] || 0) + centsToAmount(t.amountCents);
      return acc;
    }, {});

  Object.entries(incomesByCategory).forEach(([category, amount]) => {
    if (amount > 0) {
      const incId = addNode(`${category} (Income)`, category);
      links.push({ source: incId, target: budgetId, value: amount });
    }
  });

  if (netBalance < 0) {
    const deficitId = addNode("Overspend (Deficit)", "Overspend / Deficit");
    links.push({
      source: deficitId,
      target: budgetId,
      value: Math.abs(netBalance),
    });
  }

  const expensesByCategory = transactions
    .filter((t) => t.type === "expense")
    .reduce<Record<string, number>>((acc, t) => {
      const cat = t.category || "Other Expense";
      acc[cat] = (acc[cat] || 0) + centsToAmount(t.amountCents);
      return acc;
    }, {});

  Object.entries(expensesByCategory).forEach(([category, amount]) => {
    if (amount > 0) {
      const expId = addNode(category, category);
      links.push({ source: budgetId, target: expId, value: amount });
    }
  });

  if (netBalance > 0) {
    const savingsId = addNode("Net Balance (Savings)", "Net Balance / Savings");
    links.push({ source: budgetId, target: savingsId, value: netBalance });
  }

  return { nodes, links };
}
