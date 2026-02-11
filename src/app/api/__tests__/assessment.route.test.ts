import { describe, it, expect } from 'vitest';
import { POST as startPost } from '../assessment/start/route';
import { POST as answerPost } from '../assessment/[sessionId]/answer/route';
import { POST as completePost } from '../assessment/[sessionId]/complete/route';
import { GET as getSession } from '../assessment/[sessionId]/route';
import { createMockRequest } from '../../../__tests__/helpers/request';

describe('Assessment API flow', () => {
  it('POST /api/assessment/start creates a session', async () => {
    const request = createMockRequest('POST', '/api/assessment/start', {});
    const response = await startPost(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.session).toBeDefined();
    expect(data.session.id).toBeTruthy();
    expect(data.session.status).toBe('in_progress');
    expect(data.firstQuestion).toBeDefined();
  });

  it('GET /api/assessment/[sessionId] returns session', async () => {
    // Start a session
    const startReq = createMockRequest('POST', '/api/assessment/start', {});
    const startRes = await startPost(startReq);
    const startData = await startRes.json();
    const sessionId = startData.session.id;

    // Get session
    const getReq = createMockRequest('GET', `/api/assessment/${sessionId}`);
    const getRes = await getSession(getReq, {
      params: Promise.resolve({ sessionId }),
    });
    expect(getRes.status).toBe(200);

    const data = await getRes.json();
    expect(data.id).toBe(sessionId);
  });

  it('GET /api/assessment/[sessionId] returns 404 for nonexistent', async () => {
    const request = createMockRequest('GET', '/api/assessment/nonexistent');
    const response = await getSession(request, {
      params: Promise.resolve({ sessionId: 'nonexistent' }),
    });
    expect(response.status).toBe(404);
  });

  it('full flow: start -> answer -> answer -> complete', async () => {
    // Start
    const startReq = createMockRequest('POST', '/api/assessment/start', {});
    const startRes = await startPost(startReq);
    const startData = await startRes.json();
    const sessionId = startData.session.id;
    const currentQuestion = startData.firstQuestion;

    // Answer first question
    expect(currentQuestion).not.toBeNull();
    const ans1Req = createMockRequest('POST', `/api/assessment/${sessionId}/answer`, {
      itemId: currentQuestion.id,
      response: 'agree',
    });
    const ans1Res = await answerPost(ans1Req, {
      params: Promise.resolve({ sessionId }),
    });
    expect(ans1Res.status).toBe(200);
    const ans1Data = await ans1Res.json();
    expect(ans1Data.session.swipes).toHaveLength(1);

    // Answer second question if available
    if (ans1Data.nextQuestion) {
      const ans2Req = createMockRequest('POST', `/api/assessment/${sessionId}/answer`, {
        itemId: ans1Data.nextQuestion.id,
        response: 'disagree',
      });
      const ans2Res = await answerPost(ans2Req, {
        params: Promise.resolve({ sessionId }),
      });
      expect(ans2Res.status).toBe(200);
    }

    // Complete
    const completeReq = createMockRequest('POST', `/api/assessment/${sessionId}/complete`);
    const completeRes = await completePost(completeReq, {
      params: Promise.resolve({ sessionId }),
    });
    expect(completeRes.status).toBe(200);

    const completeData = await completeRes.json();
    expect(completeData.session.status).toBe('completed');
    expect(Array.isArray(completeData.finalScores)).toBe(true);
  });

  it('POST answer returns 404 for nonexistent session', async () => {
    const request = createMockRequest('POST', '/api/assessment/bad-id/answer', {
      itemId: 'item-1',
      response: 'agree',
    });
    const response = await answerPost(request, {
      params: Promise.resolve({ sessionId: 'bad-id' }),
    });
    expect(response.status).toBe(404);
  });

  it('POST complete returns 404 for nonexistent session', async () => {
    const request = createMockRequest('POST', '/api/assessment/bad-id/complete');
    const response = await completePost(request, {
      params: Promise.resolve({ sessionId: 'bad-id' }),
    });
    expect(response.status).toBe(404);
  });
});
