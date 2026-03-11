import { NextRequest, NextResponse } from 'next/server';

const DEEPINFRA_API_KEY = process.env.DEEPINFRA_API_KEY;
const WHISPER_MODEL = process.env.DEEPINFRA_WHISPER_MODEL || 'openai/whisper-large-v3-turbo';

export async function POST(req: NextRequest) {
  if (!DEEPINFRA_API_KEY) {
    return NextResponse.json(
      { error: 'DEEPINFRA_API_KEY is not configured' },
      { status: 500 }
    );
  }

  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File | null;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Forward audio to DeepInfra Whisper endpoint
    const deepinfraForm = new FormData();
    deepinfraForm.append('audio', audioFile);

    const response = await fetch(
      `https://api.deepinfra.com/v1/inference/${WHISPER_MODEL}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${DEEPINFRA_API_KEY}`,
        },
        body: deepinfraForm,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepInfra Whisper error:', response.status, errorText);
      return NextResponse.json(
        { error: `Whisper API error: ${response.status}` },
        { status: 502 }
      );
    }

    const result = await response.json();

    return NextResponse.json({
      text: result.text || '',
      segments: result.segments || [],
    });
  } catch (error) {
    console.error('Speech-to-text error:', error);
    return NextResponse.json(
      { error: 'Failed to process audio' },
      { status: 500 }
    );
  }
}
