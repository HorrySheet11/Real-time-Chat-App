import { createContext, useState } from "react";
import {socket} from "../services/socket";

export const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const [input, setInput] = useState("");
  const [chatGroup, setChatGroup] = useState('');
  const [chatGroups, setChatGroups] = useState([]);
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  return (
    <ChatContext.Provider
      value={{ input, setInput, chatGroup, setChatGroup, chatGroups, setChatGroups, socket, user, setUser,authMode, setAuthMode }}
    >
      {children}
    </ChatContext.Provider>
  );
};