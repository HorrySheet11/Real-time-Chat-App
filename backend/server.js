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

// Cache for models per collection
const modelCache = new Map();

function getModel(collectionName) {
	if (!modelCache.has(collectionName)) {
		modelCache.set(collectionName, mongoose.connection.model(collectionName, chatSchema));
	}
	return modelCache.get(collectionName);
}

const port = process.env.PORT || 3000;
server.listen(port, () => {
	console.log(`listening on ${port}`);
});

io.on("connection", (socket) => {
	console.log("A user connected!");

	// Initialize current collection for this socket
	socket.currentCollection = null;

	socket.on("change_collection", async (group) => {
		console.log(`changed to ${group}`);

		// Leave the previous room if any
		if (socket.currentCollection) {
			socket.leave(socket.currentCollection);
			console.log(`left room ${socket.currentCollection}`);
		}

		// Join the new room
		socket.join(group);
		socket.currentCollection = group;
		console.log(`joined room ${group}`);

		// Fetch messages for this collection and send to this socket
		try {
			const Chat = getModel(group);
			const messages = await Chat.find();
			socket.emit("messages", messages);
		} catch (err) {
			console.error(`Error fetching messages for ${group}:`, err);
			socket.emit("messages", []); // Send empty array on error
		}
	});

	socket.on("chat_message", async (msg) => {
		console.log(`message: ${msg}`);

		if (!socket.currentCollection) {
			console.warn("Received chat_message but no collection selected");
			return;
		}

		try {
			const Chat = getModel(socket.currentCollection);
			const newChat = new Chat({
				message: msg,
				sender: "user",
			});
			await newChat.save();

			// Broadcast the message to everyone in the room
			io.to(socket.currentCollection).emit("new_message", msg);
		} catch (err) {
			console.error(`Error saving message to ${socket.currentCollection}:`, err);
		}
	});

	socket.on("get_messages", async () => {
		if (!socket.currentCollection) {
			console.warn("get_messages called but no collection selected");
			socket.emit("messages", []); // Send empty array
			return;
		}

		try {
			const Chat = getModel(socket.currentCollection);
			const messages = await Chat.find();
			socket.emit("messages", messages);
		} catch (err) {
			console.error(`Error fetching messages for ${socket.currentCollection}:`, err);
			socket.emit("messages", []); // Send empty array on error
		}
	});

	socket.on("get_collections", async () => {
		try {
			const collections = await mongoose.connection.db.listCollections().toArray();
			socket.emit("collections", collections);
		} catch (err) {
			console.error("Error fetching collections:", err);
			socket.emit("collections", []); // Send empty array on error
		}
	});

	socket.on("disconnect", () => {
		console.log("A user disconnected!");
		// Rooms are left automatically on disconnect
	});
});