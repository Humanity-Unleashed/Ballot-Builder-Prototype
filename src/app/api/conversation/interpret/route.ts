import { NextRequest, NextResponse } from 'next/server';
import { interpretBallotResponse } from '@/server/services/llmService';
import type { ConversationMessage, ProgressiveAxisValue } from '@/types/conversation';
import type { CivicAxis } from '@/server/types';

interface InterpretRequest {
  ballotItem: {
    id: string;
    type: 'proposition' | 'candidate_race';
    title: string;
    questionText: string;
    explanation: string;
    relevantAxes?: string[];
    yesAxisEffects?: Record<string, number>;
    candidates?: Array<{
      id: string;
      name: string;
      party?: string;
      profile: {
        stances: Record<string, number>;
        summary?: string;
      };
    }>;
  };
  messages: ConversationMessage[];
  currentProfile: Record<string, ProgressiveAxisValue>;
  axisDefinitions: CivicAxis[];
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as InterpretRequest;

    if (!body.ballotItem || !body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json(
        { error: 'Missing required fields: ballotItem, messages' },
        { status: 400 }
      );
    }

    const result = await interpretBallotResponse(
      body.ballotItem,
      body.messages,
      body.currentProfile || {},
      body.axisDefinitions || []
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Conversation interpret error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to interpret response' },
      { status: 500 }
    );
  }
}
