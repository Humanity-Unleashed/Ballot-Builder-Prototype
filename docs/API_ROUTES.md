# API Routes Reference

All API routes are implemented as Next.js App Router API routes in `src/app/api/`.

## Base URL

Development: `http://localhost:3000/api`

---

## Civic Axes

Core assessment and scoring endpoints.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/civic-axes/spec` | Full specification (domains, axes, items) |
| GET | `/civic-axes/summary` | Spec metadata only |
| GET | `/civic-axes/domains` | List all domains |
| GET | `/civic-axes/domains/:id` | Single domain with axes |
| GET | `/civic-axes/axes` | List all axes |
| GET | `/civic-axes/axes/:id` | Single axis details |
| GET | `/civic-axes/items` | List items (filterable) |
| GET | `/civic-axes/items/:id` | Single item |
| GET | `/civic-axes/session` | Get balanced session of items |
| POST | `/civic-axes/score` | Score user responses |
| GET | `/civic-axes/tags` | All available tags |
| GET | `/civic-axes/response-scale` | Response value mapping |

### POST /civic-axes/score

Score user responses and get axis scores.

**Request:**
```json
{
  "responses": [
    { "item_id": "item_1", "response": "agree" },
    { "item_id": "item_2", "response": "strong_disagree" }
  ]
}
```

**Response:**
```json
{
  "axis_scores": [
    {
      "axis_id": "econ_safetynet",
      "raw_sum": 3,
      "n_answered": 2,
      "n_unsure": 0,
      "normalized": 0.75,
      "shrunk": 0.1875,
      "confidence": 0.25,
      "top_drivers": ["item_1"]
    }
  ]
}
```

---

## Ballot

Ballot data retrieval.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/ballot` | Get default ballot |
| GET | `/ballot/all` | List all available ballots |
| GET | `/ballot/summary` | Overall data summary |
| GET | `/ballot/:ballotId` | Get specific ballot |
| GET | `/ballot/:ballotId/summary` | Ballot summary stats |
| GET | `/ballot/:ballotId/contests` | Contests in ballot |
| GET | `/ballot/:ballotId/measures` | Measures in ballot |
| GET | `/ballot/:ballotId/items/:itemId` | Specific ballot item |

---

## Contests

Electoral contest endpoints.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/contests` | List all contests |
| GET | `/contests/:contestId` | Contest with candidates |
| GET | `/contests/:contestId/candidates` | Candidates for contest |

---

## Measures

Ballot measure endpoints.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/measures` | List all measures |
| GET | `/measures/:measureId` | Specific measure details |

---

## Candidates

Candidate information endpoints.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/candidates` | List candidates (?contestId=) |
| GET | `/candidates/:candidateId` | Candidate with context |
| GET | `/candidates/:candidateId/context` | Context records (?topicId=) |
| GET | `/candidates/:candidateId/sources` | Source references |

---

## Blueprint

Blueprint statements and areas.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/blueprint/start` | Start blueprint session |
| GET | `/blueprint/next` | Get next statement |
| GET | `/blueprint/areas` | List issue areas |
| GET | `/blueprint/statements` | Get all statements |
| GET | `/blueprint/statements/:issueArea` | Statements by area |

---

## Assessment

Assessment session management.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/assessment/start` | Start new session |
| GET | `/assessment/:sessionId` | Get session status |
| POST | `/assessment/:sessionId/answer` | Submit answer |
| POST | `/assessment/:sessionId/complete` | Complete session |

---

## Fine-Tuning

Fine-tuning session management.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/fine-tuning/sessions` | List sessions |
| POST | `/fine-tuning/submit` | Submit fine-tuning |
| GET | `/fine-tuning/:sessionId` | Get session |
| GET | `/fine-tuning/:sessionId/axis/:axisId` | Get axis in session |

---

## Schwartz Values

Schwartz values assessment endpoints.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/schwartz-values/spec` | Full specification |
| GET | `/schwartz-values/items` | List all items |
| POST | `/schwartz-values/score` | Score responses |

### POST /schwartz-values/score

**Request:**
```json
{
  "responses": {
    "PVQ_1": 4,
    "PVQ_2": 5,
    "PVQ_3": 3
  }
}
```

**Response:**
```json
{
  "value_scores": {
    "power": 0.5,
    "achievement": 0.3,
    "hedonism": -0.2
  },
  "dimension_scores": {
    "self_enhancement": 0.4,
    "openness": 0.1
  },
  "individual_mean": 3.8
}
```

---

## Personas

Test persona endpoints (development tool).

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/personas` | List all personas |
| GET | `/personas/:id` | Get persona details |
| GET | `/personas/:id/preferences` | Persona policy preferences |

---

## Error Responses

All endpoints return consistent error format:

```json
{
  "error": "Error message here"
}
```

Common status codes:
- `400` - Bad request (invalid parameters)
- `404` - Resource not found
- `500` - Internal server error

---

## Client Usage

The frontend uses an Axios client with interceptors configured in `src/services/api.ts`:

```typescript
import { civicAxesApi, ballotApi } from '@/services/api';

// Get civic axes spec
const spec = await civicAxesApi.getSpec();

// Score responses
const scores = await civicAxesApi.scoreResponses(responses);

// Get ballot
const ballot = await ballotApi.getDefaultBallot();
```
