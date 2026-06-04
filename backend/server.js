const app = require("express")();
const http = require("node:http").createServer(app);
const PORT = process.env.PORT || 3000;
const io = require("socket.io")(http, {
	cors: {
		origin: "http://localhost:5173, http://localhost:5173/getChannels",
		methods: ["GET", "POST"],
	},
});

const STATIC_CHANNELS = [
	{
		id: 2,
		name: "second",
		participants: 0,
		sockets: [],
	},
	{
		id: 3,
		name: "third",
		participants: 0,
		sockets: [],
	},
];

app.get("/", (req, res) => {
	res.send("Hello World!");
});

app.get("/getChannels", (req, res) => {
	console.log("getting channels");
	res.send({
		channels: STATIC_CHANNELS,
	});
	return res.json(STATIC_CHANNELS);
});

http.listen(PORT, () => {
	console.log(`Listening on port ${PORT}`);
});

io.on("connection", (socket) => {
	console.log("new client connected!");
	socket.emit("connected", null);
	socket.on("channel-join", (id) => {
		console.log("joined channel: ", id);
		STATIC_CHANNELS.forEach((c) => {
			if (c.id === id) {
				if (c.sockets.indexOf(socket.id) === -1) {
					c.sockets.push(socket.id);
					c.participants++;
					io.emit("channel", c);
				}
			} else {
				const index = c.sockets.indexOf(socket.id);
				if (index !== -1) {
					c.sockets.splice(index, 1);
					c.participants--;
					io.emit("channel", c);
				}
			}
		});
		return id;
	});
});
