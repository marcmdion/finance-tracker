"use client";

import { useState } from "react";
import { TransactionEditDialog } from "@/components/dashboard/transaction-edit-dialog";
import type { CategoryDetailsModal, Transaction, TransactionFormData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatTransactionDate } from "@/lib/date-utils";
import { formatMoney } from "@/lib/money-utils";

interface CategoryDetailsDialogProps {
  modal: CategoryDetailsModal | null;
  transactions: Transaction[];
  isSubmitting: boolean;
  onClose: () => void;
  onSaveTransaction: (
    formData: TransactionFormData,
    transactionId: string,
  ) => Promise<{ ok: true } | { ok: false; message: string }>;
  onDeleteTransaction: (
    transactionId: string,
  ) => Promise<{ ok: true } | { ok: false; message: string }>;
}

export function CategoryDetailsDialog({
  modal,
  transactions,
  isSubmitting,
  onClose,
  onSaveTransaction,
  onDeleteTransaction,
}: CategoryDetailsDialogProps) {
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  const filtered = modal
    ? transactions
        .filter(
          (t) => t.category === modal.category && t.type === modal.type,
        )
        .sort(
          (a, b) =>
            b.transactionDate.localeCompare(a.transactionDate) ||
            b.createdAt - a.createdAt,
        )
    : [];

  const handleListOpenChange = (open: boolean) => {
    if (!open) {
      setEditingTransaction(null);
      onClose();
    }
  };

  return (
    <>
      <Dialog open={modal !== null} onOpenChange={handleListOpenChange}>
        <DialogContent className="flex max-h-[85vh] max-w-2xl flex-col gap-0 p-0">
          <DialogHeader className="border-b bg-muted/30 px-6 py-4">
            <DialogTitle>{modal?.category}</DialogTitle>
            <DialogDescription className="capitalize">
              {modal?.type} transactions · click a row to edit
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((tx) => (
                  <TableRow
                    key={tx.id}
                    className="cursor-pointer hover:bg-muted/40"
                    onClick={() => setEditingTransaction(tx)}
                  >
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {formatTransactionDate(tx.transactionDate)}
                    </TableCell>
                    <TableCell className="font-medium">{tx.name}</TableCell>
                    <TableCell className="metric-value-sm text-right whitespace-nowrap">
                      {formatMoney(tx.amountCents, {
                        type: tx.type === "income" ? "income" : undefined,
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <DialogFooter className="border-t bg-muted/30 px-6 py-4">
            <Button onClick={onClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TransactionEditDialog
        transaction={editingTransaction}
        transactions={transactions}
        open={editingTransaction !== null}
        isSubmitting={isSubmitting}
        onOpenChange={(open) => {
          if (!open) setEditingTransaction(null);
        }}
        onSave={onSaveTransaction}
        onDelete={async (transactionId) => {
          const result = await onDeleteTransaction(transactionId);
          if (result.ok) {
            setEditingTransaction(null);
          }
          return result;
        }}
      />
    </>
  );
}
