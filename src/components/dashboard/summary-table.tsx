"use client";

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

export function SummaryTable({
  summaryData,
  onCategoryClick,
}: SummaryTableProps) {
  const renderCategoryRows = (
    entries: [string, Record<string, number>][],
    type: TransactionType,
    emptyMessage: string,
  ) => {
    if (entries.length === 0) {
      return (
        <TableRow>
          <TableCell
            colSpan={summaryData.cycles.length + 1}
            className="py-8 text-center text-sm text-muted-foreground"
          >
            {emptyMessage}
          </TableCell>
        </TableRow>
      );
    }

    return entries.map(([category, amounts]) => (
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
      </TableRow>
    ));
  };

  return (
    <div className="surface overflow-hidden">
      <div className="border-b border-border/50 px-6 py-5">
        <p className="label-caps mb-1">Historical view</p>
        <h2 className="text-lg font-medium tracking-[-0.02em]">Summary by cycle</h2>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/40 hover:bg-transparent">
              <TableHead className="label-caps sticky left-0 z-10 h-11 bg-card/95 backdrop-blur-sm">
                Category
              </TableHead>
              {summaryData.cycles.map(([key, label]) => (
                <TableHead key={key} className="label-caps h-11 text-right">
                  {label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="border-border/30 bg-muted/20 hover:bg-muted/20">
              <TableCell
                colSpan={summaryData.cycles.length + 1}
                className="label-caps py-3"
              >
                Income
              </TableCell>
            </TableRow>
            {renderCategoryRows(
              summaryData.incomes,
              "income",
              "No income recorded.",
            )}
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
              <TableCell
                colSpan={summaryData.cycles.length + 1}
                className="label-caps py-3"
              >
                Expenses
              </TableCell>
            </TableRow>
            {renderCategoryRows(
              summaryData.expenses,
              "expense",
              "No expenses recorded.",
            )}
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
    </div>
  );
}
