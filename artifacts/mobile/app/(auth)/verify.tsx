import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function VerifyEmail() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const [checking, setChecking] = useState(false);

  async function handleContinue() {
    setChecking(true);
    try {
      await user?.reload();
      if (user?.emailVerified) {
        router.replace("/(tabs)");
      } else {
        Alert.alert(
          "Not Verified Yet",
          "Please check your inbox and click the verification link, then try again."
        );
      }
    } catch {
      Alert.alert("Error", "Could not check verification status. Please try again.");
    } finally {
      setChecking(false);
    }
  }

  async function handleSignOut() {
    await logout();
    router.replace("/(auth)/login");
  }

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + (Platform.OS === "web" ? 67 : 60),
          paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 24),
        },
      ]}
    >
      <LinearGradient
        colors={[colors.primary, "#4DA3FF"]}
        style={styles.iconWrap}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Feather name="mail" size={40} color="#fff" />
      </LinearGradient>

      <Text style={[styles.title, { color: colors.text }]}>Check your email</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        We sent a verification link to
      </Text>
      <Text style={[styles.email, { color: colors.primary }]}>
        {user?.email ?? "your email"}
      </Text>
      <Text style={[styles.hint, { color: colors.textTertiary }]}>
        Click the link in the email to verify your account, then tap the button below.
      </Text>

      <TouchableOpacity
        onPress={handleContinue}
        disabled={checking}
        activeOpacity={0.85}
        style={{ width: "100%", marginTop: 40 }}
      >
        <LinearGradient
          colors={[colors.primary, "#4DA3FF"]}
          style={styles.btn}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.btnText}>
            {checking ? "Checking..." : "I've verified my email"}
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity style={styles.signoutBtn} onPress={handleSignOut}>
        <Text style={[styles.signoutText, { color: colors.textTertiary }]}>
          Use a different account
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 32,
    alignItems: "center",
  },
  iconWrap: {
    width: 100,
    height: 100,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  email: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    marginTop: 4,
    marginBottom: 16,
    textAlign: "center",
  },
  hint: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 21,
  },
  btn: {
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  signoutBtn: {
    marginTop: 20,
    paddingVertical: 8,
  },
  signoutText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
});
