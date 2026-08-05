import { createContext, useState } from "react";
import io from "socket.io-client";

const backend = import.meta.env.BACKEND_URL || "http://localhost:3000";
const socket = io(backend); 

export const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const [input, setInput] = useState("");
  const [chatGroup, setChatGroup] = useState(null);
  return (
    <ChatContext.Provider
      value={{ input, setInput,chatGroup, setChatGroup, socket }}
    >
      {children}
    </ChatContext.Provider>
  );
};