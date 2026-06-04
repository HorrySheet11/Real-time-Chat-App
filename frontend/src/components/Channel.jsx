
export default function Channel({id, name, participants }) {
	return (
		<div className="channel-item" key={id}>
			<div>{name}</div>
			<span>Participants: {participants}</span>
		</div>
	);
}
