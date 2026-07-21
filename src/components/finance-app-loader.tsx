"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const FinanceApp = dynamic(
  () => import("@/components/finance-app").then((mod) => mod.FinanceApp),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    ),
  },
);

export function FinanceAppLoader() {
  return <FinanceApp />;
}
