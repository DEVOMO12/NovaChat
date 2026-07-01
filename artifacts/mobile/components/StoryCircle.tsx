import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import Avatar from "@/components/Avatar";
import { useColors } from "@/hooks/useColors";

interface StoryCircleProps {
  name: string;
  viewed: boolean;
  isMe?: boolean;
  onPress: () => void;
}

export default function StoryCircle({ name, viewed, isMe, onPress }: StoryCircleProps) {
  const colors = useColors();
  const firstName = name.split(" ")[0];

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View
        style={[
          styles.ring,
          {
            borderColor: viewed ? colors.border : colors.primary,
            backgroundColor: colors.surface,
          },
        ]}
      >
        {isMe ? (
          <View
            style={[
              styles.addBtn,
              {
                backgroundColor: colors.primary,
                width: 52,
                height: 52,
                borderRadius: 26,
              },
            ]}
          >
            <Text style={styles.plus}>+</Text>
          </View>
        ) : (
          <Avatar name={name} size={52} showOnlineIndicator={false} />
        )}
      </View>
      <Text
        style={[styles.name, { color: colors.textSecondary }]}
        numberOfLines={1}
      >
        {isMe ? "My Story" : firstName}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    width: 68,
  },
  ring: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2.5,
    alignItems: "center",
    justifyContent: "center",
    padding: 2,
  },
  addBtn: {
    alignItems: "center",
    justifyContent: "center",
  },
  plus: {
    color: "#fff",
    fontSize: 24,
    fontFamily: "Inter_400Regular",
    lineHeight: 28,
  },
  name: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    marginTop: 5,
    maxWidth: 64,
    textAlign: "center",
  },
});
