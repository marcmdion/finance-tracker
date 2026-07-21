"use client";

import type { CategoryDetailsModal, Transaction } from "@/lib/types";
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
import { cn } from "@/lib/utils";

interface CategoryDetailsDialogProps {
  modal: CategoryDetailsModal | null;
  transactions: Transaction[];
  onClose: () => void;
}

export function CategoryDetailsDialog({
  modal,
  transactions,
  onClose,
}: CategoryDetailsDialogProps) {
  const filtered = modal
    ? transactions
        .filter(
          (t) => t.category === modal.category && t.type === modal.type,
        )
        .sort((a, b) => b.createdAt - a.createdAt)
    : [];

  return (
    <Dialog open={modal !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[85vh] max-w-2xl flex-col gap-0 p-0">
        <DialogHeader className="border-b bg-muted/30 px-6 py-4">
          <DialogTitle>{modal?.category}</DialogTitle>
          <DialogDescription className="capitalize">
            {modal?.type} Transactions
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
                <TableRow key={tx.id}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {new Date(tx.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="font-medium">{tx.name}</TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-medium whitespace-nowrap",
                      tx.type === "income" && "text-green-600",
                    )}
                  >
                    ${tx.amount.toFixed(2)}
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
  );
}
