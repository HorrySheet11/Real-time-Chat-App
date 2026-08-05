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
		<div className='absolute top-0 left-0 h-full w-min p-4 border-white border rounded-sm '>
			<ul>
				{chatGroups.map((group) => (
					<li key={group.info.uuid}><button type="button" className=" cursor-pointer">{group.name}</button></li>
				))}
			</ul>
		</div>
	);
}
