import React, { useRef, useEffect } from 'react';

function ChatBox({ messages, input, setInput, onSend, loading }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !loading) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-2 sm:px-0 py-6 sm:py-8 w-full mx-auto">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex mb-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`relative max-w-[80%] px-4 py-3 rounded-2xl shadow-md text-base whitespace-pre-line break-words transition-all
                ${msg.role === 'user'
                  ? 'bg-[#2a2b32] text-white rounded-br-md'
                  : 'bg-[#444654] text-[#ececf1] rounded-bl-md border border-zinc-700'}
              `}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex mb-4 justify-start">
            <div className="max-w-[80%] px-4 py-3 rounded-2xl shadow-md text-base bg-[#444654] text-[#ececf1] border border-zinc-700 animate-pulse">
              <span className="opacity-70">Thinking…</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form
        onSubmit={e => { e.preventDefault(); if (!loading) onSend(); }}
        className="bg-[#202123] border-t border-zinc-800 px-4 py-4 flex items-center gap-2 sticky bottom-0 w-full mx-auto"
        style={{ boxShadow: '0 -2px 8px 0 rgba(0,0,0,0.08)' }}
      >
        <input
          type="text"
          className="flex-1 bg-[#343541] border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition placeholder:text-zinc-400"
          placeholder="Type your message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          disabled={loading}
        />
        <button
          type="submit"
          className="bg-[#11a37f] hover:bg-[#13c08b] text-white px-6 py-3 rounded-xl font-semibold transition shadow-md focus:outline-none focus:ring-2 focus:ring-[#11a37f] disabled:opacity-60"
          disabled={loading || !input.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default ChatBox; 