import { useContext, useEffect, useState } from "react";
import ChatBox from "../components/ChatBox";
import ChatGroups from "../components/ChatGroups";
import { ChatContext } from "../context/ChatContext";
import api from "../services/axios";

export default function ChatPage() {
	const [messages, setMessages] = useState([]);
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);
	const {
		user,
    setUser,
		input,
		setInput,
		setChatGroups,
		socket,
	} = useContext(ChatContext);

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
		<div className="flex h-screen relative">
			{/* Hamburger button to open drawer on small screens */}
			<button type="button"
				onClick={() => setIsDrawerOpen(!isDrawerOpen)}
				className="2xs:block xs:block sm:hidden p-2 2xs:p-1 xs:p-1.5 sm:p-3 z-20"
				aria-label="Open chat groups menu"
			>
				<span className="block h-0.5 2xs:h-[2px] xs:h-[1.5px] sm:h-[2px] bg-white 2xs:mb-0.5 xs:mb-1 sm:mb-1.5"></span>
				<span className="block h-0.5 2xs:h-[2px] xs:h-[1.5px] sm:h-[2px] bg-white 2xs:mb-0.5 xs:mb-1 sm:mb-1.5"></span>
				<span className="block h-0.5 2xs:h-[2px] xs:h-[1.5px] sm:h-[2px] bg-white"></span>
			</button>

			{/* Chat Groups Drawer - shown as sidebar on md+ and as drawer on smaller screens */}
			<ChatGroups
				className={`
					${isDrawerOpen ? 'transform translate-x-0' : '-translate-x-full'}
					transition-transform duration-300 ease-in-out
					w-[60px] 2xs:w-[50px] xs:w-[55px] sm:w-64 md:w-80 md:translate-x-0
					border-r md:block 2xs:hidden xs:hidden sm:hidden
					z-30
				`}
			/>

			<div className="flex-1 flex-col m-2 2xs:m-1 xs:m-2 sm:m-3 md:m-4">
					{/* Header with logout button */}
					<div className="flex justify-between items-center mb-2 2xs:mb-1 xs:mb-1.5 sm:mb-2">
						<h2 className="text-xl 2xs:text-lg xs:text-xl sm:text-2xl font-bold">Horry Chat!</h2>
						<button
							onClick={handleLogout}
							className="bg-red-500 hover:bg-red-600 text-white py-1 2xs:py-0.5 xs:py-0.5 sm:py-1 px-2 2xs:px-1.5 xs:px-2 sm:px-2.5 rounded"
						>
							Logout
						</button>
					</div>
				<ul className="flex flex-col flex-1 overflow-y-auto pb-4 2xs:pb-2 xs:pb-3 sm:pb-4 md:pb-6">
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
		</div>
	);
}