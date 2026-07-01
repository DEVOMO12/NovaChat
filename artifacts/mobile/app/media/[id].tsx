import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { api } from "@/lib/api";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function MediaViewerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [media, setMedia] = useState<any>(null);
  const [scaled, setScaled] = useState(false);

  useEffect(() => {
    api.get<any>(`/attachments/${id}`).then(setMedia).catch(() => router.back());
  }, [id]);

  return (
    <View style={[styles.root, { backgroundColor: "#000" }]}>
      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={() => router.back()} hitSlop={16}>
          <Feather name="x" size={24} color="#fff" />
        </Pressable>
        <View style={styles.topActions}>
          <Pressable hitSlop={16}><Feather name="share-2" size={22} color="#fff" /></Pressable>
          <Pressable hitSlop={16}><Feather name="more-horizontal" size={22} color="#fff" /></Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        maximumZoomScale={3}
        minimumZoomScale={1}
        bouncesZoom
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <Pressable onPress={() => setScaled(!scaled)}>
          <View style={[styles.mediaPlaceholder, scaled && { transform: [{ scale: 2 }] }]}>
            <Feather name="image" size={80} color="rgba(255,255,255,0.2)" />
            {media && (
              <Text style={styles.fileName}>{media.fileName}</Text>
            )}
          </View>
        </Pressable>
      </ScrollView>

      {media && (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.mediaInfo}>
            <Text style={styles.mediaTitle}>{media.fileName || "Media"}</Text>
            <Text style={styles.mediaMeta}>
              {media.mimeType} {media.fileSize ? `· ${(media.fileSize / 1024).toFixed(0)} KB` : ""}
            </Text>
          </View>
          <Pressable style={styles.downloadBtn}>
            <Feather name="download" size={20} color="#fff" />
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16 },
  topActions: { flexDirection: "row", gap: 16 },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: "center", alignItems: "center" },
  mediaPlaceholder: { width: SCREEN_WIDTH * 0.85, height: SCREEN_HEIGHT * 0.6, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 12, alignItems: "center", justifyContent: "center" },
  fileName: { color: "rgba(255,255,255,0.5)", fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 12 },
  bottomBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, gap: 12 },
  mediaInfo: { flex: 1 },
  mediaTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#fff" },
  mediaMeta: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.5)", marginTop: 2 },
  downloadBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center" },
});
