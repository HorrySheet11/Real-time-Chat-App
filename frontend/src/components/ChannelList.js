import Channel from "Channel";

export default function ChannelList(channel) {
	return (
		<div className="ChannelList">
			{channel?.map((channel) => (
				<Channel
					key={channel.id}
					id={id}
					name={channel.name}
					participants={channel.participants}
				/>
			))}
			{!channel && <p>No channels</p>}
		</div>
	);
}
