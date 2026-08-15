import { useContext, useEffect, useState } from "react";
import ChatBox from "../components/ChatBox";
import ChatGroups from "../components/ChatGroups";
import { ChatContext } from "../context/ChatContext";

export default function ChatPage() {
	const [messages, setMessages] = useState([]);
	const {
		user,
		input,
		setInput,
		// chatGroup,
		// setChatGroup,
		// chatGroups,
		setChatGroups,
		socket,
	} = useContext(ChatContext);

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
				setMessages((prev) => [...prev, msg]);
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
			setAuthMode("login");
		}
	};

	return (
		<div className="flex flex-col relative">
			<div className="flex justify-end mb-2">
				<button
					type="button"
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
