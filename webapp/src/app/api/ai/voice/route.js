import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    if (action === 'transcribe') {
      const formData = await request.formData();
      const audioBlob = formData.get('audio');
      
      if (!audioBlob) return NextResponse.json({ error: 'No audio provided' }, { status: 400 });

      // Convert Blob to raw buffer for Deepgram
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
    
    if (action === 'speak') {
      const { text } = await request.json();
      if (!text) return NextResponse.json({ error: 'No text provided' }, { status: 400 });

      const ttsResponse = await fetch('https://api.deepgram.com/v1/speak?model=aura-asteria-en', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
      });

      if (!ttsResponse.ok) {
         throw new Error(`Deepgram TTS failed: ${await ttsResponse.text()}`);
      }

      const audioBuffer = await ttsResponse.arrayBuffer();
      const base64Audio = Buffer.from(audioBuffer).toString('base64');
      return NextResponse.json({ audioBase64: base64Audio });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (err) {
    console.error('AI Voice Proxy Error:', err);
    return NextResponse.json({ error: err.message || 'Processing failed' }, { status: 500 });
  }
}
