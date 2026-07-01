import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, Platform, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Avatar from "@/components/Avatar";
import { useColors } from "@/hooks/useColors";
import { api } from "@/lib/api";

export default function StoriesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const headerPaddingTop = insets.top + (Platform.OS === "web" ? 67 : 0);

  useEffect(() => {
    api.get<{ stories: any[] }>("/stories").then(d => { setStories(d.stories || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const recentStories = stories.filter((s) => !s.viewed);
  const viewedStories = stories.filter((s) => s.viewed);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <LinearGradient colors={[colors.primary, "#4DA3FF"]} style={[styles.header, { paddingTop: headerPaddingTop + 16 }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Stories</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerBtn}><Feather name="camera" size={20} color="#fff" /></TouchableOpacity>
            <TouchableOpacity style={styles.headerBtn}><Feather name="edit-3" size={20} color="#fff" /></TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <FlatList
          data={[]}
          keyExtractor={() => "key"}
          renderItem={() => null}
          ListHeaderComponent={
            <>
              <View style={[styles.myStoryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.myStoryRing, { borderColor: colors.primary }]}>
                  <Avatar name="You" size={52} showOnlineIndicator={false} />
                  <View style={[styles.addIcon, { backgroundColor: colors.primary }]}>
                    <Feather name="plus" size={12} color="#fff" />
                  </View>
                </View>
                <View style={styles.myStoryInfo}>
                  <Text style={[styles.myStoryTitle, { color: colors.text }]}>My Story</Text>
                  <Text style={[styles.myStorySubtitle, { color: colors.textTertiary }]}>Tap to add a story</Text>
                </View>
                <TouchableOpacity><Feather name="more-vertical" size={18} color={colors.textTertiary} /></TouchableOpacity>
              </View>

              {recentStories.length > 0 && <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Recent Updates</Text>}
              {recentStories.map((story) => <StoryItem key={story.id} story={story} colors={colors} />)}
              {viewedStories.length > 0 && <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Viewed</Text>}
              {viewedStories.map((story) => <StoryItem key={story.id} story={story} colors={colors} viewed />)}
            </>
          }
          contentContainerStyle={{ paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 80 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

function StoryItem({ story, colors, viewed = false }: { story: any; colors: any; viewed?: boolean }) {
  return (
    <TouchableOpacity style={[styles.storyRow, { borderBottomColor: colors.border }]} activeOpacity={0.7} onPress={() => router.push(`/story/${story.id}`)}>
      <View style={[styles.storyRing, { borderColor: viewed ? colors.border : colors.primary }]}>
        <Avatar name={story.user?.displayName || "User"} size={52} showOnlineIndicator={false} />
      </View>
      <View style={styles.storyInfo}>
        <Text style={[styles.storyName, { color: colors.text }]}>{story.user?.displayName || "User"}</Text>
        <Text style={[styles.storyTime, { color: colors.textTertiary }]}>{new Date(story.createdAt).toLocaleString()}</Text>
      </View>
      <TouchableOpacity><Feather name="more-vertical" size={18} color={colors.textTertiary} /></TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff" },
  headerActions: { flexDirection: "row", gap: 4 },
  headerBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  myStoryCard: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, marginHorizontal: 12, marginTop: 12, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, gap: 12 },
  myStoryRing: { width: 60, height: 60, borderRadius: 30, borderWidth: 2.5, alignItems: "center", justifyContent: "center" },
  addIcon: { position: "absolute", bottom: -2, right: -2, width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  myStoryInfo: { flex: 1 },
  myStoryTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  myStorySubtitle: { fontSize: 13, fontFamily: "Inter_400Regular" },
  sectionLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", letterSpacing: 0.5, textTransform: "uppercase", paddingHorizontal: 16, paddingTop: 20, paddingBottom: 6 },
  storyRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, gap: 12 },
  storyRing: { width: 60, height: 60, borderRadius: 30, borderWidth: 2.5, alignItems: "center", justifyContent: "center" },
  storyInfo: { flex: 1 },
  storyName: { fontSize: 15, fontFamily: "Inter_600SemiBold", marginBottom: 3 },
  storyTime: { fontSize: 12, fontFamily: "Inter_400Regular" },
});
