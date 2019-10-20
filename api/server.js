const PORT = process.env.PORT || 8800;
const IP = process.env.IP || "0.0.0.0";
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const app = express();
const uuid = require("uuid/v4");
const mongoose = require("mongoose");
const DBURI = process.env.MONGO_URI;

app.use(express.json());
app.use(cors());
app.use(helmet());
mongoose.connection.openUri(DBURI, {
	useNewUrlParser: true,
	useFindAndModify: false,
	useUnifiedTopology: true
});

const server = app.listen(PORT, IP, () => {
	console.log("Server started!");
});

const io = require("socket.io")(server);

let TopicSchema = new mongoose.Schema({
	title: String,
	description: String
});
let Topic = mongoose.model("Topic", TopicSchema);

io.sockets.on("connection", socket => {
	console.log("Client : ", socket.id);
	socket.on("text", data => {
		console.log(data.data);
		socket.broadcast.emit("text", data);
	});
	socket.on("draw", data => {
		socket.broadcast.emit("draw", data);
		console.log(data);
	});
	socket.on("disconnect", () => console.log("client has disconnected"));
});

app.get("/get/topics", (req, res) => {
	Topic.find({}, function(err, founded) {
		res.json(founded);
	});
});

app.get("/get/uuid", (req, res) => {
	return res.json(uuid());
});
