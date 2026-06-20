import { useEffect, useState } from "react";
import "./App.css";
import io from "socket.io-client";

const backend = import.meta.env.BACKEND_URL || "http://localhost:3000";
const socket = io(backend);

function App() {
	const [messages, setMessages] = useState([]);
	const [input, setInput] = useState("");

	useEffect(() => {
		socket.on("chat message", (msg) => {
			setMessages([...messages, msg]);
		});
	}, [messages]);

	const sendMessage = () => {
		e.preventDefault();
		if (input) {
			socket.emit("chat message", input);
			setInput("");
		}
	};

	return (
		<div>
			<ul>
				{messages.map((msg, index) => (
					<li key={index}>{msg}</li>
				))}
			</ul>
      <form onSubmit={sendMessage}>
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} />
      </form>
		</div>
	);
}

export default App;
