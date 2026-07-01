import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Avatar from "@/components/Avatar";
import SearchBar from "@/components/SearchBar";
import { useColors } from "@/hooks/useColors";
import { api } from "@/lib/api";

export default function ContactsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const headerPaddingTop = insets.top + (Platform.OS === "web" ? 67 : 0);

  useEffect(() => {
    api.get<{ contacts: any[] }>("/contacts").then(d => { setContacts(d.contacts || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return contacts;
    return contacts.filter((c) => c.displayName?.toLowerCase().includes(search.toLowerCase()));
  }, [contacts, search]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <LinearGradient colors={[colors.primary, "#4DA3FF"]} style={[styles.header, { paddingTop: headerPaddingTop + 16 }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Contacts</Text>
          <TouchableOpacity style={styles.headerBtn}>
            <Feather name="user-plus" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search contacts" />
      </LinearGradient>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(c) => c.id.toString()}
          renderItem={({ item }) => (
            <View style={[styles.contactRow, { borderBottomColor: colors.border }]}>
              <Avatar name={item.displayName || "User"} size={48} online={item.online} />
              <View style={styles.contactInfo}>
                <Text style={[styles.contactName, { color: colors.text }]}>{item.displayName || "User"}</Text>
                <Text style={[styles.contactStatus, { color: colors.textTertiary }]}>{item.online ? "Online" : item.bio || "Offline"}</Text>
              </View>
              <TouchableOpacity style={[styles.messageBtn, { backgroundColor: colors.primary }]} onPress={() => router.push(`/chat/${item.id}`)}>
                <Feather name="message-circle" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 80 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="users" size={40} color={colors.textTertiary} />
              <Text style={[styles.emptyText, { color: colors.textTertiary }]}>No contacts found</Text>
              <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>Add contacts to start chatting</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  headerTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff" },
  headerBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  contactRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, gap: 12 },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 15, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  contactStatus: { fontSize: 13, fontFamily: "Inter_400Regular" },
  messageBtn: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  empty: { paddingTop: 80, alignItems: "center", gap: 8 },
  emptyText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  emptySubtext: { fontSize: 13, fontFamily: "Inter_400Regular" },
});
