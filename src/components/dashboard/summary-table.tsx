"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { CategoryDetailsModal, SummaryData, TransactionType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SummaryTableProps {
  summaryData: SummaryData;
  onCategoryClick: (modal: CategoryDetailsModal) => void;
}

type SortDirection = "asc" | "desc";
type SortKey = "category" | "average" | "total" | string;

interface SortState {
  key: SortKey;
  direction: SortDirection;
}

type SummaryRow =
  | { kind: "header" }
  | { kind: "section"; label: string }
  | { kind: "empty"; message: string }
  | {
      kind: "category";
      category: string;
      type: TransactionType;
      amounts: Record<string, number>;
    }
  | { kind: "total-income" }
  | { kind: "total-expenses" }
  | { kind: "net-balance" };

const CATEGORY_WIDTH = "w-[11.5rem] sm:w-[12.5rem]";
const SUMMARY_COL_WIDTH = "w-[7.25rem] shrink-0 sm:w-[7.75rem]";
const CYCLE_WIDTH = "w-[7.25rem] shrink-0 sm:w-[7.75rem]";
const ROW_BASE = "flex min-h-11 items-center border-b border-border/30";

const AVG_STICKY_OFFSET = "right-[7.25rem] sm:right-[7.75rem]";

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
    } else if (sort.key === "average") {
      cmp =
        sumRowAmounts(a[1], cycleKeys) / Math.max(cycleKeys.length, 1) -
        sumRowAmounts(b[1], cycleKeys) / Math.max(cycleKeys.length, 1);
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

function formatAmountWithPercent(
  amount: number,
  type: TransactionType,
  percentage: number,
  className?: string,
) {
  if (amount <= 0) return "—";

  return (
    <span className={cn("whitespace-nowrap", className)}>
      ${amount.toFixed(2)}
      {type === "expense" && (
        <span className="ml-1.5 text-[0.68rem] text-muted-foreground/60">
          {percentage}%
        </span>
      )}
    </span>
  );
}

function formatSignedAmount(
  amount: number,
  className?: string,
  metric = false,
) {
  const isNegative = amount < 0;

  return (
    <span
      className={cn(
        metric && "metric-value-sm",
        "whitespace-nowrap",
        className,
      )}
    >
      {isNegative ? "−" : ""}${Math.abs(amount).toFixed(2)}
    </span>
  );
}

function SummarySortHeader({
  label,
  sortKey,
  sort,
  onSort,
  stickyClassName,
}: {
  label: string;
  sortKey: SortKey;
  sort: SortState;
  onSort: (next: SortState) => void;
  stickyClassName: string;
}) {
  return (
    <div className={cn(SUMMARY_COL_WIDTH, stickyClassName, "px-3")}>
      <button
        type="button"
        onClick={() => onSort(nextSortState(sort, sortKey))}
        className="label-caps ml-auto flex items-center justify-end gap-1.5 hover:text-foreground"
      >
        <span>{label}</span>
        <SortIcon active={sort.key === sortKey} direction={sort.direction} />
      </button>
    </div>
  );
}

function SummaryStickySpacer({ stickyClassName }: { stickyClassName: string }) {
  return <div className={cn(SUMMARY_COL_WIDTH, stickyClassName)} />;
}

export function SummaryTable({
  summaryData,
  onCategoryClick,
}: SummaryTableProps) {
  const cycleKeys = useMemo(
    () => summaryData.cycles.map(([key]) => key),
    [summaryData.cycles],
  );

  const cycleCount = cycleKeys.length;

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

  const rows: SummaryRow[] = useMemo(() => {
    const next: SummaryRow[] = [{ kind: "header" }, { kind: "section", label: "Income" }];

    if (sortedIncomes.length === 0) {
      next.push({ kind: "empty", message: "No income recorded." });
    } else {
      sortedIncomes.forEach(([category, amounts]) => {
        next.push({ kind: "category", category, type: "income", amounts });
      });
    }

    next.push({ kind: "total-income" }, { kind: "section", label: "Expenses" });

    if (sortedExpenses.length === 0) {
      next.push({ kind: "empty", message: "No expenses recorded." });
    } else {
      sortedExpenses.forEach(([category, amounts]) => {
        next.push({ kind: "category", category, type: "expense", amounts });
      });
    }

    next.push(
      { kind: "total-expenses" },
      { kind: "net-balance" },
    );

    return next;
  }, [sortedExpenses, sortedIncomes]);

  const stickyAvgHeader = cn(
    AVG_STICKY_OFFSET,
    "z-20 shrink-0 border-l border-border/50 bg-card/95 backdrop-blur-sm",
  );
  const stickyTotalHeader = cn(
    "sticky right-0 z-20 shrink-0 border-l border-border/50 bg-card/95 backdrop-blur-sm",
  );
  const stickyAvgCell = cn(
    AVG_STICKY_OFFSET,
    "z-10 shrink-0 border-l border-border/50 bg-card/95 backdrop-blur-sm",
  );
  const stickyTotalCell = cn(
    "sticky right-0 z-10 shrink-0 border-l border-border/50 bg-card/95 backdrop-blur-sm",
  );
  const stickyAvgMuted = cn(
    AVG_STICKY_OFFSET,
    "z-10 shrink-0 border-l border-border/50 bg-muted/20 backdrop-blur-sm",
  );
  const stickyTotalMuted = cn(
    "sticky right-0 z-10 shrink-0 border-l border-border/50 bg-muted/20 backdrop-blur-sm",
  );
  const stickyAvgFooter = cn(
    AVG_STICKY_OFFSET,
    "z-10 shrink-0 border-l border-border/50 bg-muted/80 backdrop-blur-sm",
  );
  const stickyTotalFooter = cn(
    "sticky right-0 z-10 shrink-0 border-l border-border/50 bg-muted/80 backdrop-blur-sm",
  );
  const stickyAvgNet = cn(
    AVG_STICKY_OFFSET,
    "z-10 shrink-0 border-l border-border/50 bg-muted/50 backdrop-blur-sm dark:bg-muted/35",
  );
  const stickyTotalNet = cn(
    "sticky right-0 z-10 shrink-0 border-l border-border/50 bg-muted/50 backdrop-blur-sm dark:bg-muted/35",
  );

  const renderSummaryHeaders = () => (
    <>
      <SummarySortHeader
        label="Avg"
        sortKey="average"
        sort={incomeSort}
        onSort={applySort}
        stickyClassName={cn("sticky", stickyAvgHeader)}
      />
      <SummarySortHeader
        label="Total"
        sortKey="total"
        sort={incomeSort}
        onSort={applySort}
        stickyClassName={stickyTotalHeader}
      />
    </>
  );

  const renderCycleAmount = (
    amount: number | undefined,
    type: TransactionType,
    cycleKey: string,
  ) => {
    const cycleTotal =
      type === "expense"
        ? summaryData.totals.expense[cycleKey] || 0
        : summaryData.totals.income[cycleKey] || 0;
    const percentage =
      amount && cycleTotal > 0
        ? Math.round((amount / cycleTotal) * 100)
        : 0;

    return (
      <div
        key={cycleKey}
        className={cn(CYCLE_WIDTH, "px-3 text-right text-sm tabular-nums text-muted-foreground")}
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
      </div>
    );
  };

  const renderCategorySummaryCells = (
    rowTotal: number,
    type: TransactionType,
    rowTotalPercentage: number,
  ) => {
    const rowAverage = cycleCount > 0 ? rowTotal / cycleCount : 0;

    return (
      <>
        <div
          className={cn(
            SUMMARY_COL_WIDTH,
            "sticky",
            stickyAvgCell,
            "px-3 text-right text-sm tabular-nums text-muted-foreground",
          )}
        >
          {formatAmountWithPercent(rowAverage, type, rowTotalPercentage)}
        </div>
        <div
          className={cn(
            SUMMARY_COL_WIDTH,
            stickyTotalCell,
            "px-3 text-right text-sm font-medium tabular-nums",
          )}
        >
          {formatAmountWithPercent(rowTotal, type, rowTotalPercentage)}
        </div>
      </>
    );
  };

  const renderGrandSummaryCells = (
    total: number,
    type: "income" | "expense" | "net",
    avgSticky: string,
    totalSticky: string,
  ) => {
    const average = cycleCount > 0 ? total / cycleCount : 0;
    const amountClass =
      type === "expense"
        ? "text-rose-600/90 dark:text-rose-400/90"
        : type === "income"
          ? "text-emerald-600/90 dark:text-emerald-400/90"
          : total < 0
            ? "text-destructive"
            : "text-emerald-600/90 dark:text-emerald-400/90";

    return (
      <>
        <div className={cn(SUMMARY_COL_WIDTH, "sticky", avgSticky, "px-3 text-right")}>
          {formatSignedAmount(average, amountClass, true)}
        </div>
        <div className={cn(SUMMARY_COL_WIDTH, totalSticky, "px-3 text-right")}>
          {formatSignedAmount(total, amountClass, true)}
        </div>
      </>
    );
  };

  const renderRow = (row: SummaryRow, index: number) => {
    switch (row.kind) {
      case "header":
        return (
          <div key={`row-${index}`} className={cn(ROW_BASE, "border-border/40 bg-card/95")}>
            <div
              className={cn(
                CATEGORY_WIDTH,
                "sticky left-0 z-20 shrink-0 bg-card/95 px-3 backdrop-blur-sm",
              )}
            >
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
            <div className="flex min-w-max">
              {summaryData.cycles.map(([key, label]) => (
                <div key={key} className={cn(CYCLE_WIDTH, "px-3")}>
                  <button
                    type="button"
                    onClick={() => applySort(nextSortState(incomeSort, key))}
                    className="label-caps ml-auto flex items-center justify-end gap-1.5 hover:text-foreground"
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
                </div>
              ))}
            </div>
            {renderSummaryHeaders()}
          </div>
        );

      case "section":
        return (
          <div
            key={`row-${index}`}
            className={cn(ROW_BASE, "bg-muted/20 hover:bg-muted/20")}
          >
            <div
              className={cn(
                CATEGORY_WIDTH,
                "sticky left-0 z-10 shrink-0 bg-muted/20 px-3 backdrop-blur-sm",
              )}
            >
              <span className="label-caps">{row.label}</span>
            </div>
            <div className="flex min-w-max flex-1">
              {summaryData.cycles.map(([key]) => (
                <div key={key} className={CYCLE_WIDTH} />
              ))}
            </div>
            <SummaryStickySpacer stickyClassName={cn("sticky", stickyAvgMuted)} />
            <SummaryStickySpacer stickyClassName={stickyTotalMuted} />
          </div>
        );

      case "empty":
        return (
          <div key={`row-${index}`} className={ROW_BASE}>
            <div
              className={cn(
                CATEGORY_WIDTH,
                "sticky left-0 z-10 shrink-0 bg-card/95 px-3 text-sm text-muted-foreground backdrop-blur-sm",
              )}
            >
              {row.message}
            </div>
            <div className="flex min-w-max flex-1">
              {summaryData.cycles.map(([key]) => (
                <div key={key} className={CYCLE_WIDTH} />
              ))}
            </div>
            <SummaryStickySpacer stickyClassName={cn("sticky", stickyAvgCell)} />
            <SummaryStickySpacer stickyClassName={stickyTotalCell} />
          </div>
        );

      case "category": {
        const rowTotal = sumRowAmounts(row.amounts, cycleKeys);
        const sectionGrandTotal =
          row.type === "expense" ? grandExpenseTotal : grandIncomeTotal;
        const rowTotalPercentage =
          row.type === "expense" && sectionGrandTotal > 0
            ? Math.round((rowTotal / sectionGrandTotal) * 100)
            : 0;

        return (
          <div key={`row-${index}`} className={ROW_BASE}>
            <div
              className={cn(
                CATEGORY_WIDTH,
                "sticky left-0 z-10 shrink-0 bg-card/95 px-3 font-medium backdrop-blur-sm",
              )}
            >
              <Button
                variant="link"
                className="h-auto p-0 font-medium text-foreground/85 hover:text-primary"
                onClick={() =>
                  onCategoryClick({ category: row.category, type: row.type })
                }
              >
                {row.category}
              </Button>
            </div>
            <div className="flex min-w-max">
              {summaryData.cycles.map(([key]) =>
                renderCycleAmount(row.amounts[key], row.type, key),
              )}
            </div>
            {renderCategorySummaryCells(rowTotal, row.type, rowTotalPercentage)}
          </div>
        );
      }

      case "total-income":
        return (
          <div
            key={`row-${index}`}
            className={cn(ROW_BASE, "bg-muted/30 hover:bg-muted/30")}
          >
            <div
              className={cn(
                CATEGORY_WIDTH,
                "sticky left-0 z-10 shrink-0 bg-muted/80 px-3 font-medium backdrop-blur-sm",
              )}
            >
              Total income
            </div>
            <div className="flex min-w-max">
              {summaryData.cycles.map(([key]) => (
                <div
                  key={key}
                  className={cn(
                    CYCLE_WIDTH,
                    "metric-value-sm px-3 text-right text-emerald-600/90 dark:text-emerald-400/90",
                  )}
                >
                  ${(summaryData.totals.income[key] || 0).toFixed(2)}
                </div>
              ))}
            </div>
            {renderGrandSummaryCells(
              grandIncomeTotal,
              "income",
              stickyAvgFooter,
              stickyTotalFooter,
            )}
          </div>
        );

      case "total-expenses":
        return (
          <div
            key={`row-${index}`}
            className={cn(ROW_BASE, "bg-muted/30 hover:bg-muted/30")}
          >
            <div
              className={cn(
                CATEGORY_WIDTH,
                "sticky left-0 z-10 shrink-0 bg-muted/80 px-3 font-medium backdrop-blur-sm",
              )}
            >
              Total expenses
            </div>
            <div className="flex min-w-max">
              {summaryData.cycles.map(([key]) => (
                <div
                  key={key}
                  className={cn(
                    CYCLE_WIDTH,
                    "metric-value-sm px-3 text-right text-rose-600/90 dark:text-rose-400/90",
                  )}
                >
                  ${(summaryData.totals.expense[key] || 0).toFixed(2)}
                </div>
              ))}
            </div>
            {renderGrandSummaryCells(
              grandExpenseTotal,
              "expense",
              stickyAvgFooter,
              stickyTotalFooter,
            )}
          </div>
        );

      case "net-balance":
        return (
          <div
            key={`row-${index}`}
            className={cn(ROW_BASE, "bg-muted/50 hover:bg-muted/50 dark:bg-muted/35")}
          >
            <div
              className={cn(
                CATEGORY_WIDTH,
                "sticky left-0 z-10 shrink-0 bg-muted/50 px-3 font-medium backdrop-blur-sm dark:bg-muted/35",
              )}
            >
              Net balance
            </div>
            <div className="flex min-w-max">
              {summaryData.cycles.map(([key]) => {
                const net = summaryData.totals.net[key] || 0;
                return (
                  <div
                    key={key}
                    className={cn(
                      CYCLE_WIDTH,
                      "metric-value-sm px-3 text-right",
                      net < 0 && "text-destructive",
                      net >= 0 && "text-emerald-600/90 dark:text-emerald-400/90",
                    )}
                  >
                    {net < 0 ? "−" : ""}${Math.abs(net).toFixed(2)}
                  </div>
                );
              })}
            </div>
            {renderGrandSummaryCells(
              grandNetTotal,
              "net",
              stickyAvgNet,
              stickyTotalNet,
            )}
          </div>
        );
    }
  };

  return (
    <div className="surface">
      <div className="border-b border-border/50 px-6 py-5">
        <p className="label-caps mb-1">Historical view</p>
        <h2 className="text-lg font-medium tracking-[-0.02em]">Summary by cycle</h2>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-max">
          {rows.map((row, index) => renderRow(row, index))}
        </div>
      </div>
    </div>
  );
}
