import {  useState } from "react";
import { socket } from "../services/socket.js";

export default function ChatBox() {
  const [input, setInput] = useState("");

	const sendMessage = () => {
		console.log("sent message");
		if (input) {
			socket.emit("chat_message", input);
			setInput("");
		}
	};
	return (
		<form
			onSubmit={() => sendMessage()}
			className="flex flex-row justify-center gap-1"
		>
			<input
				className="rounded-sm border"
				type="text"
				value={input}
				onChange={(e) => setInput(e.target.value)}
			/>
			<button
				type="submit"
				className="bg-blue-500 hover:bg-blue-700 text-white  py-1 px-2 rounded-sm"
			>
				Send
			</button>
		</form>
	);
}
