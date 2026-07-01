import React, { createContext, useContext, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { connectSocket, disconnectSocket, getSocket } from "@/lib/socket";

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextType>({ socket: null, connected: false });

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (user) {
      connectSocket().then((s) => {
        if (s) {
          setConnected(s.connected);
          s.on("connect", () => setConnected(true));
          s.on("disconnect", () => setConnected(false));
        }
      });
    } else {
      disconnectSocket();
      setConnected(false);
    }
    return () => { disconnectSocket(); };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket: getSocket(), connected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
