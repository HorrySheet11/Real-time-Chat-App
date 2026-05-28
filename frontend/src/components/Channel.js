export default function Channel({ channel, name, participants }) {
	return (
		<div className="Channel-item" key={channel.id}>
			<div>{name}</div>
      <span>{participants}</span>
		</div>
	);
}
