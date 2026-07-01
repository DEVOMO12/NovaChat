import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, initializeAuth, inMemoryPersistence } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

let auth: ReturnType<typeof getAuth>;

if (getApps().length === 0) {
  const app = initializeApp(firebaseConfig);
  // initializeAuth registers the auth component; getAuth alone does not in RN
  auth = initializeAuth(app, {
    persistence: inMemoryPersistence,
  });
} else {
  auth = getAuth(getApp());
}

export { auth };
export default getApps()[0];
