"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { CategoryDetailsModal, SummaryData, TransactionType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface SummaryTableProps {
  summaryData: SummaryData;
  onCategoryClick: (modal: CategoryDetailsModal) => void;
}

type SortDirection = "asc" | "desc";
type SortKey = "category" | "total" | string;

interface SortState {
  key: SortKey;
  direction: SortDirection;
}

const TOTAL_COLUMN_CLASS =
  "w-[7.25rem] shrink-0 border-l border-border/50 bg-card/95 shadow-[-8px_0_16px_-12px_oklch(0.2_0.02_265/0.18)] sm:w-[7.75rem]";

function sumRowAmounts(
  amounts: Record<string, number>,
  cycleKeys: string[],
): number {
  return cycleKeys.reduce((sum, key) => sum + (amounts[key] || 0), 0);
}

function sortCategoryEntries(
  entries: [string, Record<string, number>][],
  sort: SortState,
  cycleKeys: string[],
) {
  const next = [...entries];

  next.sort((a, b) => {
    let cmp = 0;

    if (sort.key === "category") {
      cmp = a[0].localeCompare(b[0]);
    } else if (sort.key === "total") {
      cmp =
        sumRowAmounts(a[1], cycleKeys) - sumRowAmounts(b[1], cycleKeys);
    } else {
      cmp = (a[1][sort.key] || 0) - (b[1][sort.key] || 0);
    }

    return sort.direction === "asc" ? cmp : -cmp;
  });

  return next;
}

function nextSortState(current: SortState, key: SortKey): SortState {
  if (current.key === key) {
    return {
      key,
      direction: current.direction === "asc" ? "desc" : "asc",
    };
  }

  return {
    key,
    direction: key === "category" ? "asc" : "desc",
  };
}

function SortIcon({ active, direction }: { active: boolean; direction: SortDirection }) {
  if (!active) {
    return <ArrowUpDown className="size-3 opacity-40" strokeWidth={1.75} />;
  }

  return direction === "asc" ? (
    <ArrowUp className="size-3" strokeWidth={1.75} />
  ) : (
    <ArrowDown className="size-3" strokeWidth={1.75} />
  );
}

function formatRowTotal(
  rowTotal: number,
  type: TransactionType,
  rowTotalPercentage: number,
) {
  if (rowTotal <= 0) return "—";

  return (
    <span className="whitespace-nowrap">
      ${rowTotal.toFixed(2)}
      {type === "expense" && (
        <span className="ml-1.5 text-[0.68rem] text-muted-foreground/60">
          {rowTotalPercentage}%
        </span>
      )}
    </span>
  );
}

