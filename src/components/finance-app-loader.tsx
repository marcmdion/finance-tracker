"use client";

import dynamic from "next/dynamic";
import { ErrorBoundary } from "@/components/error-boundary";
import { RunningManLoader } from "@/components/running-man-loader";

const FinanceApp = dynamic(
  () => import("@/components/finance-app").then((mod) => mod.FinanceApp),
  {
    ssr: false,
    loading: () => (
      <RunningManLoader
        label="Warming up Finance Strategist…"
        className="min-h-screen"
      />
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
