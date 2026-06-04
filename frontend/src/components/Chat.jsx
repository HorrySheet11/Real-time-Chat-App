import { useEffect, useState } from "react";
import ChannelList from "./ChannelList.jsx";
import "./chat.css";
import MessagesPanel from "./MessagesPanel.jsx";

export default function Chat() {
	const [channels, setChannels] = useState([]);

	useEffect(() => {
		console.log("chat loaded");
		setChannels((channel) => [
			...channel,
			{
				id: 1,
				name: "first",
				participants: 10,
			},
		]);

		// async function getChannels() {
		// 	await axios.get("http://localhost:3000/getChannels").then((response) => {
		// 		setChannels(response.data.channels);
		// 	});
		// }
		// getChannels();
	}, []);

	return (
		<div className="chat-app">
			<ChannelList channel={channels} />
			<MessagesPanel />
		</div>
	);
}
