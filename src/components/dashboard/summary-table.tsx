"use client";

import type { CategoryDetailsModal, SummaryData, TransactionType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
            className="py-4 text-center text-muted-foreground"
          >
            {emptyMessage}
          </TableCell>
        </TableRow>
      );
    }

    return entries.map(([category, amounts]) => (
      <TableRow key={`${type}-${category}`}>
        <TableCell className="sticky left-0 z-10 bg-background font-medium shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
          <Button
            variant="link"
            className="h-auto p-0 font-medium"
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
            <TableCell key={key} className="text-right text-muted-foreground">
              {amount ? (
                <span className="whitespace-nowrap">
                  ${amount.toFixed(2)}
                  {type === "expense" && (
                    <span className="ml-1.5 text-[11px] font-medium text-muted-foreground/70">
                      ({percentage}%)
                    </span>
                  )}
                </span>
              ) : (
                "-"
              )}
            </TableCell>
          );
        })}
      </TableRow>
    ));
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-muted/30">
        <CardTitle>Financial Summary by Cycle</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 z-10 bg-background shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                Category
              </TableHead>
              {summaryData.cycles.map(([key, label]) => (
                <TableHead key={key} className="text-right">
                  {label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="bg-muted/30">
              <TableCell
                colSpan={summaryData.cycles.length + 1}
                className="text-xs font-semibold tracking-wider uppercase"
              >
                Income
              </TableCell>
            </TableRow>
            {renderCategoryRows(
              summaryData.incomes,
              "income",
              "No income recorded.",
            )}
            <TableRow className="border-b-2 bg-muted/50">
              <TableCell className="sticky left-0 z-10 bg-muted font-bold shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                Total Income
              </TableCell>
              {summaryData.cycles.map(([key]) => (
                <TableCell
                  key={`tot-inc-${key}`}
                  className="text-right font-bold text-green-700"
                >
                  ${(summaryData.totals.income[key] || 0).toFixed(2)}
                </TableCell>
              ))}
            </TableRow>

            <TableRow className="bg-muted/30">
              <TableCell
                colSpan={summaryData.cycles.length + 1}
                className="text-xs font-semibold tracking-wider uppercase"
              >
                Expenses
              </TableCell>
            </TableRow>
            {renderCategoryRows(
              summaryData.expenses,
              "expense",
              "No expenses recorded.",
            )}
            <TableRow className="border-b-2 bg-muted/50">
              <TableCell className="sticky left-0 z-10 bg-muted font-bold shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                Total Expenses
              </TableCell>
              {summaryData.cycles.map(([key]) => (
                <TableCell
                  key={`tot-exp-${key}`}
                  className="text-right font-bold text-red-700"
                >
                  ${(summaryData.totals.expense[key] || 0).toFixed(2)}
                </TableCell>
              ))}
            </TableRow>

            <TableRow className="bg-primary text-primary-foreground">
              <TableCell className="sticky left-0 z-10 bg-primary font-bold shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]">
                Net Balance
              </TableCell>
              {summaryData.cycles.map(([key]) => {
                const net = summaryData.totals.net[key] || 0;
                return (
                  <TableCell
                    key={`net-${key}`}
                    className={cn(
                      "text-right font-bold",
                      net < 0 ? "text-red-300" : "text-green-300",
                    )}
                  >
                    {net < 0 ? "-" : ""}${Math.abs(net).toFixed(2)}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
