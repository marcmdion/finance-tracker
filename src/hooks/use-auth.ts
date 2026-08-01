"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase";

const AUTH_READY_TIMEOUT_MS = 12_000;

const missingConfigMessage =
  "This build is missing Firebase configuration. Redeploy with valid NEXT_PUBLIC_FIREBASE_* values.";

export function useAuth() {
  const configured = isFirebaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(configured);
  const [initError, setInitError] = useState<string | null>(
    configured ? null : missingConfigMessage,
  );

  useEffect(() => {
    if (!configured) return;

    let authReady = false;

    const timeoutId = window.setTimeout(() => {
      if (authReady) return;
      setInitError(
        "Session check is taking too long. Check your connection, then refresh or sign in below.",
      );
      setLoading(false);
    }, AUTH_READY_TIMEOUT_MS);

    let unsubscribe = () => {};

    try {
      const auth = getFirebaseAuth();
      unsubscribe = onAuthStateChanged(auth, (nextUser) => {
        authReady = true;
        window.clearTimeout(timeoutId);
        setInitError(null);
        setUser(nextUser);
        setLoading(false);
      });
    } catch (error) {
      authReady = true;
      window.clearTimeout(timeoutId);
      const message =
        error instanceof Error ? error.message : "Could not start Firebase Auth.";
      window.setTimeout(() => {
        setInitError(message);
        setLoading(false);
      }, 0);
    }

    return () => {
      authReady = true;
      window.clearTimeout(timeoutId);
      unsubscribe();
    };
  }, [configured]);

  return { user, loading, initError };
}
