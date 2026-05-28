import ChannelList from "ChannelList";
import { useEffect, useState } from "react";

export default function Chat() {
	const [channels, setChannels] = useState([]);

  useEffect(() => {
    setChannels(...channels , 
      {
		id: 1,
		name: first,
		participants: 10,
	}
    )
  },[])
	return (
		<div className="Chat">
			<ChannelList channels={state} setChannels={setChannels} />
		</div>
	);
}
