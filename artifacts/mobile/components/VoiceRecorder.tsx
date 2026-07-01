import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface VoiceRecorderProps {
  onSend: (duration: number) => void;
  onCancel: () => void;
}

export default function VoiceRecorder({ onSend, onCancel }: VoiceRecorderProps) {
  const colors = useColors();
  const [duration, setDuration] = useState(0);
  const [recording, setRecording] = useState(false);
  const animValue = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const waveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setRecording(true);
    intervalRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(waveAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ])
    ).start();
    return () => { clearInterval(intervalRef.current); };
  }, []);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleSend = () => {
    setRecording(false);
    clearInterval(intervalRef.current);
    onSend(duration);
  };

  const handleCancel = () => {
    setRecording(false);
    clearInterval(intervalRef.current);
    onCancel();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.inputBackground }]}>
      <Pressable onPress={handleCancel} hitSlop={8}>
        <Feather name="trash-2" size={20} color={colors.destructive} />
      </Pressable>

      <View style={styles.waveContainer}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.waveBar,
              {
                backgroundColor: colors.primary,
                transform: [{ scaleY: waveAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1 + Math.random() * 0.5] }) }],
              },
            ]}
          />
        ))}
      </View>

      <Text style={[styles.timer, { color: colors.text }]}>{formatTime(duration)}</Text>

      <Pressable style={[styles.sendBtn, { backgroundColor: colors.primary }]} onPress={handleSend}>
        <Feather name="send" size={16} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 10, borderRadius: 24, marginHorizontal: 8, marginBottom: 4, gap: 12 },
  waveContainer: { flex: 1, flexDirection: "row", alignItems: "center", gap: 3, height: 30 },
  waveBar: { width: 4, borderRadius: 2, height: 24 },
  timer: { fontSize: 14, fontFamily: "Inter_500Medium", minWidth: 36, textAlign: "center" },
  sendBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
});
