import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

interface AvatarProps {
  name: string;
  size?: number;
  online?: boolean;
  showOnlineIndicator?: boolean;
}

function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

const GRADIENT_PAIRS = [
  ["#7B68EE", "#4DA3FF"],
  ["#FF6B6B", "#FF8E53"],
  ["#25D366", "#4DA3FF"],
  ["#F093FB", "#F5576C"],
  ["#4FC3F7", "#7B68EE"],
  ["#43E97B", "#38F9D7"],
  ["#FA709A", "#FEE140"],
];

function getColorForName(name: string): string {
  const index = name.charCodeAt(0) % GRADIENT_PAIRS.length;
  return GRADIENT_PAIRS[index][0];
}

export default function Avatar({
  name,
  size = 48,
  online = false,
  showOnlineIndicator = true,
}: AvatarProps) {
  const colors = useColors();
  const initials = getInitials(name);
  const bgColor = getColorForName(name);
  const fontSize = size * 0.38;
  const indicatorSize = size * 0.28;
  const indicatorBorder = size * 0.07;

  return (
    <View style={{ width: size, height: size }}>
      <View
        style={[
          styles.avatar,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: bgColor,
          },
        ]}
      >
        <Text
          style={[
            styles.initials,
            { fontSize, color: "#FFFFFF", lineHeight: size },
          ]}
        >
          {initials}
        </Text>
      </View>
      {showOnlineIndicator && online && (
        <View
          style={[
            styles.onlineIndicator,
            {
              width: indicatorSize,
              height: indicatorSize,
              borderRadius: indicatorSize / 2,
              borderWidth: indicatorBorder,
              backgroundColor: colors.online,
              borderColor: colors.background,
              bottom: 0,
              right: 0,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  initials: {
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
  },
  onlineIndicator: {
    position: "absolute",
  },
});
