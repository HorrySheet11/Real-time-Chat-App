import { useEffect, useState } from "react";
import ChatBox from "./components/ChatBox";
import ChatGroups from "./components/ChatGroups";
import { socket } from "./services/socket";
import { useContext } from "react";
import { ChatContext } from "./context/ChatContext";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const { setChatGroups } = useContext(ChatContext);

  useEffect(() => {
    // Fetch messages for initial load (will be overridden when collection selected)
    socket.emit("get_messages");
    socket.on("messages", (messages) => {
      console.log(messages);
      setMessages(messages);
    });
    socket.on("new_message", (msg) => {
      console.log("new_message", msg);
      setMessages(prev => [...prev, msg]);
    });
    // Fetch all chat groups/collections on start
    socket.emit("get_collections");
    socket.on("collections", (collections) => {
      console.log("collections received:", collections);
      setChatGroups(collections);
			console.log("chatGroups", chatGroups);
    });
    return () => {
      socket.off("messages");
      socket.off("new_message");
      socket.off("collections");
    };
  }, []);

  const sendMessage = () => {
    console.log("sent message");
    if (input) {
      socket.emit("chat_message", input);
      setInput("");
    }
  };

  return (
    <div className="flex flex-col relative">
      <ChatGroups />
      <ul className="flex flex-col">
        {messages.map((msg) => (
          <li key={msg._id}>
            {msg.sender}: {msg.message}
          </li>
        ))}
      </ul>
      <ChatBox />
    </div>
  );
}

export default App;