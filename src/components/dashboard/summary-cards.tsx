"use client";

import { ArrowDownLeft, ArrowUpRight, CircleDot } from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryCardsProps {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
}

const cards = [
  {
    key: "income",
    label: "Income",
    icon: ArrowUpRight,
    tone: "text-emerald-600/90 dark:text-emerald-400/90",
    iconBg: "bg-emerald-500/8 dark:bg-emerald-400/12",
  },
  {
    key: "expenses",
    label: "Expenses",
    icon: ArrowDownLeft,
    tone: "text-rose-600/90 dark:text-rose-400/90",
    iconBg: "bg-rose-500/8 dark:bg-rose-400/12",
  },
  {
    key: "net",
    label: "Net balance",
    icon: CircleDot,
    tone: "text-foreground/80",
    iconBg: "bg-primary/8 dark:bg-primary/15",
  },
] as const;

export function SummaryCards({
  totalIncome,
  totalExpenses,
  netBalance,
}: SummaryCardsProps) {
  const values = {
    income: totalIncome,
    expenses: totalExpenses,
    net: netBalance,
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map(({ key, label, icon: Icon, tone, iconBg }) => {
        const value = values[key];
        const isNegativeNet = key === "net" && value < 0;

        return (
          <div key={key} className="surface px-5 py-5 sm:px-6 sm:py-6">
            <div className="mb-5 flex items-center justify-between">
              <span className="label-caps">{label}</span>
              <div className={cn("rounded-full p-2", iconBg)}>
                <Icon className={cn("size-3.5", tone)} strokeWidth={1.75} />
              </div>
            </div>
            <div
              className={cn(
                "metric-value",
                isNegativeNet && "text-destructive",
              )}
            >
              ${Math.abs(value).toFixed(2)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
