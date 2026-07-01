import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");

const SLIDES = [
  {
    id: "1",
    icon: "message-circle" as const,
    title: "Connect Instantly",
    subtitle:
      "Send messages, photos, videos and voice notes to anyone, anywhere in the world.",
    color1: "#7B68EE",
    color2: "#4DA3FF",
  },
  {
    id: "2",
    icon: "users" as const,
    title: "Groups & Communities",
    subtitle:
      "Create group chats, build communities and stay connected with the people who matter.",
    color1: "#4DA3FF",
    color2: "#25D366",
  },
  {
    id: "3",
    icon: "shield" as const,
    title: "Private & Secure",
    subtitle:
      "Your messages are private. NovaChat is built with end-to-end encryption from the ground up.",
    color1: "#25D366",
    color2: "#7B68EE",
  },
];

export default function Onboarding() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { completeOnboarding } = useAuth();
  const [current, setCurrent] = useState(0);
  const listRef = useRef<FlatList>(null);

  async function handleNext() {
    if (current < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: current + 1, animated: true });
      setCurrent(current + 1);
    } else {
      await completeOnboarding();
      router.replace("/(auth)/login");
    }
  }

  async function handleSkip() {
    await completeOnboarding();
    router.replace("/(auth)/login");
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <FlatList
        ref={listRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ width }}>
            <LinearGradient
              colors={[item.color1, item.color2]}
              style={[
                styles.iconContainer,
                { marginTop: insets.top + (Platform.OS === "web" ? 67 : 60) },
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Feather name={item.icon} size={52} color="#fff" />
            </LinearGradient>
            <Text style={[styles.title, { color: colors.text }]}>
              {item.title}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {item.subtitle}
            </Text>
          </View>
        )}
      />

      <View
        style={[
          styles.footer,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 24 },
        ]}
      >
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    i === current ? colors.primary : colors.border,
                  width: i === current ? 20 : 8,
                },
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: colors.primary }]}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={styles.nextText}>
            {current === SLIDES.length - 1 ? "Get Started" : "Continue"}
          </Text>
          <Feather name="arrow-right" size={18} color="#fff" />
        </TouchableOpacity>

        {current < SLIDES.length - 1 && (
          <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
            <Text style={[styles.skipText, { color: colors.textTertiary }]}>
              Skip
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.devRow}>
          <Image
            source={require("../assets/images/diablozo-logo.webp")}
            style={styles.devLogo}
            resizeMode="contain"
          />
          <Text style={[styles.devText, { color: colors.textTertiary }]}>
            Developed by Diablozo Tech
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 48,
  },
  title: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    paddingHorizontal: 32,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 24,
    alignItems: "center",
    gap: 16,
  },
  dots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  nextBtn: {
    width: "100%",
    height: 52,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  nextText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  skipBtn: {
    paddingVertical: 4,
  },
  skipText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  devRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  devLogo: {
    width: 24,
    height: 24,
    borderRadius: 4,
    opacity: 0.5,
  },
  devText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
});
