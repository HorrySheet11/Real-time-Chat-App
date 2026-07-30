import { useEffect, useState } from "react";
import io from "socket.io-client";

const backend = import.meta.env.BACKEND_URL || "http://localhost:3000";
const socket = io(backend);

export default function ChatGroups() {
	const [chatGroups, setChatGroups] = useState([]);

	useEffect(() => {
		socket.emit("get_collections");
		socket.on("collections", (collections) => {
			console.log(collections);
			setChatGroups(collections);
		});
	},[]);
  
	return (
		<div>
			<ul>
				{chatGroups.map((group) => (
					<li key={group.info.uuid}>{group.name}</li>
				))}
			</ul>
		</div>
	);
}
