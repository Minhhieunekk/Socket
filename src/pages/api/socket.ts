import { Server } from "socket.io";
import type { NextApiRequest } from "next";
import type { Server as HTTPServer } from "http";
import type { Socket as NetSocket } from "net";

type NextApiResponseWithSocket = {
  socket: NetSocket & {
    server: HTTPServer & {
      io?: Server;
    };
  };
  end: () => void; 
};

export default function handler(_req: NextApiRequest, res: NextApiResponseWithSocket) { 
  if (res.socket.server.io) {
    res.end();
    return;
  }

  const io = new Server(res.socket.server, {
    path: "/api/socket",
    addTrailingSlash: false,
  });

  res.socket.server.io = io;

  io.on("connection", (socket) => {
    console.log("✅ Client connected:", socket.id);

    socket.on("message", (msg) => {
      console.log("Message received:", msg);
      io.emit("message", msg);
    });
  });

  res.end();
}
