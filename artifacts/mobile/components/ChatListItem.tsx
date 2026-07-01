import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Avatar from "@/components/Avatar";
import { useColors } from "@/hooks/useColors";

interface ChatListItemProps {
  name: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  online: boolean;
  isGroup: boolean;
  pinned?: boolean;
  onPress: () => void;
}

export default function ChatListItem({
  name,
  lastMessage,
  lastTime,
  unread,
  online,
  onPress,
  pinned,
}: ChatListItemProps) {
  const colors = useColors();

  return (
    <TouchableOpacity
      style={[styles.container, { borderBottomColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Avatar name={name} size={52} online={online} />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.nameRow}>
            {pinned && (
              <View style={[styles.pinDot, { backgroundColor: colors.primary }]} />
            )}
            <Text
              style={[styles.name, { color: colors.text }]}
              numberOfLines={1}
            >
              {name}
            </Text>
          </View>
          <Text style={[styles.time, { color: unread > 0 ? colors.primary : colors.textTertiary }]}>
            {lastTime}
          </Text>
        </View>
        <View style={styles.bottomRow}>
          <Text
            style={[
              styles.message,
              {
                color: unread > 0 ? colors.textSecondary : colors.textTertiary,
                fontFamily: unread > 0 ? "Inter_500Medium" : "Inter_400Regular",
              },
            ]}
            numberOfLines={1}
          >
            {lastMessage}
          </Text>
          {unread > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text style={styles.badgeText}>{unread > 99 ? "99+" : unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  pinDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  name: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
  },
  time: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  message: {
    fontSize: 13,
    flex: 1,
    marginRight: 8,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
});
