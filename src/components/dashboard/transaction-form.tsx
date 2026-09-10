"use client";

import { useMemo, useState } from "react";
import { DEFAULT_CATEGORIES } from "@/lib/constants";
import { getTodayString } from "@/lib/cycle-utils";
import { formDataAmountError } from "@/lib/money-utils";
import type { Transaction, TransactionFormData } from "@/lib/types";
import { Button } from "@/components/ui/button";
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
  variant?: "panel" | "plain";
  fieldIdPrefix?: string;
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
  variant = "panel",
  fieldIdPrefix = "",
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
    const amountError = formDataAmountError(formData);
    if (amountError) return;
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

  const categoryListId = `${fieldIdPrefix}category-options`;
  const form = (
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor={`${fieldIdPrefix}date`} className="label-caps">Date</Label>
          <Input
            id={`${fieldIdPrefix}date`}
            type="date"
            required
            value={formData.date}
            onChange={(e) => {
              const date = e.target.value;
              setFormData((prev) => ({ ...prev, date }));
              if (!editingId) setLastUsedDate(date);
            }}
            className="h-10 border-border/60 bg-background/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${fieldIdPrefix}type`} className="label-caps">Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                type: value as TransactionFormData["type"],
              }))
            }
          >
            <SelectTrigger id={`${fieldIdPrefix}type`} className="h-10 w-full border-border/60 bg-background/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="expense">Expense</SelectItem>
              <SelectItem value="income">Income</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${fieldIdPrefix}amount`} className="label-caps">Amount</Label>
          <div className="relative">
            <span className="absolute top-2.5 left-3 text-sm text-muted-foreground">
              $
            </span>
            <Input
              id={`${fieldIdPrefix}amount`}
              type="number"
              step="0.01"
              min="0"
              required
              className="h-10 border-border/60 bg-background/50 pl-7 tabular-nums"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, amount: e.target.value }))
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${fieldIdPrefix}name`} className="label-caps">Merchant</Label>
          <Input
            id={`${fieldIdPrefix}name`}
            type="text"
            required
            placeholder="Netflix, grocery store..."
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="h-10 border-border/60 bg-background/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${fieldIdPrefix}category`} className="label-caps">Category</Label>
          <Input
            id={`${fieldIdPrefix}category`}
            type="text"
            required
            list={categoryListId}
            placeholder="Select or type new"
            value={formData.category}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, category: e.target.value }))
            }
            className="h-10 border-border/60 bg-background/50"
          />
          <datalist id={categoryListId}>
            {availableCategories.map((cat) => (
              <option key={cat} value={cat} />
            ))}
          </datalist>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            type="submit"
            className="h-10 flex-1 rounded-xl font-medium"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : editingId ? "Update" : "Add"}
          </Button>
          {editingId && variant === "panel" && (
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={resetForm}
              className="h-10 rounded-xl"
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
  );

  if (variant === "plain") {
    return form;
  }

  return (
    <div className="surface p-6 sm:p-7">
      <div className="mb-6 space-y-1">
        <p className="label-caps">{editingId ? "Editing" : "New entry"}</p>
        <h2 className="text-lg font-medium tracking-[-0.02em]">
          {editingId ? "Update transaction" : "Record transaction"}
        </h2>
        <p className="text-sm text-muted-foreground">
          Categories auto-fill from past merchant names.
        </p>
      </div>
      {form}
    </div>
  );
}
