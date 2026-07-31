"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { ErrorBoundary } from "@/components/error-boundary";

const FinanceApp = dynamic(
  () => import("@/components/finance-app").then((mod) => mod.FinanceApp),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground/70" />
      </div>
    ),
  },
);

export function FinanceAppLoader() {
  return (
    <ErrorBoundary>
      <FinanceApp />
    </ErrorBoundary>
  );
}
