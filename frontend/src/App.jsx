// import { useState } from 'react'
import socketClient from "socket.io-client";
import './App.css';

const server = "http://localhost:3000";
// FIXME: no cors

function App() {
  const socket = socketClient(server);
  socket.on("connection", () => {
    console.log("Connected to server back-end");
  })
  return (
    <div className="App">
      <p>Trying out socket.io</p>
    </div>
  )
}

export default App
