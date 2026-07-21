"use client";

import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { getFirebaseDb } from "@/lib/firebase";
import { dateStringToTimestamp } from "@/lib/cycle-utils";
import type { Transaction, TransactionFormData } from "@/lib/types";

export function useTransactions(user: User | null) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncError, setSyncError] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Reset loading while waiting for the Firestore snapshot for this user.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Firestore subscription lifecycle
    setLoading(true);
    const txPath = collection(getFirebaseDb(), "users", user.uid, "transactions");

    const unsubscribe = onSnapshot(
      txPath,
      (snapshot) => {
        setSyncError(false);
        const data = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<Transaction, "id">),
        }));
        data.sort((a, b) => b.createdAt - a.createdAt);
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

  const saveTransaction = async (
    formData: TransactionFormData,
    editingId: string | null,
  ) => {
    if (!user) return false;

    const txDate = dateStringToTimestamp(formData.date);
    const txData = {
      type: formData.type,
      amount: parseFloat(formData.amount),
      name: formData.name,
      category: formData.category,
      date: formData.date,
      createdAt: txDate,
    };

    try {
      if (editingId) {
        const docRef = doc(getFirebaseDb(), "users", user.uid, "transactions", editingId);
        await updateDoc(docRef, txData);
      } else {
        const txPath = collection(getFirebaseDb(), "users", user.uid, "transactions");
        await addDoc(txPath, txData);
      }
      return true;
    } catch (error) {
      console.error("Error saving transaction:", error);
      if (
        error instanceof Error &&
        "code" in error &&
        error.code === "permission-denied"
      ) {
        setSyncError(true);
      }
      return false;
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return false;

    try {
      const docRef = doc(getFirebaseDb(), "users", user.uid, "transactions", id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error("Error deleting transaction:", error);
      if (
        error instanceof Error &&
        "code" in error &&
        error.code === "permission-denied"
      ) {
        setSyncError(true);
      }
      return false;
    }
  };

  return {
    transactions,
    loading,
    syncError,
    saveTransaction,
    deleteTransaction,
  };
}
