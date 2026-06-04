import { useEffect, useState } from "react";
import ChannelList from "./ChannelList.jsx";
import "./chat.css";
import axios from "axios";
import socketClient from "socket.io-client";
import MessagesPanel from "./MessagesPanel.jsx";

const server = "http://localhost:3000";

export default function Chat() {
	const socket = socketClient(server);
	socket.on("connection", () => {
		console.log("Connected to server back-end");
	});

	const [channels, setChannels] = useState([]);

	function handleChannelSelect() {
		socket.emit("channel-join", 1, (ack) => {
			console.log(ack);
		});
	}

	useEffect(() => {
		console.log("chat loaded");
		setChannels((channel) => [
			...channel,
			{
				id: 1,
				name: "first",
				participants: 10,
				sockets: [],
			},
		]);

		async function getChannels() {
			//FIXME: get request not working, but 200
			const response = await axios.get("http://localhost:3000/getChannels");
			console.log(await response.data);
			setChannels((channels) => [...channels, response.data.channels]);
		}
		try {
			getChannels();
		} catch (error) {
			console.error(error);
		}
	}, []);

	return (
		<div className="chat-app">
			<ChannelList
				channel={channels}
				onSelectChannel={() => handleChannelSelect()}
			/>
			<MessagesPanel />
		</div>
	);
}
