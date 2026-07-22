"use client";

import { useMemo, useState } from "react";
import { signOut } from "firebase/auth";
import { Loader2, LogOut } from "lucide-react";
import { AuthScreen } from "@/components/auth/auth-screen";
import { CategoryDetailsDialog } from "@/components/dashboard/category-details-dialog";
import { CycleNavigator } from "@/components/dashboard/cycle-navigator";
import { PermissionDenied } from "@/components/dashboard/permission-denied";
import { SankeyChart } from "@/components/dashboard/sankey-chart";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { SummaryTable } from "@/components/dashboard/summary-table";
import {
  TransactionForm,
  transactionToFormData,
} from "@/components/dashboard/transaction-form";
import { TransactionTable } from "@/components/dashboard/transaction-table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useTransactions } from "@/hooks/use-transactions";
import { getFirebaseAuth } from "@/lib/firebase";
import {
  filterTransactionsByCycle,
  getCycleDates,
} from "@/lib/cycle-utils";
import { buildSankeyData } from "@/lib/sankey-utils";
import { buildSummaryData } from "@/lib/summary-utils";
import type {
  CategoryDetailsModal,
  Transaction,
  TransactionFormData,
} from "@/lib/types";

export function FinanceApp() {
  const { user, loading: authLoading } = useAuth();
  const {
    transactions,
    loading: txLoading,
    syncError,
    saveTransaction,
    deleteTransaction,
  } = useTransactions(user);

  const [cycleOffset, setCycleOffset] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<TransactionFormData | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [detailsModal, setDetailsModal] =
    useState<CategoryDetailsModal | null>(null);

  const cycleDates = useMemo(
    () => getCycleDates(cycleOffset),
    [cycleOffset],
  );

  const currentCycleTransactions = useMemo(
    () => filterTransactionsByCycle(transactions, cycleDates),
    [transactions, cycleDates],
  );

  const totalIncome = currentCycleTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = currentCycleTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpenses;

  const sankeyData = useMemo(
    () =>
      buildSankeyData(
        currentCycleTransactions,
        totalIncome,
        totalExpenses,
        netBalance,
      ),
    [currentCycleTransactions, totalIncome, totalExpenses, netBalance],
  );

  const summaryData = useMemo(
    () => buildSummaryData(transactions),
    [transactions],
  );

  const handleSubmit = async (formData: TransactionFormData) => {
    setIsSubmitting(true);
    const success = await saveTransaction(formData, editingId);
    setIsSubmitting(false);

    if (success) {
      setEditingId(null);
      setEditFormData(null);
    }
  };

  const handleEdit = (tx: Transaction) => {
    setEditingId(tx.id);
    setEditFormData(transactionToFormData(tx));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormData(null);
  };

  const handleDelete = async (id: string) => {
    await deleteTransaction(id);
    if (editingId === id) {
      handleCancelEdit();
    }
  };

  if (authLoading || (user && txLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground/70" />
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  if (syncError) {
    return <PermissionDenied />;
  }

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <header className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="label-caps">Personal finance</p>
          <h1 className="text-[2rem] leading-none font-medium tracking-[-0.04em] sm:text-[2.35rem]">
            Finance Strategist
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            Real-time visibility across your billing cycles.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <CycleNavigator
            cycleDates={cycleDates}
            cycleOffset={cycleOffset}
            onPrevious={() => setCycleOffset((prev) => prev - 1)}
            onNext={() => setCycleOffset((prev) => prev + 1)}
            onReset={() => setCycleOffset(0)}
          />
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => signOut(getFirebaseAuth())}
          >
            <LogOut className="size-3.5" />
            Sign out
          </Button>
        </div>
      </header>

      <Tabs defaultValue="dashboard" className="gap-8">
        <TabsList variant="line" className="h-auto w-full justify-start gap-6 bg-transparent p-0">
          <TabsTrigger value="dashboard" className="px-0 pb-3 text-sm">
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="summary" className="px-0 pb-3 text-sm">
            Summary
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-8">
          <SummaryCards
            totalIncome={totalIncome}
            totalExpenses={totalExpenses}
            netBalance={netBalance}
          />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <TransactionForm
              key={editingId ?? "new"}
              transactions={transactions}
              editingId={editingId}
              isSubmitting={isSubmitting}
              initialFormData={editFormData ?? undefined}
              onSubmit={handleSubmit}
              onCancelEdit={handleCancelEdit}
            />
            <SankeyChart sankeyData={sankeyData} />
          </div>

          <TransactionTable
            transactions={currentCycleTransactions}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="summary">
          <SummaryTable
            summaryData={summaryData}
            onCategoryClick={setDetailsModal}
          />
        </TabsContent>
      </Tabs>

      <CategoryDetailsDialog
        modal={detailsModal}
        transactions={transactions}
        onClose={() => setDetailsModal(null)}
      />
    </div>
  );
}
