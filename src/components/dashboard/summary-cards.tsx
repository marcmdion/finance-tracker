"use client";

import { TrendingDown, TrendingUp, Wallet } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SummaryCardsProps {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
}

export function SummaryCards({
  totalIncome,
  totalExpenses,
  netBalance,
}: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Income
          </CardTitle>
          <TrendingUp className="size-5 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">${totalIncome.toFixed(2)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Expenses
          </CardTitle>
          <TrendingDown className="size-5 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">${totalExpenses.toFixed(2)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Net Balance
          </CardTitle>
          <Wallet className="size-5" />
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              "text-3xl font-bold",
              netBalance < 0 && "text-destructive",
            )}
          >
            ${netBalance.toFixed(2)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
