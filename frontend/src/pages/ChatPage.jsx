import { useContext, useEffect, useState } from "react";
import ChatBox from "../components/ChatBox";
import ChatGroups from "../components/ChatGroups";
import { ChatContext } from "../context/ChatContext";
import api from "../services/axios";

export default function ChatPage() {
	const [messages, setMessages] = useState([]);
	const {
		user,
    setUser,
		input,
		setInput,
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
				// console.log("new_message", msg);
				setMessages((prev) => [...prev, msg]);
			});
			// Fetch all chat groups/collections on start
			socket.emit("get_collections");
			socket.on("collections", (collections) => {
				// console.log("collections received:", collections);
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

	return (
		<div className="flex flex-col relative">
			<ChatGroups />
			<ul className="flex flex-col pl-25 pb-8">
				{messages.map((msg) => (
					<li key={msg._id} className="mb-4">
						{msg.sender === user?.username ? (
							<div className="flex justify-end">
								<div className="bg-blue-500 text-white p-1 rounded-lg max-w-[70%]">
									<p className="m-0">{msg.message}</p>
								</div>
							</div>
						) : (
							<div className="flex gap-0 justify-start">
								<div className="bg-gray-600 text-white p-1 rounded-lg max-w-[70%]">
									<div className="flex justify-between">
										<small className="text-gray-200">{msg.sender}</small>
									</div>
									<p className="m-0">{msg.message}</p>
								</div>
							</div>
						)}
					</li>
				))}
			</ul>

			<ChatBox />
		</div>
	);
}