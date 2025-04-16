'use client';

import { useEffect, useRef, useState } from 'react';
import io, { Socket } from 'socket.io-client'; // Import both the default and the Socket type
import { useParams } from 'next/navigation';

interface ChatMessage {
  username: string;
  message: string;
}

export default function HomePage() {
  const params = useParams(); // Get params
  const chatId = typeof params?.chatId === 'string' ? params.chatId : ''; // Type-safe chatId
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [username, setUsername] = useState('');
  const [joined, setJoined] = useState(false);
  const socketRef = useRef<ReturnType<typeof io> | null>(null); // Now Socket is correctly typed

  useEffect(() => {
    const setupSocket = async () => {
      await fetch('/api/socket');
      const socket = io({ path: '/api/socket' });
      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('✅ Socket connected', socket.id);
      });

      socket.on('message', (data: ChatMessage) => {
        setMessages((prev) => [...prev, data]);
      });
    };

    setupSocket();

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  // Function to join a chat room using the room id and username
  const joinRoom = () => {
    const socket = socketRef.current;
    if (socket && username.trim() && chatId) {
      socket.emit('join', { room: chatId, username });
      setJoined(true);
    }
  };

  // Function to send messages to a specific room
  const sendMessage = () => {
    const socket = socketRef.current;
    if (socket && input.trim() && joined && chatId) {
      const data: ChatMessage = { username, message: input };
      socket.emit('message', { room: chatId, ...data });
      setInput('');
    }
  };

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Room: {chatId || 'No Room'}</h1>
      {!joined ? (
        <div className="mb-4">
          <input
            className="border p-2 mr-2"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username..."
          />
          <button className="bg-green-500 text-white p-2" onClick={joinRoom}>
            Join Chat
          </button>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <input
              className="border p-2 mr-2"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
            />
            <button className="bg-blue-500 text-white p-2" onClick={sendMessage}>
              Send
            </button>
          </div>

          <div>
            {messages.map((msg, i) => (
              <p key={i}>
                <strong>{msg.username}:</strong> {msg.message}
              </p>
            ))}
          </div>
        </>
      )}
    </main>
  );
}