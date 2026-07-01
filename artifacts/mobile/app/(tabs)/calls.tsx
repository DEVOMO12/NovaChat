import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, Platform, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CallItem from "@/components/CallItem";
import { useColors } from "@/hooks/useColors";
import { api } from "@/lib/api";

const TABS = ["All", "Missed"] as const;

export default function CallsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<"All" | "Missed">("All");
  const [calls, setCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ calls: any[] }>("/calls").then(d => { setCalls(d.calls || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const displayed = tab === "Missed" ? calls.filter((c) => c.status === "missed") : calls;
  const headerPaddingTop = insets.top + (Platform.OS === "web" ? 67 : 0);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <LinearGradient colors={[colors.primary, "#4DA3FF"]} style={[styles.header, { paddingTop: headerPaddingTop + 16 }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Calls</Text>
          <TouchableOpacity style={styles.headerBtn}><Feather name="phone-call" size={20} color="#fff" /></TouchableOpacity>
        </View>
        <View style={[styles.tabRow, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
          {TABS.map((t) => (
            <TouchableOpacity key={t} style={[styles.tabBtn, tab === t && { backgroundColor: "#fff" }]} onPress={() => setTab(t)}>
              <Text style={[styles.tabText, { color: tab === t ? colors.primary : "#fff" }]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <FlatList
          data={displayed}
          keyExtractor={(c) => c.id.toString()}
          renderItem={({ item }) => <CallItem call={item} onPress={() => router.push(`/call/${item.callerId || item.receiverId}`)} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 80 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="phone-off" size={40} color={colors.textTertiary} />
              <Text style={[styles.emptyText, { color: colors.textTertiary }]}>No calls</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity style={[styles.fab, { bottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 16 }]} activeOpacity={0.85} onPress={() => router.push("/(tabs)/contacts")}>
        <LinearGradient colors={[colors.primary, "#4DA3FF"]} style={styles.fabGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Feather name="phone" size={22} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  headerTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff" },
  headerBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  tabRow: { flexDirection: "row", borderRadius: 10, padding: 3 },
  tabBtn: { flex: 1, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  tabText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { paddingTop: 80, alignItems: "center", gap: 12 },
  emptyText: { fontSize: 15, fontFamily: "Inter_400Regular" },
  fab: { position: "absolute", right: 20 },
  fabGradient: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", shadowColor: "#7B68EE", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
});
