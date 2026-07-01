import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface MessageBubbleProps {
  message: {
    id: number;
    text: string;
    type: string;
    createdAt: string;
    senderId: number;
    statuses?: any[];
    attachments?: { id: number; type: string; url: string; thumbnailUrl?: string }[];
  };
  isMe: boolean;
  onMediaPress?: (mediaId: number) => void;
}

export default function MessageBubble({ message, isMe, onMediaPress }: MessageBubbleProps) {
  const colors = useColors();
  const lastStatus = message.statuses?.[0]?.status || "sent";
  const time = new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const hasAttachments = message.attachments && message.attachments.length > 0;

  return (
    <View style={[styles.row, isMe ? styles.rowMe : styles.rowThem]}>
      <View style={[styles.bubble, isMe ? [styles.bubbleMe, { backgroundColor: colors.messageSent }] : [styles.bubbleThem, { backgroundColor: colors.messageReceived }]]}>
        {message.text ? <Text style={[styles.text, { color: isMe ? colors.messageSentText : colors.messageReceivedText }]}>{message.text}</Text> : null}

        {hasAttachments ? message.attachments!.map((att) => (
          <Pressable key={att.id} style={[styles.attachment, { backgroundColor: "rgba(255,255,255,0.1)" }]} onPress={() => onMediaPress?.(att.id)}>
            <Feather name={att.type === "image" ? "image" : att.type === "video" ? "video" : "file"} size={20} color="rgba(255,255,255,0.6)" />
            <Text style={styles.attachmentText}>{att.type}</Text>
          </Pressable>
        )) : null}

        <View style={styles.footer}>
          <Text style={[styles.timestamp, { color: isMe ? "rgba(255,255,255,0.6)" : colors.textTertiary }]}>{time}</Text>
          {isMe && <StatusIcon status={lastStatus} colors={colors} />}
        </View>
      </View>
    </View>
  );
}

function StatusIcon({ status, colors }: { status: string; colors: any }) {
  if (status === "sent") return <Feather name="check" size={12} color="rgba(255,255,255,0.6)" style={{ marginLeft: 3 }} />;
  if (status === "delivered") return (<View style={{ marginLeft: 3, flexDirection: "row" }}><Feather name="check" size={12} color="rgba(255,255,255,0.6)" /><Feather name="check" size={12} color="rgba(255,255,255,0.6)" style={{ marginLeft: -6 }} /></View>);
  if (status === "read") return (<View style={{ marginLeft: 3, flexDirection: "row" }}><Feather name="check" size={12} color={colors.read} /><Feather name="check" size={12} color={colors.read} style={{ marginLeft: -6 }} /></View>);
  return null;
}

const styles = StyleSheet.create({
  row: { marginVertical: 2, paddingHorizontal: 12 },
  rowMe: { alignItems: "flex-end" },
  rowThem: { alignItems: "flex-start" },
  bubble: { maxWidth: "80%", paddingHorizontal: 12, paddingTop: 8, paddingBottom: 6, borderRadius: 18 },
  bubbleMe: { borderBottomRightRadius: 4 },
  bubbleThem: { borderBottomLeftRadius: 4 },
  text: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 21 },
  attachment: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, marginTop: 6 },
  attachmentText: { fontSize: 13, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.7)" },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", marginTop: 2 },
  timestamp: { fontSize: 10, fontFamily: "Inter_400Regular" },
});
