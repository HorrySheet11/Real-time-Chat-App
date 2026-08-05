import { useContext, useEffect, useState } from "react";
import { ChatContext } from "../context/ChatContext";
import {socket} from "../services/socket";
export default function ChatGroups() {
	const { chatGroup, setChatGroup} = useContext(ChatContext);
	const [chatGroups, setChatGroups] = useState([]);

	useEffect(() => {
		socket.emit("get_collections");
		socket.on("collections", (collections) => {
			setChatGroups(collections);
		});
	}, []);

	async function changeChatGroup(chatGroup) {
		console.log(`changed to ${chatGroup}`);
		socket.emit("change_collection", chatGroup);
		setChatGroup(chatGroup);
	}

	return (
		<div className="absolute top-0 left-0  w-min p-4 border-white border rounded-sm ">
			<ul>
				{chatGroups.map((group) => (
					<li key={group.info.uuid}>
						<button
							type="button"
							className=" cursor-pointer"
							onClick={() => changeChatGroup(group.name)}
						>
							{group.name}
						</button>
					</li>
				))}
			</ul>
		</div>
	);
}
