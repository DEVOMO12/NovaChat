import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Avatar from "@/components/Avatar";
import { useColors } from "@/hooks/useColors";

interface CallItemProps {
  call: any;
  onPress: () => void;
}

export default function CallItem({ call, onPress }: CallItemProps) {
  const colors = useColors();
  const otherUser = call.otherUser;
  const name = otherUser?.displayName || "Unknown";
  const directionColor = call.status === "missed" ? colors.destructive : colors.secondary;
  const directionIcon = call.status === "missed" ? "phone-missed" : call.direction === "incoming" ? "phone-incoming" : "phone-outgoing";
  const typeIcon = call.type === "video" ? "video" : "phone";

  return (
    <TouchableOpacity style={[styles.container, { borderBottomColor: colors.border }]} onPress={onPress} activeOpacity={0.7}>
      <Avatar name={name} size={48} showOnlineIndicator={false} />
      <View style={styles.info}>
        <Text style={[styles.name, { color: call.status === "missed" ? colors.destructive : colors.text }]}>{name}</Text>
        <View style={styles.subRow}>
          <Feather name={directionIcon as any} size={12} color={directionColor} />
          <Text style={[styles.timestamp, { color: colors.textTertiary }]}>  {new Date(call.createdAt).toLocaleString()}</Text>
        </View>
      </View>
      <View style={styles.right}>
        {call.duration ? <Text style={[styles.duration, { color: colors.textTertiary }]}>{call.duration}s</Text> : null}
        <View style={[styles.typeBtn, { backgroundColor: colors.inputBackground }]}>
          <Feather name={typeIcon} size={16} color={colors.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 15, fontFamily: "Inter_600SemiBold", marginBottom: 3 },
  subRow: { flexDirection: "row", alignItems: "center" },
  timestamp: { fontSize: 12, fontFamily: "Inter_400Regular" },
  right: { alignItems: "flex-end", gap: 6 },
  duration: { fontSize: 12, fontFamily: "Inter_400Regular" },
  typeBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
});
