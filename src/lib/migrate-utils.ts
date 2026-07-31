import type { User } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import {
  needsMigration,
  normalizeTransaction,
  toFirestorePayload,
} from "@/lib/transaction-utils";

export async function migrateSingleDocument(
  user: User,
  id: string,
  data: Record<string, unknown>,
) {
  if (!needsMigration(data)) return;
  const normalized = normalizeTransaction(id, data);
  const ref = doc(getFirebaseDb(), "users", user.uid, "transactions", id);
  await updateDoc(ref, toFirestorePayload(normalized));
}
