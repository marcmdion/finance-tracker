"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatDateStr } from "@/lib/cycle-utils";
import type { CycleDates } from "@/lib/types";
import { Button } from "@/components/ui/button";

interface CycleNavigatorProps {
  cycleDates: CycleDates;
  cycleOffset: number;
  onPrevious: () => void;
  onNext: () => void;
  onReset: () => void;
}

export function CycleNavigator({
  cycleDates,
  cycleOffset,
  onPrevious,
  onNext,
  onReset,
}: CycleNavigatorProps) {
  return (
    <div className="inline-flex items-center rounded-full border bg-background p-1 shadow-sm">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onPrevious}
        title="Previous Cycle"
        aria-label="Previous cycle"
      >
        <ChevronLeft className="size-4" />
      </Button>
      <span className="min-w-[160px] px-3 text-center text-sm font-medium text-muted-foreground">
        {formatDateStr(cycleDates.start)} - {formatDateStr(cycleDates.end)}
      </span>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onNext}
        title="Next Cycle"
        aria-label="Next cycle"
      >
        <ChevronRight className="size-4" />
      </Button>
      {cycleOffset !== 0 && (
        <Button
          variant="secondary"
          size="sm"
          className="ml-2 rounded-full"
          onClick={onReset}
        >
          Current
        </Button>
      )}
    </div>
  );
}
