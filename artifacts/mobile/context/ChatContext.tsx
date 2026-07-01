import React, { createContext, useContext, useState, useCallback } from "react";
import { api } from "@/lib/api";

interface User {
  id: number;
  username: string;
  displayName: string;
  avatar: string | null;
  bio: string | null;
  phone: string | null;
  email: string;
  online: boolean;
  lastSeen: string;
}

interface Message {
  id: number;
  chatId: number;
  senderId: number;
  text: string;
  type: string;
  createdAt: string;
  sender?: User;
  statuses?: any[];
  reactions?: any[];
  attachments?: any[];
  replyToId?: number | null;
  forwardedFromId?: number | null;
}

interface Chat {
  id: number;
  name: string | null;
  avatar: string | null;
  isGroup: boolean;
  createdAt: string;
  updatedAt: string;
  lastMessage?: string;
  lastTime?: string;
  unread?: number;
  online?: boolean;
  pinned?: boolean;
  muted?: boolean;
  archived?: boolean;
  members?: User[];
}

interface ChatContextType {
  chats: Chat[];
  messages: Record<number, Message[]>;
  loading: boolean;
  loadChats: () => Promise<void>;
  loadMessages: (chatId: number, page?: number) => Promise<void>;
  sendMessage: (chatId: number, text: string) => Promise<void>;
  markAsRead: (chatId: number) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Record<number, Message[]>>({});
  const [loading, setLoading] = useState(false);

  const loadChats = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<{ chats: Chat[] }>("/chats");
      setChats(data.chats || []);
    } catch (e) {
      console.error("Failed to load chats", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMessages = useCallback(async (chatId: number, page = 1) => {
    try {
      const data = await api.get<{ messages: Message[] }>(`/chats/${chatId}/messages?page=${page}&limit=50`);
      setMessages((prev) => ({
        ...prev,
        [chatId]: page === 1 ? (data.messages || []) : [...(prev[chatId] || []), ...(data.messages || [])],
      }));
    } catch (e) {
      console.error("Failed to load messages", e);
    }
  }, []);

  const sendMessage = useCallback(async (chatId: number, text: string) => {
    try {
      const data = await api.post<{ message: Message }>(`/chats/${chatId}/messages`, { text });
      setMessages((prev) => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), data.message],
      }));
      loadChats();
    } catch (e) {
      console.error("Failed to send message", e);
    }
  }, [loadChats]);

  const markAsRead = useCallback(async (chatId: number) => {
    try {
      await api.post(`/chats/${chatId}/read`);
      setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, unread: 0 } : c)));
    } catch (e) {
      console.error("Failed to mark as read", e);
    }
  }, []);

  return (
    <ChatContext.Provider value={{ chats, messages, loading, loadChats, loadMessages, sendMessage, markAsRead }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}
