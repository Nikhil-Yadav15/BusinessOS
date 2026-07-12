import { withExecutionContext } from '../../../../infrastructure/context/withExecutionContext.js';
import { withApiHandler } from '../../../../infrastructure/context/withApiHandler.js';
import { StandardResponse } from '../../../../application/common/StandardResponse.js';

export const POST = withExecutionContext(
  withApiHandler(async (req, { executionContext }) => {
    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) {
      throw new Error("Deepgram API Key is not configured in the environment.");
    }

    const formData = await req.formData();
    const file = formData.get('file');
    
    if (!file) {
      throw new Error("No audio file was uploaded.");
    }

    // Convert file to buffer for API dispatch
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log(`[STT] Sending audio chunk (${buffer.length} bytes) to Deepgram Nova-2...`);

    const deepgramResponse = await fetch('https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': file.type || 'audio/wav',
      },
      body: buffer
    });

    if (!deepgramResponse.ok) {
      const errBody = await deepgramResponse.text();
      console.error("[STT] Deepgram transcription failed:", errBody);
      throw new Error(`Deepgram transcription service error: ${deepgramResponse.statusText}`);
    }

    const data = await deepgramResponse.json();
    const transcript = data.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';

    console.log(`[STT] Transcription result: "${transcript}"`);

    return Response.json(StandardResponse.success({
      text: transcript
    }));
  })
);
