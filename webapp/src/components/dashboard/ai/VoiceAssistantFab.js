'use client';

import { useState, useRef } from 'react';
import { useBusinessContext } from '../../providers/BusinessProvider.js';

export default function VoiceAssistantFab() {
  const { session } = useBusinessContext();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [replyText, setReplyText] = useState('');
  
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

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
      setTranscript('Listening...');
      setReplyText('');
    } catch (err) {
      console.error('Error accessing microphone', err);
      alert('Microphone access is required to use the Voice Assistant.');
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
    setIsProcessing(true);
    setTranscript('Thinking...');
    try {
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');
      
      const res = await fetch('/api/ai/voice', {
        method: 'POST',
        headers: {
          'x-business-id': session?.businessId || '',
          'Authorization': `Bearer ${session?.token || ''}`
        },
        body: formData
      });

      if (!res.ok) throw new Error('Voice processing failed');
      
      const data = await res.json();
      
      // Update UI
      setTranscript(`You: "${data.transcribedText}"`);
      setReplyText(`${data.aiResponse}`);
      
      if (data.audioBase64) {
        // Play the TTS Deepgram audio response
        const audio = new Audio(`data:audio/mp3;base64,${data.audioBase64}`);
        audio.play().catch(e => console.error("Audio play blocked by browser", e));
      }
    } catch (err) {
      console.error(err);
      setTranscript('An error occurred.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-4">
      {/* Visual Feedback Popover */}
      {(isRecording || isProcessing || transcript || replyText) && (
        <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl p-4 w-72 origin-bottom-right transition-all">
          <div className="text-xs font-semibold text-indigo-600 mb-2">Atlas AI ✨</div>
          {transcript && (
            <div className="text-sm text-slate-700 italic mb-3 border-l-2 border-indigo-200 pl-2">
              {transcript}
            </div>
          )}
          {isProcessing && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" />
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce delay-75" />
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce delay-150" />
            </div>
          )}
          {replyText && (
            <div className="text-sm text-slate-900 font-medium bg-indigo-50 p-3 rounded-xl border border-indigo-100">
              {replyText}
            </div>
          )}
          {replyText && (
            <button 
              onClick={() => { setTranscript(''); setReplyText(''); }}
              className="mt-3 text-xs text-slate-400 hover:text-slate-600 w-full text-center"
            >
              Dismiss
            </button>
          )}
        </div>
      )}

      {/* Floating Action Button */}
      <button 
        onMouseDown={startRecording}
        onMouseUp={stopRecording}
        onMouseLeave={stopRecording}
        onTouchStart={startRecording}
        onTouchEnd={stopRecording}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 select-none ${isRecording ? 'bg-red-500 scale-110' : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105'}`}
      >
        {isRecording ? (
          <div className="flex gap-1 items-center justify-center">
             <div className="w-1.5 h-3 bg-white rounded-full animate-pulse" />
             <div className="w-1.5 h-5 bg-white rounded-full animate-pulse delay-75" />
             <div className="w-1.5 h-3 bg-white rounded-full animate-pulse delay-150" />
          </div>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
        )}
      </button>
    </div>
  );
}
