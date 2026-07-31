import { describe, expect, it } from "vitest";
import {
  centsToAmount,
  formatMoney,
  parseAmountToCents,
  validateTransactionAmount,
} from "@/lib/money-utils";

describe("money utils", () => {
  it("parses valid amounts to cents", () => {
    expect(parseAmountToCents("12.34")).toBe(1234);
  });

  it("rejects invalid amounts", () => {
    expect(parseAmountToCents("abc")).toBeNull();
    expect(parseAmountToCents("0")).toBeNull();
    expect(parseAmountToCents("-5")).toBeNull();
  });

  it("validates user-facing amount errors", () => {
    expect(validateTransactionAmount("")).toBe("Amount is required.");
    expect(validateTransactionAmount("foo")).toBe("Enter a valid number.");
    expect(validateTransactionAmount("0")).toBe(
      "Amount must be greater than zero.",
    );
  });

  it("formats money from cents", () => {
    expect(formatMoney(1234)).toBe("$12.34");
    expect(formatMoney(500, { signed: true, type: "income" })).toBe("+$5.00");
    expect(centsToAmount(199)).toBe(1.99);
  });
});
