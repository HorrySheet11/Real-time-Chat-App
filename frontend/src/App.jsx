import { useEffect, useState } from "react";
import "./App.css";
import io from "socket.io-client";


const backend = import.meta.env.BACKEND_URL || "http://localhost:3000";
const socket = io(backend); 

function App() {
	const [messages, setMessages] = useState([]);
	const [input, setInput] = useState("");

	useEffect(() => {
		//FIXME: socket not working after adding tailwind
		socket.emit("get_messages");

		socket.on("messages", (messages) => {
			console.log(messages);
			setMessages(messages);
		});

	},[]);

	// useEffect(() => {
	// 	socket.on("new_message", (msg) => {
	// 		// const message = msg
	// 		console.log(`new message! ${msg}`);
	// 		setMessages([...messages, msg]);
	// 	});
	// 	console.log(messages);
	// }, [messages]);


	// useEffect(() => {
	// 	socket.emit("get_messages", (messages) => {
	// 		console.log(messages);
	// 		setMessages(messages);
	// 	});
	// 	console.log(messages);
	// }, [messages]);

	const sendMessage = () => {
		// e.preventDefault();
		console.log("sent message");
		if (input) {
			socket.emit("chat_message", input);
			setInput("");
		}
	};

	return (
		<div className="flex flex-col">
			<ul className="flex flex-col">
				{messages.map((msg) => (
					<li key={msg._id}>{msg.sender}: {msg.message}</li>
				))}
			</ul>
			<form onSubmit={() => sendMessage()} className="flex flex-row justify-center gap-1">
				<input className="rounded-sm border"
					type="text"
					value={input}
					onChange={(e) => setInput(e.target.value)}
				/>
				<button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white  py-1 px-2 rounded-sm">Send</button>
			</form>
		</div>
	);
}

export default App;
