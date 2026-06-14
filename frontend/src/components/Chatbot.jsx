import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../config/api";

export default function Chatbot() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Hi! I'm CertBot 🤖 I can help you with certificate verification, understanding results, and using this platform. What do you need help with?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!user) return null;

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);
    try {
      const data = await apiRequest("/chatbot/ask", {
        method: "POST",
        body: JSON.stringify({ message: userMsg, context: `User is a ${user.role}` }),
      });
      setMessages((prev) => [...prev, { role: "bot", text: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Sorry, I encountered an error. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className={`chatbot-fab ${open ? "active" : ""}`}
        onClick={() => setOpen(!open)}
      >
        {open ? "✕" : "💬"}
      </button>
      {open && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <span>🤖 CertBot AI</span>
            <button type="button" onClick={() => setOpen(false)}>
              ✕
            </button>
          </div>
          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chatbot-msg ${msg.role}`}>
                <p>{msg.text}</p>
              </div>
            ))}
            {loading && (
              <div className="chatbot-msg bot">
                <p>Typing...</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="chatbot-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask me anything..."
              disabled={loading}
            />
            <button type="button" onClick={sendMessage} disabled={loading}>
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
