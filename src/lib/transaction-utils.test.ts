import { describe, expect, it } from "vitest";
import {
  normalizeTransaction,
  formDataToTransaction,
} from "@/lib/transaction-utils";

describe("transaction utils", () => {
  it("normalizes legacy firestore documents", () => {
    const transaction = normalizeTransaction("abc", {
      type: "expense",
      amount: 12.5,
      name: "Coffee",
      category: "Eat Out",
      date: "2026-07-01",
      createdAt: new Date(2026, 6, 1).getTime(),
    });

    expect(transaction.amountCents).toBe(1250);
    expect(transaction.transactionDate).toBe("2026-07-01");
    expect(transaction.name).toBe("Coffee");
  });

  it("creates a transaction from form data", () => {
    const transaction = formDataToTransaction({
      type: "income",
      amount: "2500.00",
      name: "Salary",
      category: "Income",
      date: "2026-07-20",
    });

    expect(transaction?.amountCents).toBe(250000);
    expect(transaction?.transactionDate).toBe("2026-07-20");
  });
});
