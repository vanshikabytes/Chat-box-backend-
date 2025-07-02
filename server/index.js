const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const messageRoute = require("./routes/messagesRoute");
const axios = require("axios");

const app = express();
const socket = require("socket.io");
require("dotenv").config();

app.use(cors());
app.use(express.json());

app.use("/api/auth", userRoutes);
app.use("/api/messages", messageRoute);

// Proxy route to bypass CORS
app.get("/api/avatar/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(`https://api.multiavatar.com/${id}.svg`, {
      responseType: "arraybuffer",
    });
    res.set("Content-Type", "image/svg+xml");
    res.send(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch avatar" });
  }
});

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("DB connection successful"))
  .catch((err) => console.log(err.message));

const server = app.listen(process.env.PORT, () => {
  console.log(`Server Started on Port ${process.env.PORT}`);
});

const io = socket(server,{
  cors:{
    origin:"https://box-chat.netlify.app",
    credentials: true,
  }
})

global.onlineUsers = new Map();

io.on("connection",(socket)=>{
  global.chatSocket = socket;
  socket.on("add-user",(userId)=>{
    onlineUsers.set(userId,socket.id);
  });
  socket.on("send-msg",(data)=>{
    const sendUserSocket = onlineUsers.get(data.to);
    if(sendUserSocket){
      socket.to(sendUserSocket).emit("msg-recieved",data.msg);
    }
  })
})