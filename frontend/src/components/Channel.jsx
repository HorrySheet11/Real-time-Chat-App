export default function Channel({id, name, participants }) {
	return (
		<div className="Channel-item" key={id}>
			<div>{name}</div>
			(participants.map{(participant) => {
				<span>{participant}</span>;
			}})
		</div>
	);
}
