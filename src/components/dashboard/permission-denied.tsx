"use client";

import { signOut } from "firebase/auth";
import { AlertTriangle } from "lucide-react";
import { getFirebaseAuth } from "@/lib/firebase";
import { FIRESTORE_RULES } from "@/lib/constants";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function PermissionDenied() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4 sm:p-6">
      <Card className="w-full max-w-2xl border-destructive/30 bg-destructive/5">
        <CardHeader>
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-6 shrink-0 text-destructive" />
            <div>
              <CardTitle className="text-destructive">
                Database Permission Denied
              </CardTitle>
              <CardDescription className="mt-2 text-destructive/90">
                You successfully logged in, but your Firebase database rules
                are blocking read and write access. Update your Firestore rules
                to allow authenticated users to modify their own data.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertTitle>How to fix it in 3 steps</AlertTitle>
            <AlertDescription className="mt-3 space-y-2">
              <ol className="list-decimal space-y-2 pl-5">
                <li>
                  Go to the{" "}
                  <a
                    href="https://console.firebase.google.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary underline"
                  >
                    Firebase Console
                  </a>{" "}
                  and open <strong>finance-tracker-27d5f</strong>
                </li>
                <li>
                  Click <strong>Firestore Database</strong>, then the{" "}
                  <strong>Rules</strong> tab.
                </li>
                <li>
                  Paste the code below and click <strong>Publish</strong>:
                </li>
              </ol>
            </AlertDescription>
          </Alert>

          <pre className="overflow-x-auto rounded-md bg-zinc-900 p-4 text-xs text-zinc-100">
            {FIRESTORE_RULES}
          </pre>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="destructive"
              onClick={() => window.location.reload()}
            >
              I&apos;ve updated the rules, reload app
            </Button>
            <Button variant="outline" onClick={() => signOut(getFirebaseAuth())}>
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
