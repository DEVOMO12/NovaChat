import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { api } from "@/lib/api";

const ONBOARDED_KEY = "@novachat_onboarded";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isOnboarded: boolean;
  completeOnboarding: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDED_KEY).then((v) => {
      setIsOnboarded(v === "true");
    });
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser);
      if (fbUser) {
        try {
          const token = await fbUser.getIdToken();
          const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.status === 404) {
            const username = fbUser.email?.split("@")[0] || fbUser.uid;
            await fetch(`${process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/register`, {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({ firebaseUid: fbUser.uid, username, displayName: fbUser.displayName || username, email: fbUser.email }),
            });
          }
        } catch (e) {
          console.error("Failed to sync user with backend", e);
        }
      }
      setIsLoading(false);
    });
    return unsub;
  }, []);

  async function completeOnboarding() {
    await AsyncStorage.setItem(ONBOARDED_KEY, "true");
    setIsOnboarded(true);
  }

  async function loginWithEmail(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function registerWithEmail(name: string, email: string, password: string) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    await sendEmailVerification(cred.user);
  }

  async function logout() {
    await signOut(auth);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, isOnboarded, completeOnboarding, loginWithEmail, registerWithEmail, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
