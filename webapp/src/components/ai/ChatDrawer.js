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
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const bottomRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Clean active speech synthesis when closing or muting
  useEffect(() => {
    if (!isOpen || !voiceEnabled) {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    }
  }, [isOpen, voiceEnabled]);

  // Text-To-Speech Response playback (using native browser SpeechSynthesis)
  const speakResponse = (text) => {
    if (!voiceEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;

    // Cancel current speaking items
    window.speechSynthesis.cancel();

    // Remove markdown formatting / symbols to sound natural
    const cleanText = text
      .replace(/[\*\#\`\-\|]/g, '')
      .replace(/\n+/g, ' ');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    window.speechSynthesis.speak(utterance);
  };

  // Speech-To-Text: Start capturing audio
  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support media device recording.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        // Clean up active microphone resources
        stream.getTracks().forEach(track => track.stop());
        
        await transcribeAudio(audioBlob);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting audio recording:', err);
      alert('Microphone access error: ' + err.message);
    }
  };

  // Speech-To-Text: Stop capturing and trigger transcription
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Call backend transcription API
  const transcribeAudio = async (audioBlob) => {
    if (!session?.token) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'voice.webm');

      const res = await fetch('/api/ai/transcribe', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.token}`,
          'x-business-id': session.businessId
        },
        body: formData
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Transcription failed.');
      
      const text = json.data?.text || '';
      if (text.trim()) {
        setInput(prev => prev ? prev + ' ' + text : text);
      }
    } catch (err) {
      console.error('Transcription failed:', err);
      setMessages(prev => [...prev, { role: 'assistant', content: `**Transcription Error:** ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

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
      
      // Auto-vocalize response if voice toggle is active
      if (json.data?.content) {
        speakResponse(json.data.content);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `**Error:** ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  // Header Title component with Title + Speak button toggle
  const headerTitle = (
    <div className="flex items-center gap-3">
      <span className="text-slate-900 font-bold">Atlas AI Co-Pilot 🧠</span>
      <button 
        onClick={() => setVoiceEnabled(!voiceEnabled)}
        className={`p-1.5 rounded-lg transition-all border flex items-center justify-center cursor-pointer select-none active:scale-[0.96] ${
          voiceEnabled 
            ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm' 
            : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-100'
        }`}
        title={voiceEnabled ? "Mute voice response" : "Enable voice response"}
      >
        {voiceEnabled ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="22" x2="16" y1="9" y2="15"/><line x1="16" x2="22" y1="9" y2="15"/></svg>
        )}
      </button>
    </div>
  );

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={headerTitle}>
      <div className="flex flex-col h-[calc(100vh-140px)]">
        
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[85%] p-3 rounded-2xl text-xs shadow-sm font-medium leading-relaxed
                  ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800 border border-slate-200/80'}`}
              >
                <p className="whitespace-pre-wrap">{m.content}</p>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="max-w-[85%] p-3 rounded-2xl text-xs bg-slate-100 text-slate-800 border border-slate-200/80 flex items-center gap-2 shadow-sm">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        
        {/* Input Form */}
        <form onSubmit={handleSubmit} className="pt-4 border-t border-slate-100 flex gap-2 items-center shrink-0">
          <div className="relative flex-1 flex items-center">
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading}
              placeholder={isRecording ? "Listening... Speak, then tap the mic to stop." : "Ask Atlas about Sales, Rules, or Analytics..."}
              className="w-full pl-4 pr-12 py-2.5 text-xs border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent shadow-sm transition-all bg-slate-50 text-slate-900 placeholder:text-slate-400 font-medium"
            />
            {/* Mic recording control */}
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              className={`absolute right-1 w-8 h-8 rounded-full flex items-center justify-center transition-all select-none active:scale-[0.95] cursor-pointer ${
                isRecording 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600'
              }`}
              title={isRecording ? "Stop recording" : "Speak question"}
            >
              {isRecording ? (
                <span className="w-2 h-2 bg-white rounded-full"></span>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v1a7 7 0 0 1-14 0v-1"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
              )}
            </button>
          </div>
          <button 
            type="submit" 
            disabled={loading || !input.trim()}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full disabled:opacity-50 font-bold text-xs transition-all shadow-sm active:scale-[0.96] flex items-center justify-center cursor-pointer min-h-[38px]"
          >
            Send
          </button>
        </form>
      </div>
    </Drawer>
  );
}
