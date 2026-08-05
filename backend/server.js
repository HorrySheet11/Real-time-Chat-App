const express = require("express");
const app = express();
const server = require("node:http").createServer(app);
const io = require("socket.io")(server, {
	cors: { origin: "*" },
});
const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(`${process.env.MONGO_URL}/try`);

const chatSchema = mongoose.Schema({
	message: String,
	sender: String,
	timestamp: { type: Date, default: Date.now },
});

let selectedGroup = "Chut";
function newChat() {
	return mongoose.connection.model(`${selectedGroup}`, chatSchema);
}
let Chat = newChat();

const port = process.env.PORT || 3000;
server.listen(port, () => {
	console.log(`listening on ${port}`);
});

io.on("connection", (socket) => {
	console.log("A user connected!");

	socket.on("change_collection", async (group) => {
		console.log(`changed to ${group}`);
		selectedGroup = group;
		Chat = newChat();
		const messages = await Chat.find();
		io.emit("messages", messages);
	});

	socket.on("chat_message", async (msg) => {
		console.log(`message: ${msg}`);
		const newChat = Chat({
			message: msg,
			sender: "user",
		});
		await newChat.save();
		io.emit("new_message", msg);
	});

	socket.on("get_messages", async () => {
		const messages = await Chat.find();
		io.emit("messages", messages);
	});

	socket.on("disconnect", () => {
		console.log("A user disconnected!");
	});

	socket.on("get_collections", async () => {
		const collections = await mongoose.connection.db
			.listCollections()
			.toArray();
		io.emit("collections", collections);
	});
});
