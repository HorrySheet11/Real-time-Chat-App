import { useEffect, useState } from "react";
import Channel from "./Channel.jsx";

export default function ChannelList({channel}) {
	useEffect(() => {
		console.log(channel);
	},[]);
	return (
		<div className="channel-list">
			{channel.map(channel => (
				<Channel
					key={channel.id}
					id={channel.id}
					name={channel.name}
					participants={channel.participants}
				/>
			))}
			{!channel && <p>No channels</p>}
		</div>
	);
}
