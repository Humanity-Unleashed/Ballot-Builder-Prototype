import { NextRequest, NextResponse } from 'next/server';
import { interpretBallotResponse, type CivicAxis } from '@/server/services/llmService';
import {
  computePropositionRecommendation,
  computeCandidateMatches,
  type ValueAxis,
  type BallotItem,
} from '@/lib/ballotHelpers';
import type {
  ConversationTurnRequest,
  ConversationTurnResponse,
  ConversationMessage,
  ProgressiveAxisValue,
  ValueSignal,
} from '@/types/conversation';
import { axisSliderConfigs } from '@/data/sliderPositions';

/** Derive axis definitions from slider configs for use by the scoring engine and LLM service */
function getAxisDefinitions(): CivicAxis[] {
  return Object.values(axisSliderConfigs).map((config) => ({
    id: config.axisId,
    name: config.question,
    description: config.question,
    poleA: { label: config.poleALabel.replace(/\n/g, ' ') },
    poleB: { label: config.poleBLabel.replace(/\n/g, ' ') },
  }));
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function mergeSignalsIntoProfile(
  profile: Record<string, ProgressiveAxisValue>,
  signals: ValueSignal[]
): Record<string, ProgressiveAxisValue> {
  const updated = { ...profile };

  for (const signal of signals) {
    const existing = updated[signal.axisId];
    const importance = signal.importance ?? 5;
    if (existing) {
      const totalWeight = existing.confidence * existing.signalCount + signal.confidence;
      const newValue = totalWeight > 0
        ? (existing.value * existing.confidence * existing.signalCount + signal.direction * signal.confidence) / totalWeight
        : signal.direction;
      const newImportance = (existing.importance * existing.signalCount + importance) / (existing.signalCount + 1);

      updated[signal.axisId] = {
        value: Math.max(0, Math.min(10, Math.round(newValue * 10) / 10)),
        confidence: Math.min(1, (existing.confidence + signal.confidence) / 2),
        importance: Math.max(0, Math.min(10, Math.round(newImportance * 10) / 10)),
        signalCount: existing.signalCount + 1,
      };
    } else {
      updated[signal.axisId] = {
        value: signal.direction,
        confidence: signal.confidence,
        importance,
        signalCount: 1,
      };
    }
  }

  return updated;
}

function profileToValueAxes(
  profile: Record<string, ProgressiveAxisValue>,
  axes: CivicAxis[]
): ValueAxis[] {
  return axes.map((axisDef) => {
    const profileValue = profile[axisDef.id];
    return {
      id: axisDef.id,
      name: axisDef.name,
      description: axisDef.description,
      value: profileValue?.value ?? 5,
      poleA: axisDef.poleA.label,
      poleB: axisDef.poleB.label,
      weight: 1,
    };
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ConversationTurnRequest;

    if (!body.ballotItem || !body.userMessage) {
      return NextResponse.json(
        { error: 'Missing required fields: ballotItem, userMessage' },
        { status: 400 }
      );
    }

    // Load axis definitions from slider configs
    const axisDefinitions = getAxisDefinitions();

    // Build the conversation history with the new user message
    const userMessage: ConversationMessage = {
      id: generateId(),
      role: 'user',
      content: body.userMessage,
      timestamp: new Date().toISOString(),
      ballotItemId: body.ballotItemId,
    };

    const allMessages = [...(body.conversationHistory || []), userMessage];

    // Step 1: Call LLM to interpret the user's response
    const llmResult = await interpretBallotResponse(
      body.ballotItem,
      allMessages,
      body.currentProfile || {},
      axisDefinitions
    );

    // Step 2: Merge value signals into profile
    const updatedProfile = mergeSignalsIntoProfile(
      body.currentProfile || {},
      llmResult.valueSignals
    );

    // Step 3: Determine if we should generate a recommendation
    const turnCount = allMessages.filter((m) => m.role === 'user').length;
    const shouldRecommend = llmResult.recommendation.ready || turnCount >= 2;

    let recommendation: ConversationTurnResponse['recommendation'];
    let status: ConversationTurnResponse['status'] = 'discussing';

    if (llmResult.userIntent === 'skip') {
      status = 'skipped';
    } else if (shouldRecommend) {
      // Convert profile to ValueAxis[] for the scoring engine
      const valueAxes = profileToValueAxes(updatedProfile, axisDefinitions);

      // Build a BallotItem for the scoring functions
      const ballotItem: BallotItem = {
        id: body.ballotItem.id,
        categoryId: body.ballotItem.type === 'proposition' ? 'measures' : 'contests',
        type: body.ballotItem.type,
        title: body.ballotItem.title,
        questionText: body.ballotItem.questionText,
        explanation: body.ballotItem.explanation,
        relevantAxes: body.ballotItem.relevantAxes,
        yesAxisEffects: body.ballotItem.yesAxisEffects,
        candidates: body.ballotItem.candidates?.map((c) => ({
          id: c.id,
          name: c.name,
          party: c.party,
          profile: {
            stances: c.profile.stances,
            summary: c.profile.summary,
          },
        })),
      };

      if (body.ballotItem.type === 'proposition') {
        recommendation = computePropositionRecommendation(ballotItem, valueAxes);
      } else {
        recommendation = computeCandidateMatches(ballotItem, valueAxes);
      }

      status = 'recommended';
    }

    // Build the assistant message
    const assistantMessage: ConversationMessage = {
      id: generateId(),
      role: 'assistant',
      content: llmResult.responseText,
      timestamp: new Date().toISOString(),
      ballotItemId: body.ballotItemId,
    };

    const response: ConversationTurnResponse = {
      assistantMessage,
      valueSignals: llmResult.valueSignals,
      recommendation,
      status,
      updatedProfile,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Conversation turn error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process conversation turn' },
      { status: 500 }
    );
  }
}
