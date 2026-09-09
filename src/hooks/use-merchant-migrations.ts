"use client";

import { useEffect, useRef } from "react";
import type { User } from "firebase/auth";
import { doc, writeBatch } from "firebase/firestore";
import { toast } from "sonner";
import { getFirebaseDb } from "@/lib/firebase";
import { MERCHANT_MIGRATIONS } from "@/lib/merchant-migrations";
import {
  findMerchantMatches,
  isMerchantMigrationComplete,
  markMerchantMigrationComplete,
} from "@/lib/merchant-utils";
import type { Transaction } from "@/lib/types";

const FIRESTORE_BATCH_LIMIT = 500;

async function applyMerchantMigration(
  user: User,
  transactions: Transaction[],
  migrationId: string,
  matches: Transaction[],
  targetName: string,
  targetCategory: string,
) {
  if (matches.length === 0) {
    markMerchantMigrationComplete(user.uid, migrationId);
    return 0;
  }

  for (let index = 0; index < matches.length; index += FIRESTORE_BATCH_LIMIT) {
    const chunk = matches.slice(index, index + FIRESTORE_BATCH_LIMIT);
    const batch = writeBatch(getFirebaseDb());

    chunk.forEach((transaction) => {
      const ref = doc(
        getFirebaseDb(),
        "users",
        user.uid,
        "transactions",
        transaction.id,
      );
      batch.update(ref, {
        name: targetName,
        category: targetCategory,
        updatedAt: Date.now(),
      });
    });

    await batch.commit();
  }

  markMerchantMigrationComplete(user.uid, migrationId);
  return matches.length;
}

export function useMerchantMigrations(
  user: User | null,
  transactions: Transaction[],
  loading: boolean,
) {
  const runningRef = useRef(false);

  useEffect(() => {
    if (!user || loading || runningRef.current) return;

    const pending = MERCHANT_MIGRATIONS.filter(
      (migration) => !isMerchantMigrationComplete(user.uid, migration.id),
    );

    if (pending.length === 0) return;

    runningRef.current = true;

    void (async () => {
      try {
        for (const migration of pending) {
          const matches = findMerchantMatches(transactions, migration);
          const updatedCount = await applyMerchantMigration(
            user,
            transactions,
            migration.id,
            matches,
            migration.targetName,
            migration.targetCategory,
          );

          if (updatedCount > 0) {
            toast.success(
              `Moved ${updatedCount} ${migration.targetName} transaction${updatedCount === 1 ? "" : "s"} to ${migration.targetCategory}.`,
            );
          }
        }
      } catch (error) {
        console.error("Merchant migration error:", error);
        toast.error("Could not update merchant categories in the background.");
      } finally {
        runningRef.current = false;
      }
    })();
  }, [user, transactions, loading]);
}
