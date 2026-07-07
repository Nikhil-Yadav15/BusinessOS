'use client';

import { useState, useRef, useEffect } from 'react';
import Drawer from '../ui/Drawer.js';
import { useBusinessContext } from '../providers/BusinessProvider.js';

export default function ChatDrawer({ isOpen, onClose }) {
  const { session } = useBusinessContext();
  const [messages, setMessages] = useState([{ 
    role: 'assistant', 
    content: 'Hello! I am Atlas, your AI Co-Pilot. I can help answer questions about your business, check your layout settings, look up customers, or draft autonomous workflows.\n\nWhat can I do for you today?' 
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || !session?.token) return;

    const userMessage = { role: 'user', content: input };
    const currentHistory = [...messages, userMessage];
    
    setMessages(currentHistory);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.token}`,
          'x-business-id': session.businessId
        },
        body: JSON.stringify({ messages: currentHistory })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'AI request failed');

      setMessages(prev => [...prev, json.data]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `**Error:** ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Atlas AI Co-Pilot 🧠">
      <div className="flex flex-col h-[calc(100vh-140px)]">
        
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[85%] p-3 rounded-lg text-sm shadow-sm
                  ${m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-800 border border-slate-200'}`}
              >
                {/* Minimalist Markdown rendering via pre-wrap for MVP formatting */}
                <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="max-w-[85%] p-3 rounded-lg text-sm bg-slate-100 text-slate-800 border border-slate-200 flex items-center gap-2 shadow-sm">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        
        {/* Input Form */}
        <form onSubmit={handleSubmit} className="pt-4 border-t border-slate-200 flex gap-2">
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
            placeholder="Ask Atlas about Sales, Rules, or Analytics..."
            className="flex-1 px-4 py-2 text-sm border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all bg-slate-50"
          />
          <button 
            type="submit" 
            disabled={loading || !input.trim()}
            className="px-5 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 font-medium text-sm transition-colors shadow-sm"
          >
            Send
          </button>
        </form>
      </div>
    </Drawer>
  );
}
