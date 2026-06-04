import { useEffect, useState } from "react";
import Channel from "./Channel.jsx";

export default function ChannelList({channel, onSelectChannel}) {
	function handleClick(id){
		onSelectChannel(id);
	} 
	return (
		<div className="channel-list">
			{channel.map(channel => (
				<Channel
					key={channel.id}
					id={channel.id}
					name={channel.name}
					participants={channel.participants}
					onClick={handleClick(channel.id)}
				/>
			))}
			{!channel && <p>No channels</p>}
		</div>
	);
}
