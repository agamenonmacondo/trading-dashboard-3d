"use client";
import { useEffect, useState } from 'react';

type Message = {
  author: string;
  text: string;
  timestamp: string;
};

export default function ConversationLog() {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    fetch('/api/conversations')
      .then((res) => res.json())
      .then(setMessages)
      .catch((err) => console.error('Failed to load conversations', err));
  }, []);

  return (
    <div className="p-4 bg-gray-800 text-white rounded-md w-full max-w-4xl mb-4">
      <h2 className="text-xl font-bold mb-2">Conversaciones Recientes</h2>
      <ul className="flex flex-row md:flex-col gap-2">
        {messages.map((msg, idx) => (
          <li
            key={idx}
            className="flex-1 min-w-[150px] p-2 bg-gray-700 rounded"
          >
            <div className="font-semibold">{msg.author}</div>
            <div>{msg.text}</div>
            <div className="text-xs text-gray-400">
              {new Date(msg.timestamp).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
