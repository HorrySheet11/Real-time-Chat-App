import { useState, useEffect } from 'react'
import './App.css'
import io from "socket.io-client";

const backend = VITE_BACKEND_URL || "http://localhost:3000";
const socket = io(backend);

function App() {
  const [messages, setMessages] = useState([]);
  const [imput, setInput] = useState("");

  useEffect(() => {
    socket.on("chat message", (msg) => {
      setMessages((messages) => [...messages, msg]);
    });
  }, []);

  return (
    <>
      
    </>
  )
}

export default App
