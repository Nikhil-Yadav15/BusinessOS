import { NextResponse } from 'next/server';
import { cleanTextForSpeech } from '../../../../application/ai/speechSanitizer.js';
import { buildCoPilot } from '../../../../application/ai/agent.js';
import { getAuthContext } from '../../../../infrastructure/context/authContext.js';

export async function POST(request) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    // 1. Transcribe audio to text only
    if (action === 'transcribe') {
      const formData = await request.formData();
      const audioBlob = formData.get('audio');
      
      if (!audioBlob) return NextResponse.json({ error: 'No audio provided' }, { status: 400 });

      const buffer = Buffer.from(await audioBlob.arrayBuffer());

      const sttResponse = await fetch('https://api.deepgram.com/v1/listen?model=nova-2&detect_language=true', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`,
          'Content-Type': audioBlob.type || 'audio/webm'
        },
        body: buffer
      });

      if (!sttResponse.ok) {
        throw new Error(`Deepgram STT failed: ${await sttResponse.text()}`);
      }

      const sttResult = await sttResponse.json();
      const transcribedText = sttResult.results?.channels?.[0]?.alternatives?.[0]?.transcript;
      return NextResponse.json({ transcribedText: transcribedText || '' });
    } 
    
    // 2. Synthesize text to spoken audio (TTS) with Markdown Sanitization
    if (action === 'speak') {
      const { text } = await request.json();
      if (!text) return NextResponse.json({ error: 'No text provided' }, { status: 400 });

      // Clean markdown asterisks, hashtags, backticks, bullet points before sending to Deepgram TTS
      const cleanSpeechText = cleanTextForSpeech(text);
      if (!cleanSpeechText) {
        return NextResponse.json({ audioBase64: '' });
      }

      const ttsResponse = await fetch('https://api.deepgram.com/v1/speak?model=aura-asteria-en', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: cleanSpeechText })
      });

      if (!ttsResponse.ok) {
         throw new Error(`Deepgram TTS failed: ${await ttsResponse.text()}`);
      }

      const audioBuffer = await ttsResponse.arrayBuffer();
      const base64Audio = Buffer.from(audioBuffer).toString('base64');
      return NextResponse.json({ audioBase64: base64Audio });
    }

    // 3. Full End-to-End Voice Assistant Pipeline (used by VoiceAssistantFab)
    const formData = await request.formData();
    const audioBlob = formData.get('audio');
    if (!audioBlob) return NextResponse.json({ error: 'No audio provided' }, { status: 400 });

    const buffer = Buffer.from(await audioBlob.arrayBuffer());

    // Step A: Transcribe audio
    const sttResponse = await fetch('https://api.deepgram.com/v1/listen?model=nova-2&detect_language=true', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`,
        'Content-Type': audioBlob.type || 'audio/webm'
      },
      body: buffer
    });

    if (!sttResponse.ok) throw new Error(`Deepgram STT failed: ${await sttResponse.text()}`);
    const sttResult = await sttResponse.json();
    const transcribedText = sttResult.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';

    if (!transcribedText.trim()) {
      return NextResponse.json({ transcribedText: '', aiResponse: 'I did not catch that. Could you please repeat?', audioBase64: '' });
    }

    // Step B: Pass transcript to AI Agent
    const businessId = request.headers.get('x-business-id') || '';
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    const executionContext = getAuthContext(token, businessId);

    const agent = await buildCoPilot(executionContext);
    const graphRes = await agent.invoke({
      messages: [{ role: 'user', content: transcribedText }]
    });

    const finalMessage = graphRes.messages[graphRes.messages.length - 1];
    const aiResponse = finalMessage.content || '';

    // Step C: Sanitize markdown for TTS audio synthesis
    const speechText = cleanTextForSpeech(aiResponse);
    let base64Audio = '';

    if (speechText && process.env.DEEPGRAM_API_KEY) {
      const ttsResponse = await fetch('https://api.deepgram.com/v1/speak?model=aura-asteria-en', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: speechText })
      });

      if (ttsResponse.ok) {
        const audioBuffer = await ttsResponse.arrayBuffer();
        base64Audio = Buffer.from(audioBuffer).toString('base64');
      }
    }

    return NextResponse.json({
      transcribedText,
      aiResponse,
      audioBase64: base64Audio
    });

  } catch (err) {
    console.error('AI Voice Proxy Error:', err);
    return NextResponse.json({ error: err.message || 'Processing failed' }, { status: 500 });
  }
}
