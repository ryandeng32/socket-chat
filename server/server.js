const express = require("express");
const socketio = require("socket.io");
const cors = require("cors");
const http = require("http");
const { addUser, removeUser, getUser, getUsersInRoom } = require("./users.js");
const PORT = process.env.PORT || 5000;

const router = require("./router");
// Set up socket.io
const app = express();
app.use(cors);
const server = http.createServer(app);
const io = socketio(server);

io.on("connection", (socket) => {
  console.log("user joined");
  socket.on("join", ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });
    if (error) return callback(error);
    socket.emit("message", {
      user: "admin",
      text: `${user.name}, welcome to ${user.room}`,
    });
    socket.broadcast
      .to(user.room)
      .emit("message", { user: "admin", text: `${user.name} has joined` });
    socket.join(user.room);
    callback();
  });
  socket.on("sendMessage", ({ message }, callback) => {
    const user = getUser(socket.id);
    console.log(message);
    io.to(user.room).emit("message", { user: user.name, text: message });
    callback();
  });

  socket.on("disconnect", () => {
    console.log("User left");
  });
});

app.use(router);

server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));
