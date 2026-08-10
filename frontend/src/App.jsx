import { useEffect, useState } from "react";
import ChatBox from "./components/ChatBox";
import ChatGroups from "./components/ChatGroups";
import { socket } from "./services/socket";
import { useContext } from "react";
import { ChatContext } from "./context/ChatContext";
import Login from "./components/Login";
import Register from "./components/Register";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const { setChatGroups, user, setUser,authMode, setAuthMode } = useContext(ChatContext);

  useEffect(() => {
    if (user) {
      socket.connect();
      // Fetch messages for initial load (will be overridden when collection selected)
      socket.emit("get_messages");
      socket.on("messages", (messages) => {
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
      });
    } else {
      // Remove listeners and disconnect
      socket.off("messages");
      socket.off("new_message");
      socket.off("collections");
      socket.disconnect();
    }
    return () => {
      // Cleanup on unmount (or when user changes)
      socket.off("messages");
      socket.off("new_message");
      socket.off("collections");
      socket.disconnect();
    };
  }, [user]);

  const sendMessage = () => {
    console.log("sent message");
    if (input) {
      socket.emit("chat_message", input);
      setInput("");
    }
  };

  // State for toggling between login and register

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    // Optionally, you can reset the auth mode or do other things
    setAuthMode('login');
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      setUser(null);
      // Reset to login mode
      setAuthMode('login');
    }
  };

  // If user is not logged in, show auth forms
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-darkBg">
        <div className="bg-darkBg p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center">Horry Chat!</h1>
          {/* Toggle between login and register */}
          <div className="flex mb-4">
            <button type="button"
              onClick={() => setAuthMode('login')}
              className={`flex-1 rounded px-4 py-2 bg-${authMode === 'login' ? 'blue-500' : 'gray-200'} text-white rounded-t-l ${authMode === 'login' ? 'font-bold' : ''}`}
            >
              Login
            </button>
            <button type="button"
              onClick={() => setAuthMode('register')}
              className={`flex-1 rounded px-4 py-2 bg-${authMode === 'register' ? 'blue-500' : 'gray-200'} text-white rounded-t-r ${authMode === 'register' ? 'font-bold' : ''}`}
            >
              Register
            </button>
          </div>
          {authMode === 'login' ? <Login onAuthSuccess={handleAuthSuccess} /> : <Register onAuthSuccess={handleAuthSuccess} />}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col relative">
      <div className="flex justify-end mb-2">
        <button type="button"
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded"
        >
          Logout
        </button>
      </div>
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