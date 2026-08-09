import {  useState, useContext } from "react";
import { socket } from "../services/socket.js";
import { ChatContext } from "../context/ChatContext";

export default function ChatBox() {
  const [input, setInput] = useState("");
	const {chatGroup} = useContext(ChatContext);
	const sendMessage = () => {
		console.log("sent message");
		if (input) {
			socket.emit("chat_message", input);
			setInput("");
		}
	};
	return (
		<div className='bg-darkBg fixed inset-x-0 bottom-0 py-1 border-t'>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					sendMessage();
				}}
				className="flex flex-row justify-center gap-1"
			>	<h3 className='my-auto'>{chatGroup}</h3>
				<div className="flex flex-row justify-center gap-1">
					<input
						className="rounded-sm border p-1"
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
				</div>
			</form>
		</div>
	);
}