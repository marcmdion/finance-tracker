"use client";

import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { cycleToDateStrings } from "@/lib/cycle-query-utils";
import { getFirebaseDb } from "@/lib/firebase";
import { formDataAmountError } from "@/lib/money-utils";
import {
  formDataToTransaction,
  normalizeTransaction,
  toFirestorePayload,
} from "@/lib/transaction-utils";
import type { CycleDates, Transaction, TransactionFormData } from "@/lib/types";
import { migrateSingleDocument } from "@/lib/migrate-utils";

export function useCycleTransactions(
  user: User | null,
  cycleDates: CycleDates,
) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect -- Firestore subscription lifecycle
    setLoading(true);
    const { start, end } = cycleToDateStrings(cycleDates);
    const txPath = collection(getFirebaseDb(), "users", user.uid, "transactions");
    const cycleQuery = query(
      txPath,
      where("transactionDate", ">=", start),
      where("transactionDate", "<=", end),
    );

    const unsubscribe = onSnapshot(
      cycleQuery,
      (snapshot) => {
        const data = snapshot.docs.map((docSnap) => {
          const raw = docSnap.data() as Record<string, unknown>;
          void migrateSingleDocument(user, docSnap.id, raw).catch(console.error);
          return normalizeTransaction(docSnap.id, raw);
        });
        data.sort((a, b) => b.transactionDate.localeCompare(a.transactionDate));
        setTransactions(data);
        setLoading(false);
      },
      (error) => {
        console.error("Cycle query error:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user, cycleDates]);

  return { transactions, loading };
}

export async function saveTransaction(
  user: User,
  formData: TransactionFormData,
  editingId: string | null,
  existing?: Transaction,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const amountError = formDataAmountError(formData);
  if (amountError) {
    return { ok: false, message: amountError };
  }

  if (!formData.name.trim() || !formData.category.trim() || !formData.date) {
    return { ok: false, message: "Please complete all fields." };
  }

  const transaction = formDataToTransaction(formData, existing);
  if (!transaction) {
    return { ok: false, message: "Enter a valid amount greater than zero." };
  }

  try {
    const payload = toFirestorePayload(transaction);

    if (editingId) {
      const docRef = doc(
        getFirebaseDb(),
        "users",
        user.uid,
        "transactions",
        editingId,
      );
      await updateDoc(docRef, payload);
    } else {
      const txPath = collection(getFirebaseDb(), "users", user.uid, "transactions");
      await addDoc(txPath, payload);
    }

    return { ok: true };
  } catch (error) {
    console.error("Error saving transaction:", error);
    return { ok: false, message: "Could not save the transaction. Try again." };
  }
}

export async function deleteTransaction(
  user: User,
  id: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    const docRef = doc(getFirebaseDb(), "users", user.uid, "transactions", id);
    await deleteDoc(docRef);
    return { ok: true };
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return { ok: false, message: "Could not delete the transaction. Try again." };
  }
}
