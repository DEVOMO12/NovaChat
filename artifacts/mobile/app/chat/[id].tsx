import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { FlatList, Platform, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Avatar from "@/components/Avatar";
import ChatInput from "@/components/ChatInput";
import MessageBubble from "@/components/MessageBubble";
import { useChat } from "@/context/ChatContext";
import { useColors } from "@/hooks/useColors";

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { chats, messages, sendMessage, markAsRead, loadMessages } = useChat();
  const listRef = useRef<FlatList>(null);
  const [loading, setLoading] = useState(true);

  const chatId = parseInt(id || "0");
  const chat = chats.find((c) => c.id === chatId);
  const chatMessages = messages[chatId] ?? [];
  const currentUserId = 0;

  useEffect(() => {
    if (id) {
      markAsRead(chatId);
      loadMessages(chatId).then(() => setLoading(false));
    }
  }, [id]);

  const handleSend = useCallback((text: string) => {
    if (!id) return;
    sendMessage(chatId, text);
  }, [id, chatId, sendMessage]);

  const headerPaddingTop = insets.top + (Platform.OS === "web" ? 67 : 0);

  if (!chat && !loading) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Chat not found</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={[styles.root, { backgroundColor: colors.background }]} behavior="padding" keyboardVerticalOffset={0}>
      <LinearGradient colors={[colors.primary, "#4DA3FF"]} style={[styles.header, { paddingTop: headerPaddingTop + 12 }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}><Feather name="arrow-left" size={22} color="#fff" /></TouchableOpacity>
        <TouchableOpacity style={styles.headerInfo} activeOpacity={0.8}>
          <Avatar name={chat?.name || "Chat"} size={36} online={chat?.online} />
          <View style={styles.headerText}>
            <Text style={styles.headerName} numberOfLines={1}>{chat?.name || "Chat"}</Text>
            <Text style={styles.headerStatus}>{chat?.online ? "Online" : "Last seen recently"}</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => router.push(`/call/${chat?.members?.[0]?.id || chatId}`)}><Feather name="video" size={20} color="#fff" /></TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={() => router.push(`/call/${chat?.members?.[0]?.id || chatId}`)}><Feather name="phone" size={20} color="#fff" /></TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn}><Feather name="more-vertical" size={20} color="#fff" /></TouchableOpacity>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <FlatList
          ref={listRef}
          data={[...chatMessages].reverse()}
          keyExtractor={(m) => m.id.toString()}
          inverted
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              isMe={item.senderId === currentUserId}
              onMediaPress={(mediaId) => router.push(`/media/${mediaId}`)}
            />
          )}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        />
      )}

      <ChatInput onSend={handleSend} onSendVoice={(duration) => {
        console.log(`Voice message recorded: ${duration}s`);
      }} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingBottom: 12, gap: 4 },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerInfo: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  headerText: { flex: 1 },
  headerName: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#fff" },
  headerStatus: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.75)" },
  headerActions: { flexDirection: "row" },
  headerBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  messageList: { paddingVertical: 12 },
});
