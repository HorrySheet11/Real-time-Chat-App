import { createContext, useState } from "react";
import {socket} from "../services/socket";

export const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const [input, setInput] = useState("");
  const [chatGroup, setChatGroup] = useState(null);
  return (
    <ChatContext.Provider
      value={{ input, setInput, chatGroup, setChatGroup, socket }}
    >
      {children}
    </ChatContext.Provider>
  );
};