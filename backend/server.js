const express = require("express");
const cors = require("cors");
const app = express();
const http = require("node:http").Server(app);
const io = require("socket.io")(http);
const mongoose = require("mongoose");
require("dotenv").config();

app.use(cors());
mongoose.connect(process.env.MONGO_URL);

const chatSchema = mongoose.Schema({
	message: String,
	sender: String,
	timestamp: { type: Date, default: Date.now },
});

const Chat = mongoose.model("Chat", chatSchema);

io.on("connection", (socket) => {
	console.log("A user connected!");
	socket.on("chat message", (msg) => {
		const newChat = Chat({
			message: msg,
			sender: "user",
		});
    newChat.save();
    io.emit("chat message", msg);
	});

  socket.on('disconnect', ()=>{
    console.log("A user disconnected!");
  })
});

const port = process.env.PORT || 3000;
http.listen(port, () => {
  console.log(`listening on ${port}`);
});


