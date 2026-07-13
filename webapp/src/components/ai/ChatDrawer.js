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
                  <div className="max-w-[95%] p-5 rounded-2xl text-[13px] shadow-[0_4px_24px_rgba(0,0,0,0.08)] bg-white border border-slate-200/60">
                    <div className="flex items-center gap-2 mb-4">
                       <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></span>
                       <h3 className="font-extrabold text-slate-900 uppercase tracking-widest text-[11px]">Action Required</h3>
                    </div>
                    <div className="bg-slate-50/80 p-4 rounded-xl mb-5 text-[11px] font-mono text-slate-600 overflow-x-auto border border-slate-200/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                      <p className="font-bold border-b border-slate-200/60 pb-2 mb-2 uppercase tracking-wide text-slate-800">{confirmation.action}</p>
                      <pre>{JSON.stringify(confirmation.payload, null, 2)}</pre>
                    </div>
                    <div className="flex gap-3">
                       <button onClick={() => handleConfirmAction(confirmation, i)} className="px-4 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-black font-bold active:scale-95 transition-all flex items-center justify-center gap-1 flex-1 shadow-[0_4px_12px_rgba(0,0,0,0.1)]">✅ Confirm</button>
                       <button onClick={() => setMessages(prev => prev.filter((_, idx) => idx !== i))} className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 font-bold transition-all active:scale-95 flex items-center justify-center gap-1 flex-1">✕ Cancel</button>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[85%] p-4 rounded-[20px] text-[13px] font-medium leading-relaxed
                    ${m.role === 'user' ? 'bg-slate-900 text-white rounded-br-[6px] shadow-[0_4px_12px_rgba(0,0,0,0.1)]' : 'bg-slate-50 border border-slate-200/60 rounded-bl-[6px] text-slate-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]'}`}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            );
          })}
          
          {loading && (
            <div className="flex justify-start">
              <div className="max-w-[85%] p-4 rounded-[20px] rounded-bl-[6px] bg-slate-50 border border-slate-200/60 flex items-center gap-1.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-slate-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                <span className="w-1.5 h-1.5 bg-slate-900 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        
        {/* Input Form with Voice Button */}
        <form onSubmit={(e) => { e.preventDefault(); submitMessage(); }} className="pt-4 border-t border-slate-200/60 flex gap-2 items-center">
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
            placeholder={isRecording ? "Recording..." : "Ask Atlas..."}
            className={`flex-1 px-5 py-3.5 text-[13px] font-medium border rounded-full focus:outline-none transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] ${isRecording ? 'border-red-400 bg-red-50 text-red-600 focus:ring-1 focus:ring-red-500 placeholder-red-400' : 'border-slate-200/80 bg-slate-50/50 focus:bg-white focus:ring-1 focus:ring-slate-400 focus:border-slate-400'}`}
          />
          <button 
            type="button" 
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onMouseLeave={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            disabled={loading}
            className={`p-3.5 rounded-full transition-all select-none disabled:opacity-50 flex items-center justify-center ${isRecording ? 'bg-red-500 text-white scale-110 shadow-lg shadow-red-200' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 active:scale-95'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
          </button>
          <button 
            type="submit" 
            disabled={loading || !input.trim()}
            className="p-3.5 bg-slate-900 text-white rounded-full hover:bg-black disabled:opacity-50 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.1)] active:scale-95 flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
          </button>
        </form>
      </div>
    </Drawer>
  );
}
