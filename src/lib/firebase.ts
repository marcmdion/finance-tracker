import {
  initializeApp,
  getApps,
  getApp,
  type FirebaseApp,
} from "firebase/app";
import { getAuth, initializeAuth, type Auth } from "firebase/auth";
import {
  browserLocalPersistence,
  browserSessionPersistence,
  indexedDBLocalPersistence,
  inMemoryPersistence,
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId,
  );
}

let firebaseApp: FirebaseApp | undefined;
let firebaseAuth: Auth | undefined;
let firebaseDb: Firestore | undefined;

function initFirebase() {
  if (typeof window === "undefined") {
    return null;
  }

  if (!firebaseApp) {
    firebaseApp =
      getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    try {
      firebaseAuth = initializeAuth(firebaseApp, {
        persistence: [
          indexedDBLocalPersistence,
          browserLocalPersistence,
          browserSessionPersistence,
          inMemoryPersistence,
        ],
      });
    } catch {
      firebaseAuth = getAuth(firebaseApp);
    }
    firebaseDb = getFirestore(firebaseApp);
  }

  return {
    app: firebaseApp,
    auth: firebaseAuth!,
    db: firebaseDb!,
  };
}

export function getFirebaseAuth(): Auth {
  const firebase = initFirebase();
  if (!firebase) {
    throw new Error("Firebase Auth is only available in the browser.");
  }
  return firebase.auth;
}

export function getFirebaseDb(): Firestore {
  const firebase = initFirebase();
  if (!firebase) {
    throw new Error("Firestore is only available in the browser.");
  }
  return firebase.db;
}
