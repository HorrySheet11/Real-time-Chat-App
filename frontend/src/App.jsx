import { useEffect, useState } from "react";
import ChatBox from "./components/ChatBox";
import ChatGroups from "./components/ChatGroups";
import { socket } from "./services/socket";

function App() {
	const [messages, setMessages] = useState([]);
	const [input, setInput] = useState("");

	useEffect(() => {
		socket.emit("get_messages");
		socket.on("messages", (messages) => {
			console.log(messages);
			setMessages(messages);
		});
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
