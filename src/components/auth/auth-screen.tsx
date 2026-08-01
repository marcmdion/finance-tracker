"use client";

import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AuthScreen({ initNotice }: { initNotice?: string | null }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
      } else {
        await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
      }
    } catch (err) {
      const firebaseError = err as { code?: string; message: string };
      let friendlyError = firebaseError.message;

      if (firebaseError.code === "auth/email-already-in-use") {
        friendlyError =
          "This email is already registered. Please switch to sign in.";
      } else if (firebaseError.code === "auth/invalid-credential") {
        friendlyError = "Incorrect email or password.";
      }

      setError(friendlyError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="surface w-full max-w-[420px] p-8 sm:p-10">
        <div className="mb-8 space-y-3 text-center">
          <p className="label-caps">Finance Strategist</p>
          <h1 className="text-[1.75rem] leading-tight font-medium tracking-[-0.03em]">
            {isLogin ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Track income, expenses, and cash flow across custom billing cycles.
          </p>
        </div>

        {initNotice && (
          <Alert className="mb-6 border-border/60 bg-muted/40">
            <AlertDescription>{initNotice}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6 border-destructive/20 bg-destructive/5">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="label-caps">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 border-border/60 bg-background/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="label-caps">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-10 border-border/60 bg-background/50"
            />
          </div>
          <Button
            type="submit"
            className="mt-2 h-10 w-full rounded-xl font-medium"
            disabled={isLoading}
          >
            {isLoading ? "Please wait..." : isLogin ? "Sign in" : "Create account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isLogin ? "New here? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="font-medium text-foreground transition-colors hover:text-primary"
          >
            {isLogin ? "Create account" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
