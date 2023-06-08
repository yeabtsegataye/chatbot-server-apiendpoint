const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const userRoutes = require("./router/userRouter");
const chatRoutes = require("./router/chatRoutes");
const messageRoutes = require("./router/messageRoutes");
const path = require("path");

require("dotenv").config();

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000"],
  })
);
app.use(express.json());
mongoose
  .connect(process.env.MONGOODBURL)
  .then(() => {
    const server = app.listen(process.env.PORT, () => {
      console.log("connected to db & listening on port", process.env.PORT);
      const io = require("socket.io")(server, {
        pingTimeout: 60000,
        cors: {
          origin: "http://localhost:3000",
        },
      });
      io.on("connection", (socket) => {
        console.log("Connected to socket.io");
        socket.on("setup", (userData) => {
          socket.join(userData._id);
          socket.emit("connected");
        });

        socket.on("join chat", (room) => {
          socket.join(room);
          console.log("User Joined Room: " + room);
        });
        socket.on("typing", (room) => socket.in(room).emit("typing"));
        socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));
        socket.on("new message", (newMessageRecieved) => {
          var chat = newMessageRecieved.chat;

          if (!chat.users) return console.log("chat.users not defined");

          chat.users.forEach((user) => {
            if (user._id == newMessageRecieved.sender._id) return;

            socket.in(user._id).emit("message recieved", newMessageRecieved);
          });
        });
        socket.off("setup", () => {
          console.log("USER DISCONNECTED");
          socket.leave(userData._id);
        });
      });
    });
  })
  .catch((error) => {
    console.log(error);
  });
//
app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});
//
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
// --------------------------deployment------------------------------

const clientBuildPath = path.resolve(__dirname, "..", "client", "build");

if (process.env.NODE_ENV === "production") {
  app.use(express.static(clientBuildPath));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(clientBuildPath, "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running..");
  });
}
// --------------------------deployment------------------------------

app.use(notFound);
app.use(errorHandler);
