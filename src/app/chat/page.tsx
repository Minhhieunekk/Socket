'use client';

import { useEffect, useRef, useState } from 'react';
import io  from 'socket.io-client';
import {  Socket } from 'socket.io-client';

export default function HomePage() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const socketRef = useRef<typeof Socket | null>(null);

  useEffect(() => {
    const setupSocket = async () => {
      await fetch("/api/socket"); 
      const socket = io({ path: "/api/socket" });
      socketRef.current = socket;

      socket.on("connect", () => {
        console.log("✅ Socket connected", socket.id);
      });

      socket.on("message", (msg: string) => {
        setMessages((prev) => [...prev, msg]);
      });
    };

    setupSocket();

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const sendMessage = () => {
    const socket = socketRef.current;
    if (socket && input.trim()) {
      socket.emit("message", input);
      setInput("");
    }
  };

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Socket.IO Chat</h1>
      <input
        className="border p-2 mr-2"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message..."
      />
      <button className="bg-blue-500 text-white p-2" onClick={sendMessage}>
        Send
      </button>

      <div className="mt-4">
        {messages.map((msg, i) => (
          <p key={i}>{msg}</p>
        ))}
      </div>
    </main>
  );
}
