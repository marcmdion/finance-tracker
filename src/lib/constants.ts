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
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#84cc16",
  "#22c55e",
  "#14b8a6",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#d946ef",
  "#ec4899",
] as const;

export const FIRESTORE_RULES = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/transactions/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}`;
