import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { sendChatMessage } from '../services/employeeService';
import { sendAdminChatMessage } from '../services/adminService';
import './AiChatWidget.css';

const AiChatWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', text: 'Hello! I am your AI HR Assistant. How can I help you with leave balances, timesheets, or HR policies today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const isAdmin = user?.roles?.includes('ROLE_ADMIN');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg = { role: 'user', text: trimmed };
    const currentHistory = [...messages];

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      let res;
      if (isAdmin) {
        res = await sendAdminChatMessage(trimmed, currentHistory);
      } else {
        res = await sendChatMessage(trimmed, currentHistory);
      }

      const botReply = res?.reply || "Sorry, I couldn't process that right now.";
      setMessages((prev) => [...prev, { role: 'model', text: botReply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'model', text: "Sorry, I couldn't process that right now." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Toggle Button */}
      <button
        className="ai-chat-fab"
        onClick={() => setIsOpen((prev) => !prev)}
        title={isOpen ? 'Close HR Assistant' : 'Open HR Assistant'}
        aria-label="Toggle HR Assistant Chat"
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        )}
      </button>

      {/* Backdrop Overlay for quick dismiss */}
      {isOpen && (
        <div
          className="ai-chat-backdrop"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Expandable Chat Card */}
      {isOpen && (
        <div className="ai-chat-panel">
          {/* Header */}
          <div className="ai-chat-header">
            <div className="ai-chat-header-info">
              <div className="ai-chat-avatar-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a10 10 0 1 0 10 10H12V2z"></path>
                  <path d="M12 12L2.5 7.5"></path>
                  <path d="M12 12v10"></path>
                </svg>
              </div>
              <div className="ai-chat-title-group">
                <h4 className="ai-chat-title">HR Assistant</h4>
                <span className="ai-chat-subtitle">
                  <span className="ai-chat-status-dot"></span> Powered by Gemini
                </span>
              </div>
            </div>
            <button
              className="ai-chat-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close Chat"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div className="ai-chat-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`ai-chat-msg ${msg.role === 'user' ? 'user' : 'model'}`}
              >
                {msg.text}
              </div>
            ))}

            {isLoading && (
              <div className="ai-chat-typing">
                <div className="ai-chat-dot"></div>
                <div className="ai-chat-dot"></div>
                <div className="ai-chat-dot"></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Bar */}
          <form className="ai-chat-footer" onSubmit={handleSend}>
            <input
              type="text"
              className="ai-chat-input"
              placeholder="Ask a question about HR..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="submit"
              className="ai-chat-send-btn"
              disabled={!input.trim() || isLoading}
              title="Send Message"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AiChatWidget;
