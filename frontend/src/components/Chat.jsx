import { useEffect, useState } from "react";
import ChannelList from "./ChannelList";
import "./chat.css";
import MessagesPanel from "./MessagesPanel";

export default function Chat() {
	const [channels, setChannels] = useState([]);

	useEffect(() => {
		setChannels(...channels, {
			id: 1,
			name: first,
			participants: 10,
		});

		async function getChannels() {
			await axios.get("http://localhost:3000/getChannels").then((response) => {
				setChannels(response.data.channels);
			});
		}
		getChannels();
	}, []);

	return (
		<div className="Chat">
			<ChannelList channels={state} setChannels={setChannels} />
			<MessagesPanel />
		</div>
	);
}
