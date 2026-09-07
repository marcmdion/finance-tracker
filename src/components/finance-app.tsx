"use client";

import { useMemo, useState } from "react";
import { signOut } from "firebase/auth";
import { Download, LogOut, Tags } from "lucide-react";
import { toast } from "sonner";
import { MinimalLoader } from "@/components/minimal-loader";
import { AuthScreen } from "@/components/auth/auth-screen";
import { CategoryDetailsDialog } from "@/components/dashboard/category-details-dialog";
import { CategoryManagerDialog } from "@/components/dashboard/category-manager-dialog";
import { CycleNavigator } from "@/components/dashboard/cycle-navigator";
import { PermissionDenied } from "@/components/dashboard/permission-denied";
import { SankeyChart } from "@/components/dashboard/sankey-chart";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { SummaryTable } from "@/components/dashboard/summary-table";
import { TransactionForm } from "@/components/dashboard/transaction-form";
import { TransactionTable } from "@/components/dashboard/transaction-table";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAllTransactions } from "@/hooks/use-all-transactions";
import { useAuth } from "@/hooks/use-auth";
import {
  deleteTransaction,
  saveTransaction,
  useCycleTransactions,
} from "@/hooks/use-cycle-transactions";
import {
  buildExportFilename,
  downloadCsv,
  exportTransactionsToCsv,
} from "@/lib/csv-export";
import { getFirebaseAuth } from "@/lib/firebase";
import {
  filterTransactionsByCycle,
  getCycleDates,
} from "@/lib/cycle-utils";
import { centsToAmount } from "@/lib/money-utils";
import { buildSankeyData } from "@/lib/sankey-utils";
import { buildSummaryData } from "@/lib/summary-utils";
import { transactionToFormData } from "@/lib/transaction-utils";
import type {
  CategoryDetailsModal,
  Transaction,
  TransactionFormData,
} from "@/lib/types";

export function FinanceApp() {
  const { user, loading: authLoading, initError } = useAuth();
  const {
    transactions: allTransactions,
    loading: allLoading,
    syncError,
    renameCategory,
    mergeCategories,
  } = useAllTransactions(user);

  const [cycleOffset, setCycleOffset] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<TransactionFormData | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [detailsModal, setDetailsModal] =
    useState<CategoryDetailsModal | null>(null);
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false);

  const cycleDates = useMemo(
    () => getCycleDates(cycleOffset),
    [cycleOffset],
  );

  const { transactions: cycleTransactions, loading: cycleLoading } =
    useCycleTransactions(user, cycleDates);

  const currentCycleTransactions = useMemo(() => {
    if (cycleTransactions.length > 0) {
      return cycleTransactions;
    }
    return filterTransactionsByCycle(allTransactions, cycleDates);
  }, [allTransactions, cycleDates, cycleTransactions]);

  const totalIncomeCents = currentCycleTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amountCents, 0);

  const totalExpensesCents = currentCycleTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amountCents, 0);

  const netBalanceCents = totalIncomeCents - totalExpensesCents;
  const totalIncome = centsToAmount(totalIncomeCents);
  const totalExpenses = centsToAmount(totalExpensesCents);
  const netBalance = centsToAmount(netBalanceCents);

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
    () => buildSummaryData(allTransactions),
    [allTransactions],
  );

  const handleSubmit = async (formData: TransactionFormData) => {
    if (!user) return;

    setIsSubmitting(true);
    const existing = editingId
      ? allTransactions.find((transaction) => transaction.id === editingId)
      : undefined;
    const result = await saveTransaction(user, formData, editingId, existing);
    setIsSubmitting(false);

    if (result.ok) {
      toast.success(editingId ? "Transaction updated" : "Transaction added");
      setEditingId(null);
      setEditFormData(null);
      return;
    }

    toast.error(result.message);
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
    if (!user) return;

    const result = await deleteTransaction(user, id);
    if (result.ok) {
      toast.success("Transaction deleted");
      if (editingId === id) {
        handleCancelEdit();
      }
      return;
    }

    toast.error(result.message);
  };

  const handleExport = () => {
    if (allTransactions.length === 0) {
      toast.info("No transactions to export yet.");
      return;
    }

    const csv = exportTransactionsToCsv(allTransactions);
    downloadCsv(buildExportFilename(), csv);
    toast.success("CSV export downloaded");
  };

  if (authLoading) {
    return (
      <MinimalLoader label="Checking your session…" className="min-h-screen" />
    );
  }

  if (!user) {
    return <AuthScreen initNotice={initError} />;
  }

  if (syncError) {
    return <PermissionDenied />;
  }

  const dataStillLoading = allLoading;

  return (
    <div className="mx-auto min-h-screen w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 xl:max-w-7xl 2xl:max-w-[90rem]">
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
            onClick={() => setCategoryManagerOpen(true)}
          >
            <Tags className="size-3.5" />
            Categories
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={handleExport}
          >
            <Download className="size-3.5" />
            Export CSV
          </Button>
          <ThemeToggle />
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

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(280px,320px)_minmax(0,1fr)]">
            <TransactionForm
              key={editingId ?? "new"}
              transactions={allTransactions}
              editingId={editingId}
              isSubmitting={isSubmitting}
              initialFormData={editFormData ?? undefined}
              onSubmit={handleSubmit}
              onCancelEdit={handleCancelEdit}
            />
            <SankeyChart sankeyData={sankeyData} />
          </div>

          {cycleLoading ? (
            <div className="surface flex items-center justify-center py-16">
              <MinimalLoader label="Syncing this cycle…" />
            </div>
          ) : (
            <TransactionTable
              transactions={currentCycleTransactions}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </TabsContent>

        <TabsContent value="summary">
          {dataStillLoading ? (
            <div className="surface flex items-center justify-center py-20">
              <MinimalLoader label="Loading summary history…" />
            </div>
          ) : (
            <SummaryTable
              summaryData={summaryData}
              onCategoryClick={setDetailsModal}
            />
          )}
        </TabsContent>
      </Tabs>

      <CategoryDetailsDialog
        modal={detailsModal}
        transactions={allTransactions}
        onClose={() => setDetailsModal(null)}
      />

      <CategoryManagerDialog
        open={categoryManagerOpen}
        onOpenChange={setCategoryManagerOpen}
        transactions={allTransactions}
        onRenameCategory={renameCategory}
        onMergeCategories={mergeCategories}
      />
    </div>
  );
}
