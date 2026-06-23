import { useEffect, useState } from "react";
import "./App.css";
import io from "socket.io-client";

const backend = import.meta.env.BACKEND_URL || "http://localhost:3000";
const socket = io(backend);

function App() {
	const [messages, setMessages] = useState([]);
	const [input, setInput] = useState("");

	useEffect(() => {
		socket.on("new_message", (msg) => {
			setMessages([...messages, msg]);
		});
	}, [messages]);
	
	const sendMessage = () => {
		// e.preventDefault();
		console.log('sent message');
		if (input) {
			socket.emit("chat_message", input);
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
      <form onSubmit={() => sendMessage()}>
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} />
				<button type="submit">Send</button>
      </form>
		</div>
	);
}

export default App;
