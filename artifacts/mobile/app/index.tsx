import { Redirect } from "expo-router";

import { useAuth } from "@/context/AuthContext";

export default function Root() {
  const { user, isLoading, isOnboarded } = useAuth();

  if (isLoading) return null;

  if (!isOnboarded) return <Redirect href="/onboarding" />;
  if (!user) return <Redirect href="/(auth)/login" />;

  return <Redirect href="/(tabs)" />;
}
