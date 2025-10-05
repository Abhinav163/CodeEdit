const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const { spawn } = require("child_process");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

// Middleware for authentication
const auth = require("./middleware/auth");

// Connect to Database
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS configuration
const io = new Server(server, {
  cors: {
    origin: [
      "https://codeedit-frontend.onrender.com",
      "https://code-edit-lac.vercel.app",
      "http://localhost:3000",
    ],
    methods: ["GET", "POST"],
  },
  allowEIO3: true,
});

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// --- API Routes ---
app.use("/api/auth", require("./routes/auth"));
app.use("/api/snippets", require("./routes/snippets"));

// --- WebSocket Connection Logic ---
const roomUsers = {};

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join-room", (roomId, user) => {
    socket.join(roomId);
    if (!roomUsers[roomId]) {
      roomUsers[roomId] = [];
    }
    // Add user if not already in the list
    if (user && !roomUsers[roomId].some((u) => u.id === user.id)) {
      // Assign the current socket ID to the user payload
      user.socketId = socket.id;
      roomUsers[roomId].push(user);
    }
    // Broadcast the updated user list to everyone in the room
    io.to(roomId).emit("update-user-list", roomUsers[roomId]);
    console.log(`User ${socket.id} (${user?.firstName}) joined room ${roomId}`);
  });

  socket.on("code-change", (data) => {
    const { roomId, newCode } = data;
    // Broadcast to everyone else in the room except the sender
    socket.to(roomId).emit("code-update", newCode);
  });

  socket.on("send-chat-message", (data) => {
    const { roomId, message } = data;
    // Broadcast the message to other users in the room
    socket.to(roomId).emit("receive-chat-message", message);
  });

  // Handle user disconnection
  socket.on("disconnecting", () => {
    // Find which rooms the socket was in
    const rooms = Array.from(socket.rooms);
    rooms.forEach((roomId) => {
      if (roomUsers[roomId]) {
        // Remove the user from the room's user list
        roomUsers[roomId] = roomUsers[roomId].filter(
          (u) => u.socketId !== socket.id
        );
        // Broadcast the new user list
        io.to(roomId).emit("update-user-list", roomUsers[roomId]);
      }
    });
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// (Your existing /run route remains here)
app.post("/run", auth, (req, res) => {
  const { language = "javascript", code, input = "" } = req.body;

  if (code === undefined || code.trim() === "") {
    return res.status(400).json({ error: "Code is empty." });
  }

  const tempDir = path.join(__dirname, "temp");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  let process;
  const filePath = path.join(tempDir, `script.${language}`);
  fs.writeFileSync(filePath, code);

  if (language === "cpp") {
    const outPath = path.join(tempDir, "a.out");
    const compile = spawn("g++", [filePath, "-o", outPath]);
    let compileError = "";
    compile.stderr.on("data", (data) => {
      compileError += data.toString();
    });
    compile.on("close", (code) => {
      if (code !== 0) {
        fs.unlinkSync(filePath);
        return res.json({ output: compileError });
      }
      const run = spawn(outPath);
      let output = "";
      let runError = "";
      run.stdin.write(input);
      run.stdin.end();
      run.stdout.on("data", (data) => {
        output += data.toString();
      });
      run.stderr.on("data", (data) => {
        runError += data.toString();
      });
      run.on("close", () => {
        fs.unlinkSync(filePath);
        fs.unlinkSync(outPath);
        res.json({ output: runError || output });
      });
    });
    return;
  }

  const command = language === "python" ? "python" : "node";
  process = spawn(command, [filePath]);

  let output = "";
  let error = "";

  process.stdin.write(input);
  process.stdin.end();

  process.stdout.on("data", (data) => {
    output += data.toString();
  });

  process.stderr.on("data", (data) => {
    error += data.toString();
  });

  process.on("close", (code) => {
    fs.unlinkSync(filePath);
    res.json({ output: error || output });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
