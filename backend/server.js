const express = require("express");
const app = express();
const server = require("node:http").createServer(app);
const io = require("socket.io")(server, {
	cors: { origin: "*" },
});
const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URL);

const chatSchema = mongoose.Schema({
	message: String,
	sender: String,
	timestamp: { type: Date, default: Date.now },
});

const Chat = mongoose.model("Chat", chatSchema);

const port = process.env.PORT || 3000;

// app.get("/", (req, res) => {
// 	res.send("Hello World!");
// 	console.log("Hello World!");
// });

server.listen(port, () => {
	console.log(`listening on ${port}`);
});


io.on("connection", socket => {
	console.log("A user connected!");

	socket.on("chat_message", async (msg) => {
		console.log(`message: ${msg}`);
		const newChat = Chat({
			message: msg,
			sender: "user",
		});
		await newChat.save();
		io.emit("new_message", msg);
	});

	socket.on("disconnect", () => {
		console.log("A user disconnected!");
	});
});

