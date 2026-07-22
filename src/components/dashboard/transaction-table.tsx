"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { Transaction } from "@/lib/types";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface TransactionTableProps {
  transactions: Transaction[];
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => Promise<void>;
}

export function TransactionTable({
  transactions,
  onEdit,
  onDelete,
}: TransactionTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    await onDelete(deleteId);
    setIsDeleting(false);
    setDeleteId(null);
  };

  return (
    <>
      <div className="surface overflow-hidden">
        <div className="border-b border-border/50 px-6 py-5">
          <p className="label-caps mb-1">Current cycle</p>
          <h2 className="text-lg font-medium tracking-[-0.02em]">Transactions</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-border/40 hover:bg-transparent">
              <TableHead className="label-caps h-11">Name</TableHead>
              <TableHead className="label-caps h-11">Category</TableHead>
              <TableHead className="label-caps h-11">Date</TableHead>
              <TableHead className="label-caps h-11 text-right">Amount</TableHead>
              <TableHead className="h-11 w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-12 text-center text-sm text-muted-foreground"
                >
                  No transactions in this cycle yet.
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((tx) => (
                <TableRow key={tx.id} className="border-border/30">
                  <TableCell className="font-medium">{tx.name}</TableCell>
                  <TableCell>
                    <span className="rounded-full bg-muted/70 px-2.5 py-1 text-xs text-muted-foreground">
                      {tx.category}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground tabular-nums">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "metric-value-sm text-right",
                      tx.type === "income"
                        ? "text-emerald-600/90"
                        : "text-foreground/85",
                    )}
                  >
                    {tx.type === "income" ? "+" : "−"}${tx.amount.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onEdit(tx)}
                        aria-label={`Edit ${tx.name}`}
                        className="rounded-lg text-muted-foreground"
                      >
                        <Pencil className="size-3.5" strokeWidth={1.75} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setDeleteId(tx.id)}
                        aria-label={`Delete ${tx.name}`}
                        className="rounded-lg text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" strokeWidth={1.75} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-medium">Delete transaction?</AlertDialogTitle>
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
