import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Avatar from "@/components/Avatar";
import { useColors } from "@/hooks/useColors";
import { api } from "@/lib/api";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function StoryViewerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [story, setStory] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    api.get<any>(`/stories/${id}`).then(setStory).catch(() => router.back());
  }, [id]);

  useEffect(() => {
    if (!story?.stories?.length) return;
    setProgress(0);
    const duration = 5000;
    const interval = 50;
    const step = interval / duration;
    progressRef.current = setInterval(() => {
      setProgress((p) => {
        const next = p + step;
        if (next >= 1) {
          clearInterval(progressRef.current);
          if (currentIndex < story.stories.length - 1) {
            setCurrentIndex((i) => i + 1);
          } else {
            router.back();
          }
          return 0;
        }
        return next;
      });
    }, interval);
    return () => clearInterval(progressRef.current);
  }, [story, currentIndex]);

  const handleTap = (evt: any) => {
    const x = evt.nativeEvent.locationX;
    if (x < SCREEN_WIDTH / 3) {
      if (currentIndex > 0) setCurrentIndex((i) => i - 1);
      else router.back();
    } else if (x > (SCREEN_WIDTH * 2) / 3) {
      if (currentIndex < (story?.stories?.length || 1) - 1) setCurrentIndex((i) => i + 1);
      else router.back();
    }
  };

  if (!story) return <View style={[styles.root, { backgroundColor: "#000" }]} />;

  const current = story.stories[currentIndex];

  return (
    <View style={styles.root}>
      <Pressable style={StyleSheet.absoluteFill} onPress={handleTap}>
        <View style={[StyleSheet.absoluteFill, { backgroundColor: "#000" }]}>
          <View style={styles.progressRow}>
            {story.stories.map((_: any, i: number) => (
              <View key={i} style={[styles.progressBar, { backgroundColor: "rgba(255,255,255,0.3)" }]}>
                <View style={[styles.progressFill, { width: i < currentIndex ? "100%" : i === currentIndex ? `${progress * 100}%` : "0%", backgroundColor: "#fff" }]} />
              </View>
            ))}
          </View>

          <View style={[styles.topOverlay, { paddingTop: insets.top + 40 }]}>
            <Avatar name={story.user?.displayName || "User"} size={36} showOnlineIndicator={false} />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{story.user?.displayName || "User"}</Text>
              <Text style={styles.time}>{new Date(current?.createdAt).toLocaleString()}</Text>
            </View>
            <Pressable onPress={() => router.back()} hitSlop={16}>
              <Feather name="x" size={24} color="#fff" />
            </Pressable>
          </View>

          <View style={styles.contentContainer}>
            {current?.type === "image" || current?.mediaUrl ? (
              <View style={styles.mediaPlaceholder}>
                <Feather name="image" size={64} color="rgba(255,255,255,0.3)" />
              </View>
            ) : (
              <Text style={styles.storyText}>{current?.content || ""}</Text>
            )}
          </View>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  progressRow: { flexDirection: "row", gap: 4, paddingHorizontal: 12, paddingTop: 60 },
  progressBar: { flex: 1, height: 2, borderRadius: 1, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 1 },
  topOverlay: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, gap: 10 },
  userInfo: { flex: 1 },
  userName: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#fff" },
  time: { fontSize: 11, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.6)" },
  contentContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  mediaPlaceholder: { width: 280, height: 400, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 16, alignItems: "center", justifyContent: "center" },
  storyText: { fontSize: 22, fontFamily: "Inter_500Medium", color: "#fff", textAlign: "center", lineHeight: 32 },
});
