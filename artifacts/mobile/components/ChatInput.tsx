import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { Platform, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import VoiceRecorder from "./VoiceRecorder";

interface ChatInputProps {
  onSend: (text: string) => void;
  onSendVoice?: (duration: number) => void;
}

export default function ChatInput({ onSend, onSendVoice }: ChatInputProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [text, setText] = useState("");
  const [showRecorder, setShowRecorder] = useState(false);

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSend(trimmed);
    setText("");
  }

  const canSend = text.trim().length > 0;

  if (showRecorder) {
    return (
      <VoiceRecorder
        onSend={(duration) => {
          setShowRecorder(false);
          onSendVoice?.(duration);
        }}
        onCancel={() => setShowRecorder(false)}
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.header, borderTopColor: colors.border, paddingBottom: Platform.OS === "web" ? 34 : insets.bottom > 0 ? insets.bottom : 8 }]}>
      <View style={[styles.inputRow, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
          <Feather name="paperclip" size={20} color={colors.textTertiary} />
        </TouchableOpacity>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Message"
          placeholderTextColor={colors.textTertiary}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={2000}
          returnKeyType="default"
        />
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
          <Feather name="smile" size={20} color={colors.textTertiary} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={[styles.sendBtn, { backgroundColor: canSend ? colors.primary : colors.surfaceElevated ?? colors.muted }]}
        onPress={canSend ? handleSend : () => setShowRecorder(true)}
        activeOpacity={0.8}
        disabled={false}
      >
        <Feather name={canSend ? "send" : "mic"} size={18} color={canSend ? "#fff" : colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "flex-end", paddingHorizontal: 12, paddingTop: 8, borderTopWidth: StyleSheet.hairlineWidth, gap: 8 },
  inputRow: { flex: 1, flexDirection: "row", alignItems: "center", borderRadius: 24, borderWidth: StyleSheet.hairlineWidth, minHeight: 44, paddingHorizontal: 4 },
  iconBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular", maxHeight: 120, paddingVertical: 8 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
});
