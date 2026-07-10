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
  const [isRecording, setIsRecording] = useState(false);
  const bottomRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const submitMessage = async (textOverride = null) => {
    const textToSubmit = textOverride || input;
    if (!textToSubmit.trim() || !session?.token) return;

    const userMessage = { role: 'user', content: textToSubmit };
    const currentHistory = [...messages, userMessage];
    
    setMessages(currentHistory);
    if (!textOverride) setInput('');
    setLoading(true);

    try {
      // 1. Hit core AI Agent
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

      const aiText = json.data.content;
      setMessages(prev => [...prev, json.data]);

      // 2. Automatically Voice the response using Deepgram!
      speakText(aiText);

    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `**Error:** ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const speakText = async (text) => {
     try {
       const res = await fetch('/api/ai/voice?action=speak', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ text })
       });
       if (res.ok) {
         const { audioBase64 } = await res.json();
         if (audioBase64) {
           const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
           audio.play().catch(e => console.error("Audio playback blocked:", e));
         }
       }
     } catch (e) {
       console.error("TTS Failed:", e);
     }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        chunksRef.current = [];
        await processAudio(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone', err);
      alert('Microphone access is required to use Voice AI.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
      setIsRecording(false);
    }
  };

  const processAudio = async (blob) => {
    setLoading(true);
    setInput('Listening & Transcribing...');
    try {
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');
      
      const res = await fetch('/api/ai/voice?action=transcribe', {
        method: 'POST',
        headers: {
          'x-business-id': session?.businessId || '',
          'Authorization': `Bearer ${session?.token || ''}`
        },
        body: formData
      });

      if (!res.ok) throw new Error('Voice recognition failed');
      const data = await res.json();
      
      setInput(''); // clear temp listening state
      
      if (data.transcribedText) {
         // Auto-submit the recognized text
         await submitMessage(data.transcribedText);
      }
    } catch (err) {
      console.error(err);
      setInput('');
      setMessages(prev => [...prev, { role: 'assistant', content: `**Error:** Could not process voice.` }]);
    } finally {
      setLoading(false);
    }
  };

  const parseConfirmationPayload = (content) => {
    try {
      const cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (parsed && parsed._type === 'ACTION_CONFIRMATION') return parsed;
    } catch { return null; }
    return null;
  };

  const handleConfirmAction = async (payloadObj, messageIndex) => {
    try {
      setLoading(true);
      const res = await fetch(payloadObj.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.token || ''}`,
          'x-business-id': session?.businessId || ''
        },
        body: JSON.stringify(payloadObj.payload)
      });
      if (!res.ok) throw new Error('Action failed');
      
      // Update that specific message to say it was completed
      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs[messageIndex] = { role: 'assistant', content: `[System] Action approved and succeeded.` };
        return newMsgs;
      });
      
      // Tell AI it was successful
      await submitMessage(`[System] Action approved and succeeded. Please summarize.`);
    } catch(e) {
      alert("Action failed: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Atlas AI Co-Pilot 🧠">
      <div className="flex flex-col h-[calc(100vh-140px)]">
        
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-4">
          {messages.map((m, i) => {
            const confirmation = m.role === 'assistant' ? parseConfirmationPayload(m.content) : null;
            
            if (confirmation) {
              return (
                <div key={i} className="flex justify-start">
                  <div className="max-w-[95%] p-4 rounded-xl text-sm shadow-[0_4px_20px_rgba(15,23,42,0.04)] bg-white border-2 border-[#B5995D]">
                    <div className="flex items-center gap-2 mb-3">
                       <span className="text-xl">⚠️</span>
                       <h3 className="font-bold text-[#0F172A] uppercase tracking-wide">Action Required</h3>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg mb-4 text-xs font-mono text-slate-700 overflow-x-auto border border-slate-200">
                      <p className="font-bold border-b border-slate-200 pb-2 mb-2">{confirmation.action}</p>
                      <pre>{JSON.stringify(confirmation.payload, null, 2)}</pre>
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => handleConfirmAction(confirmation, i)} className="px-4 py-2 bg-[#0F172A] text-white rounded-md hover:bg-slate-800 font-medium shadow-sm transition-all flex items-center justify-center gap-1 flex-1">✅ Confirm</button>
                       <button onClick={() => setMessages(prev => prev.filter((_, idx) => idx !== i))} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 font-medium transition-all flex items-center justify-center gap-1 flex-1">❌ Cancel</button>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[85%] p-3 rounded-xl text-sm shadow-[0_4px_20px_rgba(15,23,42,0.04)]
                    ${m.role === 'user' ? 'bg-[#0F172A] text-white' : 'bg-white text-slate-800 border border-slate-200'}`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                </div>
              </div>
            );
          })}
          
          {loading && (
            <div className="flex justify-start">
              <div className="max-w-[85%] p-3 rounded-lg text-sm bg-white text-slate-800 border border-slate-200 flex items-center gap-2 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
                <span className="w-2 h-2 bg-[#B5995D]/40 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-[#B5995D]/70 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                <span className="w-2 h-2 bg-[#B5995D] rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        
        {/* Input Form with Voice Button */}
        <form onSubmit={(e) => { e.preventDefault(); submitMessage(); }} className="pt-4 border-t border-slate-200 flex gap-2 items-center">
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
            placeholder={isRecording ? "Recording..." : "Ask Atlas..."}
            className={`flex-1 px-4 py-2.5 text-sm border rounded-full focus:outline-none focus:ring-2 shadow-sm transition-all ${isRecording ? 'border-red-400 bg-red-50 text-red-600 focus:ring-red-500 placeholder-red-400' : 'border-slate-300 bg-white focus:ring-[#B5995D]'}`}
          />
          <button 
            type="button" 
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onMouseLeave={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            disabled={loading}
            className={`p-2.5 rounded-full text-white transition-all select-none disabled:opacity-50 ${isRecording ? 'bg-red-500 scale-110 shadow-lg shadow-red-200' : 'bg-[#0F172A] hover:bg-slate-800'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
          </button>
          <button 
            type="submit" 
            disabled={loading || !input.trim()}
            className="p-2.5 bg-[#B5995D] text-white rounded-full hover:bg-[rgb(163,138,83)] disabled:opacity-50 transition-colors shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
          </button>
        </form>
      </div>
    </Drawer>
  );
}
