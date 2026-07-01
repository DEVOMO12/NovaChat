import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Avatar from "@/components/Avatar";
import { SocketContext } from "@/context/SocketContext";
import { useColors } from "@/hooks/useColors";
import { api } from "@/lib/api";

export default function CallScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<any>(null);
  const [callStatus, setCallStatus] = useState("calling");
  const [timer, setTimer] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    api.get<any>(`/users/${id}`).then(setUser).catch(() => router.back());
    const t = setTimeout(() => {
      setCallStatus("connected");
      timerRef.current = setInterval(() => setTimer((s) => s + 1), 1000);
    }, 2000);
    return () => { clearTimeout(t); clearInterval(timerRef.current); };
  }, [id]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const endCall = () => { clearInterval(timerRef.current); router.back(); };

  return (
    <LinearGradient colors={["#0D0D1A", "#1A1A2E", "#0D0D1A"]} style={styles.root} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}>
      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={endCall} hitSlop={16}>
          <Feather name="chevron-down" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.statusText}>{callStatus === "connected" ? formatTime(timer) : callStatus === "calling" ? "Calling..." : "Connecting..."}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.centerContent}>
        <Avatar name={user?.displayName || "User"} size={100} showOnlineIndicator={false} />
        <Text style={styles.callerName}>{user?.displayName || "User"}</Text>
        <Text style={styles.callerStatus}>{callStatus === "calling" ? "Ringing..." : callStatus}</Text>
      </View>

      <View style={[styles.controls, { paddingBottom: insets.bottom + 40 }]}>
        <View style={styles.controlRow}>
          <Pressable style={[styles.controlBtn, muted && styles.controlBtnActive]} onPress={() => setMuted(!muted)}>
            <Feather name={muted ? "mic-off" : "mic"} size={22} color="#fff" />
            <Text style={styles.controlLabel}>Mute</Text>
          </Pressable>
          <Pressable style={[styles.controlBtn, speaker && styles.controlBtnActive]} onPress={() => setSpeaker(!speaker)}>
            <Feather name={speaker ? "volume-2" : "volume-x"} size={22} color="#fff" />
            <Text style={styles.controlLabel}>Speaker</Text>
          </Pressable>
          <Pressable style={styles.controlBtn}>
            <Feather name="video-off" size={22} color="#fff" />
            <Text style={styles.controlLabel}>Video</Text>
          </Pressable>
        </View>
        <Pressable style={styles.endCallBtn} onPress={endCall}>
          <Feather name="phone" size={28} color="#fff" />
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16 },
  statusText: { fontSize: 14, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.7)" },
  centerContent: { flex: 1, justifyContent: "center", alignItems: "center", gap: 16 },
  callerName: { fontSize: 24, fontFamily: "Inter_700Bold", color: "#fff" },
  callerStatus: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.6)" },
  controls: { alignItems: "center", gap: 32 },
  controlRow: { flexDirection: "row", gap: 40 },
  controlBtn: { alignItems: "center", gap: 6, opacity: 0.8 },
  controlBtnActive: { opacity: 1 },
  controlLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.6)" },
  endCallBtn: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#FF3B30", alignItems: "center", justifyContent: "center", transform: [{ rotate: "135deg" }] },
});
