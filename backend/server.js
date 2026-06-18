const express = require("express");
const app = express();
const http = require("node:http").Server(app);
const io = require("socket.io")(http);
const mongoose = require("mongoose");

const mongo =
	"mongodb+srv://<db_username>:OuqqwrbFQsaCv4W6@learnmongodb.gnmnkhx.mongodb.net/?appName=LearnMongoDB";

mongoose.connect(mongo, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

const chatSchema = newmongoose.Schema({
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


