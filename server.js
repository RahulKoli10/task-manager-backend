import dotenv from "dotenv";
dotenv.config();

import http from "http";
import { Server } from "socket.io";
import connectDB from "./src/config/db.js";
import app from "./app.js";

/* ================= DB ================= */
connectDB();

/* ================= SERVER ================= */
const server = http.createServer(app);

/* ================= SOCKET ================= */

const allowedOrigins = [
  "http://localhost:3000",
  process.env.CLIENT_URL,
];

const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

/* Make io available globally */
app.set("io", io);

/* ================= START ================= */

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
