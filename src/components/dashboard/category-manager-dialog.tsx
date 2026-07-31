"use client";

import { useMemo, useState } from "react";
import { Tags } from "lucide-react";
import { toast } from "sonner";
import { getCategorySummaries } from "@/lib/category-utils";
import type { Transaction } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CategoryManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactions: Transaction[];
  onRenameCategory: (from: string, to: string) => Promise<boolean>;
  onMergeCategories: (sources: string[], target: string) => Promise<boolean>;
}

export function CategoryManagerDialog({
  open,
  onOpenChange,
  transactions,
  onRenameCategory,
  onMergeCategories,
}: CategoryManagerDialogProps) {
  const categories = useMemo(
    () => getCategorySummaries(transactions),
    [transactions],
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [mergeTarget, setMergeTarget] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const selectedSummary = categories.find(
    (category) => category.name === selectedCategory,
  );

  const handleRename = async () => {
    if (!selectedCategory || !newName.trim()) return;
    setIsSaving(true);
    const ok = await onRenameCategory(selectedCategory, newName.trim());
    setIsSaving(false);

    if (ok) {
      toast.success(`Renamed "${selectedCategory}" to "${newName.trim()}"`);
      setSelectedCategory(null);
      setNewName("");
    } else {
      toast.error("Could not rename category.");
    }
  };

  const handleMerge = async () => {
    if (!selectedCategory || !mergeTarget.trim()) return;
    if (selectedCategory === mergeTarget.trim()) {
      toast.error("Choose a different target category.");
      return;
    }

    setIsSaving(true);
    const ok = await onMergeCategories([selectedCategory], mergeTarget.trim());
    setIsSaving(false);

    if (ok) {
      toast.success(`Merged "${selectedCategory}" into "${mergeTarget.trim()}"`);
      setSelectedCategory(null);
      setMergeTarget("");
    } else {
      toast.error("Could not merge categories.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-medium">
            <Tags className="size-4" />
            Category manager
          </DialogTitle>
          <DialogDescription>
            Rename or merge categories across all transactions.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-56 space-y-2 overflow-y-auto rounded-xl border border-border/60 p-2">
          {categories.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">
              No categories yet.
            </p>
          ) : (
            categories.map((category) => (
              <button
                key={category.name}
                type="button"
                onClick={() => {
                  setSelectedCategory(category.name);
                  setNewName(category.name);
                  setMergeTarget("");
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  selectedCategory === category.name
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-muted/60"
                }`}
              >
                <span>{category.name}</span>
                <span className="text-xs text-muted-foreground">
                  {category.count} entries
                </span>
              </button>
            ))
          )}
        </div>

        {selectedSummary && (
          <div className="space-y-4 rounded-xl border border-border/60 p-4">
            <p className="label-caps">Editing {selectedSummary.name}</p>
            <div className="space-y-2">
              <Label htmlFor="rename-category" className="label-caps">
                Rename to
              </Label>
              <div className="flex gap-2">
                <Input
                  id="rename-category"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="h-10 border-border/60 bg-background/50"
                />
                <Button
                  onClick={handleRename}
                  disabled={isSaving || !newName.trim()}
                  className="rounded-xl"
                >
                  Rename
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="merge-category" className="label-caps">
                Merge into
              </Label>
              <div className="flex gap-2">
                <Input
                  id="merge-category"
                  list="merge-category-options"
                  value={mergeTarget}
                  onChange={(e) => setMergeTarget(e.target.value)}
                  placeholder="Target category"
                  className="h-10 border-border/60 bg-background/50"
                />
                <datalist id="merge-category-options">
                  {categories
                    .filter((category) => category.name !== selectedSummary.name)
                    .map((category) => (
                      <option key={category.name} value={category.name} />
                    ))}
                </datalist>
                <Button
                  variant="outline"
                  onClick={handleMerge}
                  disabled={isSaving || !mergeTarget.trim()}
                  className="rounded-xl"
                >
                  Merge
                </Button>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
