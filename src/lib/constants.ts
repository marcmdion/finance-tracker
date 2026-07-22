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
    match /users/{userId}/transactions/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}`;
