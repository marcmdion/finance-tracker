export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  type: TransactionType;
  amountCents: number;
  name: string;
  category: string;
  transactionDate: string;
  createdAt: number;
  updatedAt?: number;
}

export interface TransactionFormData {
  type: TransactionType;
  amount: string;
  name: string;
  category: string;
  date: string;
}

export interface CycleDates {
  start: Date;
  end: Date;
}

export interface CycleInfo {
  key: string;
  label: string;
}

export interface SankeyNode {
  name: string;
  displayLabel: string;
  totalFlow: number;
}

export interface SankeyLink {
  source: number;
  target: number;
  value: number;
}

export interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

export interface SummaryTotals {
  income: Record<string, number>;
  expense: Record<string, number>;
  net: Record<string, number>;
}

export interface SummaryData {
  cycles: [string, string][];
  incomes: [string, Record<string, number>][];
  expenses: [string, Record<string, number>][];
  totals: SummaryTotals;
}

export interface CategoryDetailsModal {
  category: string;
  type: TransactionType;
}

export interface CategorySummary {
  name: string;
  count: number;
}
