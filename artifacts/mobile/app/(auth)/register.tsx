import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
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

export default function Register() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { registerWithEmail } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await registerWithEmail(name.trim(), email.trim(), password);
      router.replace("/(auth)/verify");
    } catch (e: any) {
      const msg =
        e.code === "auth/email-already-in-use"
          ? "An account with this email already exists"
          : e.code === "auth/invalid-email"
          ? "Please enter a valid email address"
          : e.code === "auth/weak-password"
          ? "Password should be at least 6 characters"
          : e.message ?? "Registration failed";
      Alert.alert("Sign Up Failed", msg);
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
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 48),
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 24),
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
        <Text style={[styles.subtitle, { color: colors.textTertiary }]}>
          Join NovaChat and start connecting
        </Text>

        <View style={styles.form}>
          <View
            style={[
              styles.field,
              { backgroundColor: colors.inputBackground, borderColor: colors.border },
            ]}
          >
            <Feather name="user" size={16} color={colors.textTertiary} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Full name"
              placeholderTextColor={colors.textTertiary}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

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
            />
          </View>

          <View
            style={[
              styles.field,
              { backgroundColor: colors.inputBackground, borderColor: colors.border },
            ]}
          >
            <Feather name="lock" size={16} color={colors.textTertiary} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Password (min 6 characters)"
              placeholderTextColor={colors.textTertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)}>
              <Feather
                name={showPass ? "eye-off" : "eye"}
                size={16}
                color={colors.textTertiary}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleRegister}
            activeOpacity={0.85}
            disabled={loading}
            style={{ marginTop: 8 }}
          >
            <LinearGradient
              colors={[colors.primary, "#4DA3FF"]}
              style={styles.btn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.btnText}>
                {loading ? "Creating account..." : "Create Account"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={[styles.terms, { color: colors.textTertiary }]}>
            By creating an account you agree to our Terms of Service and Privacy Policy.
          </Text>
        </View>

        <View style={styles.signinRow}>
          <Text style={[styles.signinText, { color: colors.textSecondary }]}>
            Already have an account?{" "}
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.signinLink, { color: colors.primary }]}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "flex-start",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    marginBottom: 32,
  },
  form: {
    gap: 12,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    height: 52,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  btn: {
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  terms: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 16,
  },
  signinRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 32,
  },
  signinText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  signinLink: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
});