export function SummaryTable({
  summaryData,
  onCategoryClick,
}: SummaryTableProps) {
  const cycleKeys = useMemo(
    () => summaryData.cycles.map(([key]) => key),
    [summaryData.cycles],
  );

  const mainColumnCount = summaryData.cycles.length + 1;

  const [incomeSort, setIncomeSort] = useState<SortState>({
    key: "category",
    direction: "asc",
  });
  const [expenseSort, setExpenseSort] = useState<SortState>({
    key: "category",
    direction: "asc",
  });

  const sortedIncomes = useMemo(
    () => sortCategoryEntries(summaryData.incomes, incomeSort, cycleKeys),
    [summaryData.incomes, incomeSort, cycleKeys],
  );

  const sortedExpenses = useMemo(
    () => sortCategoryEntries(summaryData.expenses, expenseSort, cycleKeys),
    [summaryData.expenses, expenseSort, cycleKeys],
  );

  const grandIncomeTotal = useMemo(
    () =>
      cycleKeys.reduce(
        (sum, key) => sum + (summaryData.totals.income[key] || 0),
        0,
      ),
    [cycleKeys, summaryData.totals.income],
  );

  const grandExpenseTotal = useMemo(
    () =>
      cycleKeys.reduce(
        (sum, key) => sum + (summaryData.totals.expense[key] || 0),
        0,
      ),
    [cycleKeys, summaryData.totals.expense],
  );

  const grandNetTotal = useMemo(
    () =>
      cycleKeys.reduce((sum, key) => sum + (summaryData.totals.net[key] || 0), 0),
    [cycleKeys, summaryData.totals.net],
  );

  const applySort = (next: SortState) => {
    setIncomeSort(next);
    setExpenseSort(next);
  };

  const renderCategoryRows = (
    entries: [string, Record<string, number>][],
    type: TransactionType,
    emptyMessage: string,
  ) => {
    if (entries.length === 0) {
      return {
        main: (
          <TableRow>
            <TableCell
              colSpan={mainColumnCount}
              className="py-8 text-center text-sm text-muted-foreground"
            >
              {emptyMessage}
            </TableCell>
          </TableRow>
        ),
        totals: (
          <TableRow>
            <TableCell className="py-8" />
          </TableRow>
        ),
      };
    }

    const sectionGrandTotal =
      type === "expense" ? grandExpenseTotal : grandIncomeTotal;

    const mainRows: ReactNode[] = [];
    const totalRows: ReactNode[] = [];

    entries.forEach(([category, amounts]) => {
      const rowTotal = sumRowAmounts(amounts, cycleKeys);
      const rowTotalPercentage =
        type === "expense" && sectionGrandTotal > 0
          ? Math.round((rowTotal / sectionGrandTotal) * 100)
          : 0;

      mainRows.push(
        <TableRow key={`${type}-${category}`} className="border-border/30">
          <TableCell className="sticky left-0 z-10 bg-card/95 font-medium backdrop-blur-sm">
            <Button
              variant="link"
              className="h-auto p-0 font-medium text-foreground/85 hover:text-primary"
              onClick={() => onCategoryClick({ category, type })}
            >
              {category}
            </Button>
          </TableCell>
          {summaryData.cycles.map(([key]) => {
            const amount = amounts[key];
            const cycleTotal =
              type === "expense"
                ? summaryData.totals.expense[key] || 0
                : summaryData.totals.income[key] || 0;
            const percentage =
              amount && cycleTotal > 0
                ? Math.round((amount / cycleTotal) * 100)
                : 0;

            return (
              <TableCell
                key={key}
                className="text-right text-sm text-muted-foreground tabular-nums"
              >
                {amount ? (
                  <span className="whitespace-nowrap">
                    ${amount.toFixed(2)}
                    {type === "expense" && (
                      <span className="ml-1.5 text-[0.68rem] text-muted-foreground/60">
                        {percentage}%
                      </span>
                    )}
                  </span>
                ) : (
                  "—"
                )}
              </TableCell>
            );
          })}
        </TableRow>,
      );

      totalRows.push(
        <TableRow key={`${type}-${category}-total`} className="border-border/30">
          <TableCell className="px-3 text-right text-sm font-medium tabular-nums">
            {formatRowTotal(rowTotal, type, rowTotalPercentage)}
          </TableCell>
        </TableRow>,
      );
    });

    return { main: mainRows, totals: totalRows };
  };

  const incomeRows = renderCategoryRows(
    sortedIncomes,
    "income",
    "No income recorded.",
  );
  const expenseRows = renderCategoryRows(
    sortedExpenses,
    "expense",
    "No expenses recorded.",
  );

  return (
    <div className="surface">
      <div className="border-b border-border/50 px-6 py-5">
        <p className="label-caps mb-1">Historical view</p>
        <h2 className="text-lg font-medium tracking-[-0.02em]">Summary by cycle</h2>
      </div>

      <div className="flex min-w-0">
        <div className="min-w-0 flex-1 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/40 hover:bg-transparent">
                <TableHead className="sticky left-0 z-20 h-11 bg-card/95 p-0 backdrop-blur-sm">
                  <div className="flex h-full items-center gap-3 px-3">
                    <button
                      type="button"
                      onClick={() => applySort(nextSortState(incomeSort, "category"))}
                      className="label-caps flex items-center gap-1.5 hover:text-foreground"
                    >
                      <span>Category</span>
                      <SortIcon
                        active={
                          incomeSort.key === "category" ||
                          expenseSort.key === "category"
                        }
                        direction={
                          incomeSort.key === "category"
                            ? incomeSort.direction
                            : expenseSort.direction
                        }
                      />
                    </button>
                  </div>
                </TableHead>
                {summaryData.cycles.map(([key, label]) => (
                  <TableHead key={key} className="h-11 p-0">
                    <button
                      type="button"
                      onClick={() => applySort(nextSortState(incomeSort, key))}
                      className="label-caps flex h-full w-full items-center justify-end gap-1.5 px-3 hover:text-foreground"
                    >
                      <span>{label}</span>
                      <SortIcon
                        active={
                          incomeSort.key === key || expenseSort.key === key
                        }
                        direction={
                          incomeSort.key === key
                            ? incomeSort.direction
                            : expenseSort.direction
                        }
                      />
                    </button>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="border-border/30 bg-muted/20 hover:bg-muted/20">
                <TableCell colSpan={mainColumnCount} className="label-caps py-3">
                  Income
                </TableCell>
              </TableRow>
              {incomeRows.main}
              <TableRow className="border-border/50 bg-muted/30 hover:bg-muted/30">
                <TableCell className="sticky left-0 z-10 bg-muted/80 py-3 font-medium">
                  Total income
                </TableCell>
                {summaryData.cycles.map(([key]) => (
                  <TableCell
                    key={`tot-inc-${key}`}
                    className="metric-value-sm text-right text-emerald-600/90 dark:text-emerald-400/90"
                  >
                    ${(summaryData.totals.income[key] || 0).toFixed(2)}
                  </TableCell>
                ))}
              </TableRow>

              <TableRow className="border-border/30 bg-muted/20 hover:bg-muted/20">
                <TableCell colSpan={mainColumnCount} className="label-caps py-3">
                  Expenses
                </TableCell>
              </TableRow>
              {expenseRows.main}
              <TableRow className="border-border/50 bg-muted/30 hover:bg-muted/30">
                <TableCell className="sticky left-0 z-10 bg-muted/80 py-3 font-medium">
                  Total expenses
                </TableCell>
                {summaryData.cycles.map(([key]) => (
                  <TableCell
                    key={`tot-exp-${key}`}
                    className="metric-value-sm text-right text-rose-600/90 dark:text-rose-400/90"
                  >
                    ${(summaryData.totals.expense[key] || 0).toFixed(2)}
                  </TableCell>
                ))}
              </TableRow>

              <TableRow className="border-border/50 bg-muted/50 hover:bg-muted/50 dark:bg-muted/35">
                <TableCell className="sticky left-0 z-10 bg-muted/50 py-4 font-medium dark:bg-muted/35">
                  Net balance
                </TableCell>
                {summaryData.cycles.map(([key]) => {
                  const net = summaryData.totals.net[key] || 0;
                  return (
                    <TableCell
                      key={`net-${key}`}
                      className={cn(
                        "metric-value-sm text-right text-foreground/90",
                        net < 0 && "text-destructive",
                        net >= 0 && "text-emerald-600/90 dark:text-emerald-400/90",
                      )}
                    >
                      {net < 0 ? "−" : ""}${Math.abs(net).toFixed(2)}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <div className={TOTAL_COLUMN_CLASS}>
          <Table>
            <TableHeader>
              <TableRow className="border-border/40 hover:bg-transparent">
                <TableHead className="h-11 p-0">
                  <button
                    type="button"
                    onClick={() => applySort(nextSortState(incomeSort, "total"))}
                    className="label-caps flex h-full w-full items-center justify-end gap-1.5 px-3 hover:text-foreground"
                  >
                    <span>Total</span>
                    <SortIcon
                      active={
                        incomeSort.key === "total" || expenseSort.key === "total"
                      }
                      direction={
                        incomeSort.key === "total"
                          ? incomeSort.direction
                          : expenseSort.direction
                      }
                    />
                  </button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="border-border/30 bg-muted/20 hover:bg-muted/20">
                <TableCell className="py-3" />
              </TableRow>
              {incomeRows.totals}
              <TableRow className="border-border/50 bg-muted/30 hover:bg-muted/30">
                <TableCell className="metric-value-sm bg-muted/80 py-3 text-right text-emerald-600/90 dark:text-emerald-400/90">
                  ${grandIncomeTotal.toFixed(2)}
                </TableCell>
              </TableRow>

              <TableRow className="border-border/30 bg-muted/20 hover:bg-muted/20">
                <TableCell className="py-3" />
              </TableRow>
              {expenseRows.totals}
              <TableRow className="border-border/50 bg-muted/30 hover:bg-muted/30">
                <TableCell className="metric-value-sm bg-muted/80 py-3 text-right text-rose-600/90 dark:text-rose-400/90">
                  ${grandExpenseTotal.toFixed(2)}
                </TableCell>
              </TableRow>

              <TableRow className="border-border/50 bg-muted/50 hover:bg-muted/50 dark:bg-muted/35">
                <TableCell
                  className={cn(
                    "metric-value-sm bg-muted/50 py-4 text-right dark:bg-muted/35",
                    grandNetTotal < 0 && "text-destructive",
                    grandNetTotal >= 0 &&
                      "text-emerald-600/90 dark:text-emerald-400/90",
                  )}
                >
                  {grandNetTotal < 0 ? "−" : ""}${Math.abs(grandNetTotal).toFixed(2)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
