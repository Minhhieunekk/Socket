import { Server } from "socket.io";
import type { NextApiRequest } from "next";
import type { Server as HTTPServer } from "http";
import type { Socket as NetSocket } from "net";

type NextApiResponseWithSocket = {
  socket: NetSocket & {
    server: HTTPServer & { io?: Server };
  };
  end: () => void;
};

export default function handler(_req: NextApiRequest, res: NextApiResponseWithSocket) {
  // If socket server already exists, no need to recreate it
  if (res.socket.server.io) {
    res.end();
    return;
  }

  // Create a new Socket.IO server
  const io = new Server(res.socket.server, {
    path: "/api/socket",
    addTrailingSlash: false,
  });
  res.socket.server.io = io;

  io.on("connection", (socket) => {
    console.log("✅ Client connected:", socket.id);

    // Listen for join events to assign users to a room
    socket.on("join", (data: { room: string; username: string }) => {
      const { room, username } = data;
      socket.join(room);
      console.log(`User ${username} joined room ${room}`);
      // Send a system message to others in the room
      socket.to(room).emit("message", { username: "System", message: `${username} joined the room.` });
    });

    // Listen for messages and broadcast them to a specific room
    socket.on("message", (data: { room: string; username: string; message: string }) => {
      console.log("Message received:", data);
      io.to(data.room).emit("message", { username: data.username, message: data.message });
    });
  });

  res.end();
}
