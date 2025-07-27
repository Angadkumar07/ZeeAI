"use client";
import React, { useRef, useEffect, useState } from 'react';
import { create } from 'zustand';
import dynamic from 'next/dynamic';

const ChatBox = dynamic(() => import('../components/ChatBox'), { ssr: false });

const initialMessages = [
  { role: 'system', content: 'Be precise and concise.' }
];

// Zustand store for chat
const useChatStore = create((set) => ({
  messages: initialMessages,
  setMessages: (msgs) => set({ messages: msgs }),
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  reset: () => set({ messages: initialMessages }),
}));

export default function Home() {
  const messages = useChatStore((state) => state.messages);
  const setMessages = useChatStore((state) => state.setMessages);
  const addMessage = useChatStore((state) => state.addMessage);
  const reset = useChatStore((state) => state.reset);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [error, setError] = useState("");
  const [model] = useState("sonar-pro"); 
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState('dark');

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Update theme and persist
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  useEffect(() => {
    setHydrated(true);
  }, []);

  // Hydrate from localStorage
  useEffect(() => {
    if (!hydrated) return;
    const saved = localStorage.getItem("chat-messages");
    if (saved) {
      let loaded = JSON.parse(saved);
      // Remove any leading assistant messages
      while (loaded.length && loaded[0].role === "assistant") {
        loaded.shift();
      }
      // If the first message is not system or user, reset
      if (!loaded.length || (loaded[0].role !== "system" && loaded[0].role !== "user")) {
        loaded = initialMessages;
      }
      setMessages(loaded);
    }
  }, [setMessages, hydrated]);

  // Persist to localStorage
  useEffect(() => {
    if (hydrated) {
      localStorage.setItem("chat-messages", JSON.stringify(messages));
    }
  }, [messages, hydrated]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    setError("");
    setLoading(true);

    // Prepare the new message array for the API
    const newMessages = [...messages, { role: "user", content: input }];

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          model,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "API error");
      }
      const data = await res.json();
      // Add both user and assistant messages to state
      addMessage({ role: "user", content: input });
      if (data.choices && data.choices[0] && data.choices[0].message) {
        addMessage(data.choices[0].message);
      } else if (data.reply) {
        addMessage({ role: "assistant", content: data.reply });
      } else {
        addMessage({ role: "assistant", content: "[No reply from assistant]" });
      }
      setInput("");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      addMessage({ role: "assistant", content: "[Error: " + (err.message || "Unknown error") + "]" });
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages(initialMessages);
    localStorage.removeItem("chat-messages");
    setInput("");
    setError("");
  };

  if (!hydrated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-[#18181b] text-white font-sans overflow-x-hidden">
      {/* Mobile sidebar toggle button */}
      <button
        className="sm:hidden fixed top-4 left-4 z-30 bg-[#202123] p-2 rounded-lg border border-zinc-700 text-white focus:outline-none"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
      >
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      {/* Desktop sidebar */}
      <aside
        className="hidden sm:flex flex-col w-64 bg-[#202123] border-r border-zinc-800 p-4 gap-4 h-full sticky top-0 left-0 z-20 scrollbar-none"
        style={{ scrollbarWidth: 'none' }}
      >
        {/* Logo and name, always visible */}
        <div className="flex items-center gap-3 mb-0 sm:mb-6">
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="22" cy="22" r="22" fill="#10A37F" />
            <g>
              <path d="M32.5 22c0-1.1-.9-2-2-2h-2.1c-.5 0-.9-.4-.9-.9v-2.1c0-1.1-.9-2-2-2s-2 .9-2 2v2.1c0 .5-.4.9-.9.9h-2.1c-1.1 0-2 .9-2 2s.9 2 2 2h2.1c.5 0 .9.4.9.9v2.1c0 1.1.9 2 2 2s2-.9 2-2v-2.1c0-.5.4-.9.9-.9h2.1c1.1 0 2-.9 2-2z" fill="#fff"/>
              <path d="M22 12.5c-5.2 0-9.5 4.3-9.5 9.5s4.3 9.5 9.5 9.5 9.5-4.3 9.5-9.5-4.3-9.5-9.5-9.5zm0 17c-4.1 0-7.5-3.4-7.5-7.5S17.9 14.5 22 14.5 29.5 17.9 29.5 22 26.1 29.5 22 29.5z" fill="#fff"/>
              <path d="M22 17.5c-2.5 0-4.5 2-4.5 4.5s2 4.5 4.5 4.5 4.5-2 4.5-4.5-2-4.5-4.5-4.5zm0 7c-1.4 0-2.5-1.1-2.5-2.5S20.6 19.5 22 19.5s2.5 1.1 2.5 2.5-1.1 2.5-2.5 2.5z" fill="#10A37F"/>
            </g>
          </svg>
          <span className="text-2xl font-bold text-white tracking-tight select-none">Zee AI</span>
        </div>
        {/* New Chat button, always visible */}
        <button
          onClick={handleNewChat}
          className="flex items-center gap-2 px-4 py-3 rounded-lg bg-[#343541] hover:bg-[#444654] border border-zinc-700 text-base font-medium transition focus:outline-none focus:ring-2 focus:ring-[#11a37f] ml-auto sm:ml-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="inline-block">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New chat
        </button>
        {/* Hide chat list and footer on mobile, show on desktop */}
        <div className="mt-6 text-xs text-zinc-400 uppercase tracking-wider hidden sm:block">Chats</div>
        <div className="flex-1 overflow-y-hidden mt-2 space-y-2 scrollbar-none hidden sm:block" style={{ scrollbarWidth: 'none' }}>
          <div className="bg-[#353740] rounded-md px-3 py-2 text-sm text-white cursor-pointer">New chat</div>
          {/* Placeholder for chat list */}
        </div>
        <div className="mt-auto pt-4 border-t border-zinc-800 text-xs text-zinc-500 hidden sm:block">Angad kumar<br/>Free</div>
      </aside>

      {/* Mobile sidebar drawer overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex">
          {/* Overlay background */}
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
          <aside className="flex flex-col w-64 bg-[#202123] border-r border-zinc-800 p-4 gap-4 h-full z-50 animate-slide-in-left">
            <div className="flex items-center gap-3 mb-6">
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="22" cy="22" r="22" fill="#10A37F" />
                <g>
                  <path d="M32.5 22c0-1.1-.9-2-2-2h-2.1c-.5 0-.9-.4-.9-.9v-2.1c0-1.1-.9-2-2-2s-2 .9-2 2v2.1c0 .5-.4.9-.9.9h-2.1c-1.1 0-2 .9-2 2s.9 2 2 2h2.1c.5 0 .9.4.9.9v2.1c0 1.1.9 2 2 2s2-.9 2-2v-2.1c0-.5.4-.9.9-.9h2.1c1.1 0 2-.9 2-2z" fill="#fff"/>
                  <path d="M22 12.5c-5.2 0-9.5 4.3-9.5 9.5s4.3 9.5 9.5 9.5 9.5-4.3 9.5-9.5-4.3-9.5-9.5-9.5zm0 17c-4.1 0-7.5-3.4-7.5-7.5S17.9 14.5 22 14.5 29.5 17.9 29.5 22 26.1 29.5 22 29.5z" fill="#fff"/>
                  <path d="M22 17.5c-2.5 0-4.5 2-4.5 4.5s2 4.5 4.5 4.5 4.5-2 4.5-4.5-2-4.5-4.5-4.5zm0 7c-1.4 0-2.5-1.1-2.5-2.5S20.6 19.5 22 19.5s2.5 1.1 2.5 2.5-1.1 2.5-2.5 2.5z" fill="#10A37F"/>
                </g>
              </svg>
              <span className="text-2xl font-bold text-white tracking-tight select-none">Zee AI</span>
            </div>
            <button
              onClick={handleNewChat}
              className="flex items-center gap-2 px-4 py-3 rounded-lg bg-[#343541] hover:bg-[#444654] border border-zinc-700 text-base font-medium transition focus:outline-none focus:ring-2 focus:ring-[#11a37f] ml-auto sm:ml-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="inline-block">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New chat
            </button>
            <div className="mt-6 text-xs text-zinc-400 uppercase tracking-wider">Chats</div>
            <div className="flex-1 overflow-y-hidden mt-2 space-y-2 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
              <div className="bg-[#353740] rounded-md px-3 py-2 text-sm text-white cursor-pointer">New chat</div>
              {/* Placeholder for chat list */}
            </div>
            <div className="mt-auto pt-4 border-t border-zinc-800 text-xs text-zinc-500">Angad kumar<br/>Free</div>
            <button
              className="absolute top-4 right-4 text-white bg-[#343541] rounded-full p-2 border border-zinc-700"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </aside>
        </div>
      )}
      {/* Main chat area */}
      <div className="flex flex-col flex-1 h-full max-w-4xl mx-auto">
        <header className="py-4 px-6 border-b border-zinc-800 bg-[#202123] text-lg font-bold flex items-center justify-between shadow-sm sticky top-0 z-10">
          <span className="tracking-tight text-center w-full sm:w-auto">ChatGPT UI Clone</span>
          <button
            onClick={toggleTheme}
            className="ml-4 p-2 rounded-full border border-zinc-700 bg-[#343541] hover:bg-[#444654] text-white focus:outline-none focus:ring-2 focus:ring-[#11a37f]"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m8.66-12.66l-.71.71M4.05 19.95l-.71.71M21 12h-1M4 12H3m16.66 4.66l-.71-.71M4.05 4.05l-.71-.71M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
              </svg>
            )}
          </button>
        </header>
        
        {error && (
          <div className="bg-red-500 text-white px-4 py-2 text-center">{error}</div>
        )}
        <div className="flex-1 overflow-y-scroll hide-scrollbar max-h-screen">
          <ChatBox
            messages={messages}
            input={input}
            setInput={setInput}
            onSend={handleSend}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
