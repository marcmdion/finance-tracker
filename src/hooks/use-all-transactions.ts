"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  writeBatch,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { getFirebaseDb } from "@/lib/firebase";
import {
  needsMigration,
  normalizeTransaction,
  toFirestorePayload,
} from "@/lib/transaction-utils";
import type { Transaction } from "@/lib/types";

async function migrateLegacyDocuments(
  user: User,
  docs: { id: string; data: Record<string, unknown> }[],
) {
  const pending = docs.filter(({ data }) => needsMigration(data));
  if (pending.length === 0) return;

  const batch = writeBatch(getFirebaseDb());
  pending.forEach(({ id, data }) => {
    const normalized = normalizeTransaction(id, data);
    const ref = doc(getFirebaseDb(), "users", user.uid, "transactions", id);
    batch.update(ref, toFirestorePayload(normalized));
  });

  await batch.commit();
}

export function useAllTransactions(user: User | null) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncError, setSyncError] = useState(false);
  const migrationAttemptedRef = useRef(false);

  useEffect(() => {
    if (!user) {
      migrationAttemptedRef.current = false;
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- Firestore subscription lifecycle
    setLoading(true);
    const txPath = collection(getFirebaseDb(), "users", user.uid, "transactions");

    const unsubscribe = onSnapshot(
      txPath,
      (snapshot) => {
        setSyncError(false);
        const rawDocs = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          data: docSnap.data() as Record<string, unknown>,
        }));

        if (!migrationAttemptedRef.current) {
          migrationAttemptedRef.current = true;
          void migrateLegacyDocuments(user, rawDocs).catch((error) => {
            console.error("Legacy migration error:", error);
          });
        }

        const data = rawDocs.map(({ id, data }) =>
          normalizeTransaction(id, data),
        );
        data.sort((a, b) => b.transactionDate.localeCompare(a.transactionDate));
        setTransactions(data);
        setLoading(false);
      },
      (error) => {
        console.error("Firestore sync error:", error);
        if (
          error.code === "permission-denied" ||
          error.message.includes("permission")
        ) {
          setSyncError(true);
        }
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user]);

  const renameCategory = useCallback(
    async (fromCategory: string, toCategory: string) => {
      if (!user) return false;

      const trimmedTarget = toCategory.trim();
      if (!trimmedTarget) return false;

      const affected = transactions.filter(
        (transaction) => transaction.category === fromCategory,
      );
      if (affected.length === 0) return true;

      try {
        const batch = writeBatch(getFirebaseDb());
        affected.forEach((transaction) => {
          const ref = doc(
            getFirebaseDb(),
            "users",
            user.uid,
            "transactions",
            transaction.id,
          );
          batch.update(ref, {
            category: trimmedTarget,
            updatedAt: Date.now(),
          });
        });
        await batch.commit();
        return true;
      } catch (error) {
        console.error("Error renaming category:", error);
        return false;
      }
    },
    [transactions, user],
  );

  const mergeCategories = useCallback(
    async (sourceCategories: string[], targetCategory: string) => {
      if (!user) return false;

      const trimmedTarget = targetCategory.trim();
      if (!trimmedTarget) return false;

      try {
        const batch = writeBatch(getFirebaseDb());
        transactions
          .filter((transaction) => sourceCategories.includes(transaction.category))
          .forEach((transaction) => {
            const ref = doc(
              getFirebaseDb(),
              "users",
              user.uid,
              "transactions",
              transaction.id,
            );
            batch.update(ref, {
              category: trimmedTarget,
              updatedAt: Date.now(),
            });
          });
        await batch.commit();
        return true;
      } catch (error) {
        console.error("Error merging categories:", error);
        return false;
      }
    },
    [transactions, user],
  );

  return {
    transactions,
    loading,
    syncError,
    renameCategory,
    mergeCategories,
  };
}

