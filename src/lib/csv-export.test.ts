import { describe, expect, it } from "vitest";
import { exportTransactionsToCsv } from "@/lib/csv-export";

describe("exportTransactionsToCsv", () => {
  it("exports headers and rows", () => {
    const csv = exportTransactionsToCsv([
      {
        id: "1",
        type: "expense",
        amountCents: 1299,
        name: "Coffee",
        category: "Eat Out",
        transactionDate: "2026-07-21",
        createdAt: 1,
        updatedAt: 2,
      },
    ]);

    expect(csv).toContain("Date,Type,Name,Category,Amount");
    expect(csv).toContain("Coffee");
    expect(csv).toContain("12.99");
  });
});
