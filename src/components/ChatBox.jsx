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
              className={
                `relative max-w-[80%] px-4 py-3 rounded-2xl text-base whitespace-pre-line break-words transition-all ` +
                (msg.role === 'user'
                  ? 'bg-[#11a37f] text-white rounded-br-md font-semibold'
                  : 'assistant-bubble')
              }
              style={
                msg.role === 'user'
                  ? { boxShadow: '0 2px 8px 0 rgba(225, 235, 233, 0.55)' }
                  : { background: 'var(--assistant-bubble-bg, #f3f4f6)', color: 'var(--assistant-bubble-text, #222)', boxShadow: '0 2px 12px 0 rgba(0,0,0,0.10)', border: '0.5px solid var(--assistant-bubble-border, #f1f1f1)' }
              }
            >
              {msg.role === 'assistant' && typeof msg.content === 'string' ? (
                <span
                  dangerouslySetInnerHTML={{
                    __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  }}
                />
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex mb-4 justify-start">
            <div className="max-w-[80%] px-4 py-3 rounded-2xl text-base animate-pulse assistant-bubble" style={{ boxShadow: '0 2px 12px 0 rgba(0,0,0,0.10)', border: '0.5px solid var(--assistant-bubble-border, #f1f1f1)' }}>
              <span className="opacity-70">Thinking…</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form
        onSubmit={e => { e.preventDefault(); if (!loading) onSend(); }}
        className="px-4 py-4 flex items-center gap-2 sticky bottom-0 w-full mx-auto"
        style={{ boxShadow: '0 -2px 12px 0 rgba(195, 174, 174, 0.08)', background: 'var(--background)', color: 'var(--foreground)', borderRadius: '0 0 1rem 1rem' }}
      >
        <input
          type="text"
          className="flex-1 border border-zinc-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition placeholder:text-zinc-400"
          style={{ background: 'var(--background)', color: 'var(--foreground)' }}
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
      <style jsx global>{`
        .assistant-bubble {
          background: var(--assistant-bubble-bg, #f3f4f6);
          color: var(--assistant-bubble-text, #222);
          font-size: 1.05rem;
          font-weight: 500;
          line-height: 1.7;
          --assistant-bubble-border: #f1f1f1;
        }
        html.dark .assistant-bubble {
          --assistant-bubble-bg: #23272f;
          --assistant-bubble-text: #fff;
          --assistant-bubble-border: #2a2d32;
        }
      `}</style>
    </div>
  );
}

export default ChatBox; 