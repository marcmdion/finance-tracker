import { describe, expect, it } from "vitest";
import {
  findMerchantMatches,
  matchesMerchantRule,
} from "@/lib/merchant-utils";
import type { Transaction } from "@/lib/types";

const baseTransaction: Transaction = {
  id: "1",
  type: "expense",
  amountCents: 1540,
  name: "sushi",
  category: "Food/Groceries",
  transactionDate: "2026-08-17",
  createdAt: 1,
};

const sushiRule = {
  id: "sushi-to-food-md-lunch-v1",
  merchantPattern: /^sushi$/i,
  targetName: "Sushi",
  targetCategory: "Food MD - Lunch",
  sourceCategory: "Food/Groceries",
  type: "expense" as const,
};

describe("merchant-utils", () => {
  it("matches sushi variants in the source category", () => {
    expect(matchesMerchantRule(baseTransaction, sushiRule)).toBe(true);
    expect(
      matchesMerchantRule({ ...baseTransaction, name: "Sushi" }, sushiRule),
    ).toBe(true);
  });

  it("ignores other merchants and categories", () => {
    expect(
      matchesMerchantRule({ ...baseTransaction, name: "Thai" }, sushiRule),
    ).toBe(false);
    expect(
      matchesMerchantRule(
        { ...baseTransaction, category: "Food MD - Lunch" },
        sushiRule,
      ),
    ).toBe(false);
  });

  it("finds all matching transactions", () => {
    const matches = findMerchantMatches(
      [
        baseTransaction,
        { ...baseTransaction, id: "2", name: "Sushi" },
        { ...baseTransaction, id: "3", name: "Thai" },
      ],
      sushiRule,
    );

    expect(matches).toHaveLength(2);
  });
});
