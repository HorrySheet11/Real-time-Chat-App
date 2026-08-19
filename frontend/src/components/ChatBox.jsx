import { useContext, useState } from "react";
import { ChatContext } from "../context/ChatContext";
import api from "../services/axios";
import { socket } from "../services/socket.js";

export default function ChatBox() {
	const [input, setInput] = useState("");
	const { chatGroup, user, setUser, setAuthMode } = useContext(ChatContext);
	const sendMessage = () => {
		if (input) {
			socket.emit("chat_message", { message: input, user: user });
			setInput("");
		}
		// console.log("sent message");
	};

	const handleLogout = async () => {
		try {
			await api.post("/api/logout");
		} catch (err) {
			console.error("Logout failed", err);
		} finally {
			setUser(null);
			// Reset to login mode
			setAuthMode("login");
		}
	};
	return (
		<div className="bg-darkBg fixed inset-x-0 bottom-0 py-1 border-t flex-row ">
			<form
				onSubmit={(e) => {
					e.preventDefault();
					sendMessage();
				}}
				className="flex flex-row justify-center gap-1"
			>
				{" "}
				<h3 className="my-auto">{user?.username}</h3>
				<h3 className="my-auto">{chatGroup && ` in ${chatGroup}`}</h3>
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

			<button
				type="button"
				onClick={handleLogout}
				className="bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded absolute bottom-1 right-2"
			>
				Logout
			</button>
		</div>
	);
}
