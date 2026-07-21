"use client";

import { useMemo, useState } from "react";
import { DEFAULT_CATEGORIES } from "@/lib/constants";
import { getTodayString } from "@/lib/cycle-utils";
import type { Transaction, TransactionFormData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TransactionFormProps {
  transactions: Transaction[];
  editingId: string | null;
  isSubmitting: boolean;
  onSubmit: (formData: TransactionFormData) => Promise<void>;
  onCancelEdit: () => void;
  initialFormData?: TransactionFormData;
}

function createInitialForm(date?: string): TransactionFormData {
  return {
    type: "expense",
    amount: "",
    name: "",
    category: "",
    date: date ?? getTodayString(),
  };
}

export function TransactionForm({
  transactions,
  editingId,
  isSubmitting,
  onSubmit,
  onCancelEdit,
  initialFormData,
}: TransactionFormProps) {
  const [formData, setFormData] = useState<TransactionFormData>(
    initialFormData ?? createInitialForm(),
  );
  const [lastUsedDate, setLastUsedDate] = useState(getTodayString());

  const availableCategories = useMemo(() => {
    const dynamicCategories = transactions
      .map((t) => t.category)
      .filter(Boolean);
    return Array.from(
      new Set([...DEFAULT_CATEGORIES, ...dynamicCategories]),
    ).sort();
  }, [transactions]);

  const handleNameChange = (newName: string) => {
    setFormData((prev) => {
      const next = { ...prev, name: newName };

      if (newName.trim().length >= 2) {
        const match = transactions.find(
          (t) =>
            t.type === prev.type &&
            t.name.toLowerCase() === newName.toLowerCase(),
        );
        if (match?.category) {
          next.category = match.category;
        }
      }

      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.name || !formData.category || !formData.date) {
      return;
    }

    await onSubmit(formData);

    if (editingId) {
      setFormData(createInitialForm(lastUsedDate));
    } else {
      setFormData({
        ...createInitialForm(formData.date),
        type: formData.type,
      });
      setLastUsedDate(formData.date);
    }
  };

  const resetForm = () => {
    setFormData(createInitialForm(lastUsedDate));
    onCancelEdit();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {editingId ? "Edit Transaction" : "Record Transaction"}
        </CardTitle>
        <CardDescription>
          Auto-categorizes based on past entries with the same merchant name.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              required
              value={formData.date}
              onChange={(e) => {
                const date = e.target.value;
                setFormData((prev) => ({ ...prev, date }));
                if (!editingId) setLastUsedDate(date);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  type: value as TransactionFormData["type"],
                }))
              }
            >
              <SelectTrigger id="type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="income">Income</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <span className="absolute top-2.5 left-3 text-sm text-muted-foreground">
                $
              </span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                required
                className="pl-7"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, amount: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name / Merchant</Label>
            <Input
              id="name"
              type="text"
              required
              placeholder="e.g. Netflix, Grocery Store"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              type="text"
              required
              list="category-options"
              placeholder="Select or type new..."
              value={formData.category}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, category: e.target.value }))
              }
            />
            <datalist id="category-options">
              {availableCategories.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : editingId ? "Update" : "Add"}
            </Button>
            {editingId && (
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={resetForm}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function transactionToFormData(tx: Transaction): TransactionFormData {
  return {
    type: tx.type,
    amount: tx.amount.toString(),
    name: tx.name,
    category: tx.category,
    date: tx.date || getTodayString(),
  };
}
