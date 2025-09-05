"use client";
import React, { useState } from "react";
import { useProtectedRoute } from "../../hooks/useAuthRedirect";

export default function ChatBot() {
  // All hooks must be called at the top level, before any conditional returns
  const [messages, setMessages] = useState<{ role: "user" | "bot"; text: string }[]>([]);
  const [input, setInput] = useState("");
  
  // Protect this route - redirect to sign-in if not authenticated
  const { isLoaded, isSignedIn } = useProtectedRoute();

  // Show loading state while checking authentication
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // This will only render if user is authenticated (hook handles redirect)
  if (!isSignedIn) {
    return null;
  }

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage = { role: "user" as const, text: input };
    setMessages((prev) => [...prev, userMessage]);

    // Fake bot response
    setTimeout(() => {
      const botMessage = { role: "bot" as const, text: `You said: ${input}` };
      setMessages((prev) => [...prev, botMessage]);
    }, 500);

    setInput("");
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto border rounded-lg shadow-lg">
      <div className="flex-1 p-4 overflow-y-auto space-y-2 bg-gray-50">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-2 rounded-xl max-w-[75%] ${
              msg.role === "user"
                ? "bg-blue-500 text-white self-end ml-auto"
                : "bg-gray-200 text-gray-900 self-start"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div className="p-3 flex gap-2 border-t bg-white">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={handleSend}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  );
}
