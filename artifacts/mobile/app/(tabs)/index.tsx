import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { FlatList, Platform, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Avatar from "@/components/Avatar";
import ChatListItem from "@/components/ChatListItem";
import SearchBar from "@/components/SearchBar";
import StoryCircle from "@/components/StoryCircle";
import { useChat } from "@/context/ChatContext";
import { useColors } from "@/hooks/useColors";
import { api } from "@/lib/api";

export default function ChatsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { chats, loading, loadChats } = useChat();
  const [search, setSearch] = useState("");
  const [stories, setStories] = useState<any[]>([]);

  useEffect(() => {
    loadChats();
    api.get<{ stories: any[] }>("/stories").then(d => setStories(d.stories || [])).catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return chats;
    return chats.filter((c) => c.name?.toLowerCase().includes(search.toLowerCase()));
  }, [chats, search]);

  const topStories = stories.slice(0, 5);
  const headerPaddingTop = insets.top + (Platform.OS === "web" ? 67 : 0);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <LinearGradient colors={[colors.primary, "#4DA3FF"]} style={[styles.header, { paddingTop: headerPaddingTop + 16 }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>NovaChat</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerBtn}>
              <Feather name="camera" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerBtn}>
              <Feather name="more-vertical" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.searchWrapper}>
          <SearchBar value={search} onChangeText={setSearch} placeholder="Search chats" />
        </View>
      </LinearGradient>

      {loading && chats.length === 0 ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id.toString()}
          refreshing={loading}
          onRefresh={loadChats}
          ListHeaderComponent={
            topStories.length > 0 ? (
              <View style={[styles.stories, { borderBottomColor: colors.border }]}>
                <FlatList
                  data={[{ id: 0, name: "You" }, ...topStories]}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(s) => s.id.toString()}
                  contentContainerStyle={styles.storiesContent}
                  renderItem={({ item }) => (
                    <StoryCircle name={item.name} viewed={false} isMe={item.id === 0} onPress={() => router.push(`/story/${item.id}`)} />
                  )}
                />
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <ChatListItem
              name={item.name || "Chat"}
              lastMessage={item.lastMessage || ""}
              lastTime={item.lastTime ? new Date(item.lastTime).toLocaleString() : ""}
              unread={item.unread || 0}
              online={item.online || false}
              isGroup={item.isGroup}
              pinned={item.pinned}
              onPress={() => router.push(`/chat/${item.id}`)}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 80 }}
        />
      )}

      <TouchableOpacity style={[styles.fab, { bottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 16 }]} activeOpacity={0.85} onPress={() => {}}>
        <LinearGradient colors={[colors.primary, "#4DA3FF"]} style={styles.fabGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Feather name="edit-2" size={20} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  headerTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff" },
  headerActions: { flexDirection: "row", gap: 4 },
  headerBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  searchWrapper: { marginTop: 4 },
  stories: { borderBottomWidth: StyleSheet.hairlineWidth, paddingVertical: 12 },
  storiesContent: { paddingHorizontal: 12, gap: 4 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  fab: { position: "absolute", right: 20 },
  fabGradient: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", shadowColor: "#7B68EE", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
});
