import { useEffect } from "react";

export default function Channel({id, name, participants }) {
	useEffect(() => {console.log(participants)}, []);
	return (
		<div className="Channel-item" key={id}>
			<div>{name}</div>
			<span>{participants}</span>
		</div>
	);
}
