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
	return (
		<div className="bg-darkBg fixed inset-x-0 bottom-0 2xs:bottom-[3px] xs:bottom-1 border-t flex-row px-2 2xs:px-1 xs:px-1.5 sm:px-2">
			<form
				onSubmit={(e) => {
					e.preventDefault();
					sendMessage();
				}}
				className="flex flex-row items-center justify-between gap-2 2xs:gap-1 xs:gap-1.5 sm:gap-2 w-full"
			>
				<div className="flex flex-col items-start gap-0.5 2xs:gap-0.5">
					<h3 className="text-xs 2xs:text-[10px] xs:text-sm sm:text-base font-medium text-white my-auto">{user?.username}</h3>
					{chatGroup && <h3 className="text-xs 2xs:text-[10px] xs:text-sm sm:text-base text-white-400 my-auto">{` in ${chatGroup}`}</h3>}
				</div>
				<div className="flex flex-row gap-2 2xs:gap-1 xs:gap-1.5 sm:gap-2 flex-1 max-w-[200px] 2xs:max-w-[120px] xs:max-w-[150px] sm:max-w-[180px]">
					<input
						className="rounded-sm border px-2 2xs:px-1 xs:px-1.5 sm:px-2 py-1 2xs:py-0.5 xs:py-0.5 sm:py-1 flex-1 min-w-0"
						type="text"
						value={input}
						onChange={(e) => setInput(e.target.value)}
						placeholder="Type a message..."
					/>
					<button
						type="submit"
						className="bg-blue-500 hover:bg-blue-700 text-white  py-1 px-2 2xs:px-1.5 xs:px-2 sm:px-2.5 rounded-sm flex-shrink-0"
					>
						Send
					</button>
				</div>
			</form>
		</div>
	);
}
