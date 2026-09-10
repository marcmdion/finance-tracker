"use client";

import { useState } from "react";
import { toast } from "sonner";
import { TransactionForm } from "@/components/dashboard/transaction-form";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { transactionToFormData } from "@/lib/transaction-utils";
import type { Transaction, TransactionFormData } from "@/lib/types";

interface TransactionEditDialogProps {
  transaction: Transaction | null;
  transactions: Transaction[];
  open: boolean;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (
    formData: TransactionFormData,
    transactionId: string,
  ) => Promise<{ ok: true } | { ok: false; message: string }>;
  onDelete: (transactionId: string) => Promise<{ ok: true } | { ok: false; message: string }>;
}

export function TransactionEditDialog({
  transaction,
  transactions,
  open,
  isSubmitting,
  onOpenChange,
  onSave,
  onDelete,
}: TransactionEditDialogProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = async (formData: TransactionFormData) => {
    if (!transaction) return;

    const result = await onSave(formData, transaction.id);
    if (result.ok) {
      toast.success("Transaction updated");
      onOpenChange(false);
      return;
    }

    toast.error(result.message);
  };

  const handleConfirmDelete = async () => {
    if (!transaction) return;

    setIsDeleting(true);
    const result = await onDelete(transaction.id);
    setIsDeleting(false);

    if (result.ok) {
      setDeleteOpen(false);
      onOpenChange(false);
      return;
    }

    toast.error(result.message);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-medium">Edit transaction</DialogTitle>
            <DialogDescription>
              Update the merchant, category, amount, or date.
            </DialogDescription>
          </DialogHeader>

          {transaction && (
            <TransactionForm
              key={transaction.id}
              variant="plain"
              fieldIdPrefix="edit-dialog-"
              transactions={transactions}
              editingId={transaction.id}
              initialFormData={transactionToFormData(transaction)}
              isSubmitting={isSubmitting}
              onSubmit={handleSave}
              onCancelEdit={() => onOpenChange(false)}
            />
          )}

          <DialogFooter className="gap-2 sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              disabled={isSubmitting || isDeleting || !transaction}
              onClick={() => setDeleteOpen(true)}
            >
              Delete
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-medium">
              Delete transaction?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone. The entry will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
