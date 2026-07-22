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
    <div className="surface-muted inline-flex items-center gap-1 px-1.5 py-1.5">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onPrevious}
        aria-label="Previous cycle"
        className="rounded-xl text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" strokeWidth={1.75} />
      </Button>
      <span className="min-w-[168px] px-2 text-center text-[0.8rem] font-medium tracking-[-0.01em] text-muted-foreground tabular-nums">
        {formatDateStr(cycleDates.start)} – {formatDateStr(cycleDates.end)}
      </span>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onNext}
        aria-label="Next cycle"
        className="rounded-xl text-muted-foreground hover:text-foreground"
      >
        <ChevronRight className="size-4" strokeWidth={1.75} />
      </Button>
      {cycleOffset !== 0 && (
        <Button
          variant="secondary"
          size="sm"
          className="ml-1 h-7 rounded-lg px-3 text-xs font-medium"
          onClick={onReset}
        >
          Today
        </Button>
      )}
    </div>
  );
}
