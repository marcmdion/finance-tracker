export const DEFAULT_CATEGORIES = [
  "House",
  "House Rates",
  "House Insurance",
  "Personal Insurance",
  "Car Insurance",
  "Food/Groceries",
  "Eat Out",
  "Power",
  "Transport",
  "Maintenance",
  "Personal Care/Meds",
  "Entertainment",
  "Laundromat",
  "Basketball",
  "Haircut",
  "Internet",
  "Clothing",
] as const;

export const CHART_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#a78bfa",
  "#38bdf8",
  "#2dd4bf",
  "#34d399",
  "#fbbf24",
  "#fb923c",
  "#f87171",
  "#fb7185",
  "#c084fc",
  "#818cf8",
] as const;

export const FIRESTORE_RULES = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/transactions/{transactionId} {
      allow read, delete: if request.auth != null && request.auth.uid == userId;
      allow create, update: if request.auth != null
        && request.auth.uid == userId
        && isValidTransaction(request.resource.data);
    }

    function isValidTransaction(data) {
      return data.type in ['income', 'expense']
        && data.amountCents is int
        && data.amountCents > 0
        && data.amountCents < 1000000000
        && data.name is string
        && data.name.size() > 0
        && data.name.size() <= 200
        && data.category is string
        && data.category.size() > 0
        && data.category.size() <= 100
        && data.transactionDate is string
        && data.transactionDate.size() == 10
        && data.recordedAt is int
        && data.updatedAt is int;
    }
  }
}`;
