const express = require("express");
const app = express();
const http = require("node:http").Server(app);
const io = require("socket.io")(http, {
	cors: { origin: "http://localhost:5173" },
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

io.on("connection", (socket) => {
	console.log("A user connected!");
	socket.on("chat message", async (msg) => {
		const newChat = Chat({
			message: msg,
			sender: "user",
		});
		await newChat.save();
		io.emit("new message", msg);
	});

	socket.on("disconnect", () => {
		console.log("A user disconnected!");
	});
});

const port = process.env.PORT || 3000;
http.listen(port, () => {
	console.log(`listening on ${port}`);
});
