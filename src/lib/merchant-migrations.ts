import type { MerchantRecategorizeRule } from "@/lib/merchant-utils";

export const MERCHANT_MIGRATIONS: MerchantRecategorizeRule[] = [
  {
    id: "sushi-to-food-md-lunch-v1",
    merchantPattern: /^sushi$/i,
    targetName: "Sushi",
    targetCategory: "Food MD - Lunch",
    sourceCategory: "Food/Groceries",
    type: "expense",
  },
];
