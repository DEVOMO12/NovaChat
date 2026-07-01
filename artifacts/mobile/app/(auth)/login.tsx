import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function Login() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { loginWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    const trimEmail = email.trim();
    const trimPass = password.trim();
    if (!trimEmail || !trimPass) {
      Alert.alert("Error", "Please enter your email and password");
      return;
    }
    setLoading(true);
    try {
      await loginWithEmail(trimEmail, trimPass);
      router.replace("/(tabs)");
    } catch (e: any) {
      const code = e?.code ?? "";
      const msg =
        code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-credential"
          ? "Incorrect email or password. Please try again."
          : code === "auth/invalid-email"
          ? "Please enter a valid email address."
          : code === "auth/too-many-requests"
          ? "Too many attempts. Please wait a moment and try again."
          : code === "auth/user-disabled"
          ? "This account has been disabled."
          : e.message ?? "Sign in failed. Please try again.";
      Alert.alert("Sign In Failed", msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 60),
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 40),
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <LinearGradient
          colors={[colors.primary, "#4DA3FF"]}
          style={styles.logo}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Feather name="message-circle" size={38} color="#fff" />
        </LinearGradient>

        <Text style={[styles.brand, { color: colors.text }]}>NovaChat</Text>
        <Text style={[styles.tagline, { color: colors.textTertiary }]}>
          Sign in to continue
        </Text>

        <View style={styles.form}>
          {/* Email */}
          <View
            style={[
              styles.field,
              { backgroundColor: colors.inputBackground, borderColor: colors.border },
            ]}
          >
            <Feather name="mail" size={16} color={colors.textTertiary} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Email address"
              placeholderTextColor={colors.textTertiary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          {/* Password */}
          <View
            style={[
              styles.field,
              { backgroundColor: colors.inputBackground, borderColor: colors.border },
            ]}
          >
            <Feather name="lock" size={16} color={colors.textTertiary} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Password"
              placeholderTextColor={colors.textTertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)} hitSlop={8}>
              <Feather
                name={showPass ? "eye-off" : "eye"}
                size={16}
                color={colors.textTertiary}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotBtn}>
            <Text style={[styles.forgotText, { color: colors.primary }]}>
              Forgot password?
            </Text>
          </TouchableOpacity>

          {/* Sign In button */}
          <TouchableOpacity
            onPress={handleLogin}
            activeOpacity={0.85}
            disabled={loading}
          >
            <LinearGradient
              colors={loading ? ["#9992d4", "#7bb8d4"] : [colors.primary, "#4DA3FF"]}
              style={styles.loginBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.loginText}>
                {loading ? "Signing in…" : "Sign In"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.signupRow}>
          <Text style={[styles.signupText, { color: colors.textSecondary }]}>
            Don't have an account?{" "}
          </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
            <Text style={[styles.signupLink, { color: colors.primary }]}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.devRow}>
          <Image
            source={require("../../assets/images/diablozo-logo.webp")}
            style={styles.devLogo}
            resizeMode="contain"
          />
          <Text style={[styles.devText, { color: colors.textTertiary }]}>
            Developed by Diablozo Tech
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 28,
    alignItems: "center",
  },
  logo: {
    width: 86,
    height: 86,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  brand: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    marginBottom: 44,
  },
  form: {
    width: "100%",
    gap: 14,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    height: 54,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  forgotBtn: {
    alignSelf: "flex-end",
    paddingVertical: 2,
  },
  forgotText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  loginBtn: {
    height: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  loginText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.2,
  },
  signupRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 36,
  },
  signupText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  signupLink: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  devRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
  },
  devLogo: {
    width: 22,
    height: 22,
    borderRadius: 4,
    opacity: 0.45,
  },
  devText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
});
