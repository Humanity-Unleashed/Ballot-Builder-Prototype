# Ballot Builder - Step-by-Step Implementation Guide

**Version:** 1.0
**Last Updated:** January 9, 2026
**Based on:** Ballot_Builder_PRD.md v1.0

---

## Table of Contents

1. [Phase 0: Project Setup & Infrastructure](#phase-0-project-setup--infrastructure)
2. [Phase 1: MVP Foundation](#phase-1-mvp-foundation)
3. [Phase 2: Enhanced Intelligence](#phase-2-enhanced-intelligence)
4. [Phase 3: User Experience Polish](#phase-3-user-experience-polish)
5. [Phase 4: Scale & Optimization](#phase-4-scale--optimization)
6. [API Integrations Checklist](#api-integrations-checklist)
7. [Compliance Checklist](#compliance-checklist)

---

## Phase 0: Project Setup & Infrastructure

### Step 0.1: Initialize Project Structure

Create the following directory structure:

```
ballot-builder/
├── frontend/          # React Native mobile app
│   ├── src/
│   │   ├── components/
│   │   ├── screens/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── utils/
│   │   └── assets/
│   └── package.json
├── backend/           # Node.js/Python API server
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── utils/
│   └── package.json
├── ml-services/       # AI/ML microservices
│   ├── statement-generator/
│   ├── embedding-service/
│   ├── chatbot-service/
│   └── summary-generator/
├── infrastructure/    # Docker, K8s configs
│   ├── docker/
│   ├── kubernetes/
│   └── terraform/
├── docs/              # Documentation
├── docker-compose.yml
└── README.md
```

### Step 0.2: Set Up Development Environment

1. **Install Prerequisites**
   - Node.js (v18+)
   - Python (v3.10+)
   - Docker & Docker Compose
   - React Native CLI
   - PostgreSQL client

2. **Configure Docker Containers**
   ```yaml
   # docker-compose.yml services:
   - PostgreSQL (primary database)
   - Redis (caching layer)
   - Qdrant/Pinecone (vector database)
   - API server
   - ML services
   ```

3. **Set Up Databases**
   - PostgreSQL for relational data
   - Vector database (Pinecone or Qdrant) for embeddings
   - Redis for caching and sessions

4. **Configure External Services**
   - Create account with LLM provider (Deep Infra or Novita)
   - Set up API keys management
   - Configure rate limiting

5. **Set Up CI/CD Pipeline**
   - GitHub Actions or GitLab CI
   - Automated testing on PR
   - Staging deployment on merge
   - Production deployment workflow

### Step 0.3: Establish Core Infrastructure

1. **Create Backend API Skeleton**
   - Initialize Express.js (Node) or FastAPI (Python) project
   - Set up routing structure
   - Configure middleware (CORS, auth, logging)
   - Set up error handling

2. **Set Up Authentication System**
   - JWT-based authentication
   - Refresh token rotation
   - Password hashing (bcrypt)
   - OAuth integration (optional)

3. **Configure Database Schemas**
   - Create migration system (Knex, Prisma, or Alembic)
   - Write initial migrations
   - Set up seed data for development

4. **Set Up Logging and Monitoring**
   - Structured logging (Winston or Pino)
   - Error tracking (Sentry)
   - Performance monitoring
   - Health check endpoints

5. **Configure Environment Variables**
   - `.env.example` template
   - Secrets management strategy
   - Environment-specific configs (dev, staging, prod)

---

## Phase 1: MVP Foundation

### Step 1.1: Database Schema Design

Create the following tables:

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User profiles table
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    age_range VARCHAR(50),
    location VARCHAR(255),
    preference_vector FLOAT[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User districts table
CREATE TABLE user_districts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    district_type VARCHAR(50) NOT NULL, -- local, county, state, congressional, senate
    district_id VARCHAR(100) NOT NULL,
    district_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Policy statements table
CREATE TABLE policy_statements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    statement_text TEXT NOT NULL,
    issue_area VARCHAR(100) NOT NULL,
    specificity_level VARCHAR(50), -- broad, moderate, specific
    embedding FLOAT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User responses table
CREATE TABLE user_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    statement_id UUID REFERENCES policy_statements(id),
    response VARCHAR(20) NOT NULL, -- approve, disapprove
    responded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Elections table
CREATE TABLE elections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    election_date DATE NOT NULL,
    jurisdiction VARCHAR(255),
    status VARCHAR(50) DEFAULT 'upcoming',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ballot items table
CREATE TABLE ballot_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    election_id UUID REFERENCES elections(id) ON DELETE CASCADE,
    item_type VARCHAR(50) NOT NULL, -- candidate, measure, position
    jurisdiction VARCHAR(255),
    official_text TEXT,
    ai_summary TEXT,
    yes_outcome TEXT,
    no_outcome TEXT,
    embedding FLOAT[],
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Candidates table
CREATE TABLE candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ballot_item_id UUID REFERENCES ballot_items(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    party VARCHAR(100),
    position VARCHAR(255),
    biography TEXT,
    ai_summary TEXT,
    embedding FLOAT[],
    policy_positions JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User ballot selections table
CREATE TABLE user_ballot_selections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    ballot_item_id UUID REFERENCES ballot_items(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES candidates(id),
    selection VARCHAR(50), -- yes, no, candidate_id
    confidence_score FLOAT,
    viewed_at TIMESTAMP,
    selected_at TIMESTAMP,
    UNIQUE(user_id, ballot_item_id)
);

-- Confidence by area table
CREATE TABLE user_confidence_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    issue_area VARCHAR(100) NOT NULL,
    confidence_score FLOAT DEFAULT 0,
    response_count INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, issue_area)
);
```

### Step 1.2: Build Intake Questionnaire

#### API Endpoints

```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/users/profile
POST /api/users/districts
POST /api/users/initial-preferences
GET  /api/users/me
```

#### Frontend Screens

1. **Welcome Screen**
   - App introduction
   - Value proposition
   - Get Started button

2. **Registration Screen**
   - Email input
   - Password input
   - Terms acceptance checkbox

3. **Demographics Screen** (Optional)
   - Age range selector
   - Location input
   - Skip option

4. **District Entry Screen**
   - State selector
   - Congressional district input
   - Local district inputs
   - Help links to district lookup resources

5. **Initial Preferences Screen**
   - 10 broad policy questions
   - Likert scale or binary choice
   - Progress indicator

#### Implementation Tasks

- [ ] Create registration API endpoint with validation
- [ ] Implement JWT token generation and refresh
- [ ] Build profile update endpoint
- [ ] Create district association endpoint
- [ ] Build initial preferences endpoint
- [ ] Implement vector initialization from preferences
- [ ] Create all frontend screens with navigation
- [ ] Add form validation
- [ ] Implement error handling and feedback

### Step 1.3: Build Civic Blueprint Builder (Basic)

#### Pre-Generated Policy Statements

Create 50 statements across these categories (5 per category):

1. Healthcare
2. Education
3. Economy/Jobs
4. Environment/Climate
5. Immigration
6. Criminal Justice
7. Taxes/Fiscal Policy
8. Housing
9. Gun Policy
10. Social Issues

Example statements:
```json
[
  {
    "statement": "Healthcare should be provided by the government as a universal right",
    "issue_area": "healthcare",
    "specificity_level": "broad"
  },
  {
    "statement": "Public schools should receive increased federal funding",
    "issue_area": "education",
    "specificity_level": "moderate"
  }
]
```

#### API Endpoints

```
GET  /api/blueprint/statements
POST /api/blueprint/response
GET  /api/blueprint/progress
GET  /api/blueprint/summary
```

#### Swipe Interface Components

1. **SwipeCard Component**
   - Statement text display
   - Swipe gesture handler (react-native-gesture-handler)
   - Animation on swipe (react-native-reanimated)
   - Agree/Disagree visual feedback

2. **CardStack Component**
   - Manages card queue
   - Handles card removal on swipe
   - Fetches next batch when low

3. **ActionButtons Component**
   - Disagree button (left)
   - Agree button (right)
   - Accessibility alternative to swiping

4. **ProgressIndicator Component**
   - Questions answered count
   - Visual progress bar
   - Issue area breakdown

#### Implementation Tasks

- [ ] Seed database with 50 policy statements
- [ ] Generate embeddings for all statements
- [ ] Create statement retrieval endpoint
- [ ] Build response recording endpoint
- [ ] Implement preference vector update logic
- [ ] Build SwipeCard component with gestures
- [ ] Add haptic feedback on swipe
- [ ] Create progress tracking UI
- [ ] Implement response history storage

### Step 1.4: Integrate Ballot Data

#### Ballotpedia Integration

1. **Contact Ballotpedia**
   - Email: data@ballotpedia.org
   - Request API access and pricing
   - Obtain API documentation

2. **Build API Client**
   ```javascript
   class BallotpediaClient {
     constructor(apiKey) { ... }
     async getSampleBallot(address) { ... }
     async getElectionInfo(electionId) { ... }
     async getCandidateInfo(candidateId) { ... }
   }
   ```

3. **Data Transformation Layer**
   - Map Ballotpedia response to internal schema
   - Handle missing/incomplete data
   - Validate data integrity

#### Ballot Ingestion Pipeline

```
[Ballotpedia API] → [API Client] → [Transformer] → [Validator] → [Database]
```

#### API Endpoints

```
GET  /api/elections
GET  /api/elections/:id
GET  /api/ballots?user_id=X
GET  /api/ballots/:id/items
GET  /api/ballot-items/:id
GET  /api/candidates/:id
POST /api/admin/ingest-ballot (admin only)
```

#### Implementation Tasks

- [ ] Secure Ballotpedia API access
- [ ] Build API client wrapper
- [ ] Create data transformation functions
- [ ] Build ingestion pipeline
- [ ] Create ballot retrieval endpoints
- [ ] Implement caching for ballot data
- [ ] Build admin ingestion interface
- [ ] Add data validation and error handling

### Step 1.5: Build Simple Ballot Browser

#### Screen Structure

1. **Ballot Overview Screen**
   - Election header (name, date)
   - Completion progress bar
   - List of sections (Federal, State, Local)
   - Quick stats (X of Y completed)

2. **Ballot Section Screen**
   - Section header
   - List of ballot items
   - Status indicators per item
   - Navigation to item detail

3. **Ballot Item Detail Screen**
   - Official text (collapsible)
   - Candidates list OR Yes/No options
   - Selection mechanism
   - Confidence gauge placeholder
   - Next/Previous navigation

#### Status Indicators

```javascript
const STATUS = {
  NOT_STARTED: { icon: '⭕', color: '#gray' },
  IN_PROGRESS: { icon: '📍', color: '#blue' },
  COMPLETED: { icon: '✅', color: '#green' },
  REVIEWED: { icon: '⚠️', color: '#yellow' }
};
```

#### API Endpoints

```
GET  /api/users/:id/ballot
GET  /api/users/:id/ballot/progress
POST /api/users/:id/ballot/selections
PUT  /api/users/:id/ballot/selections/:itemId
```

#### Implementation Tasks

- [ ] Build Ballot Overview screen
- [ ] Create section list component
- [ ] Build Ballot Item Detail screen
- [ ] Implement selection mechanism
- [ ] Add status tracking
- [ ] Create progress calculation
- [ ] Build navigation between items
- [ ] Add pull-to-refresh for updates

### Step 1.6: Implement Confidence Gauge V1

#### Similarity Calculation Service

```python
import numpy as np
from numpy.linalg import norm

def cosine_similarity(vec1, vec2):
    """Calculate cosine similarity between two vectors."""
    return np.dot(vec1, vec2) / (norm(vec1) * norm(vec2))

def calculate_confidence(user_vector, item_vector):
    """
    Calculate confidence score as percentage.
    Returns value between 0-100.
    """
    similarity = cosine_similarity(user_vector, item_vector)
    # Normalize from [-1, 1] to [0, 100]
    confidence = (similarity + 1) * 50
    return round(confidence, 1)

def get_confidence_level(score):
    """Categorize confidence score."""
    if score < 50:
        return 'low'
    elif score < 75:
        return 'moderate'
    else:
        return 'high'
```

#### API Endpoints

```
GET /api/confidence/ballot-item/:itemId?user_id=X
GET /api/confidence/candidate/:candidateId?user_id=X
GET /api/confidence/improve-suggestions?user_id=X&item_id=Y
```

#### Confidence Gauge Component

```jsx
const ConfidenceGauge = ({ score, onImprove }) => {
  const level = getConfidenceLevel(score);
  const color = {
    low: '#ef4444',
    moderate: '#f59e0b',
    high: '#22c55e'
  }[level];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Alignment with your civic blueprint</Text>
      <View style={styles.gaugeContainer}>
        <View style={[styles.gaugeFill, { width: `${score}%`, backgroundColor: color }]} />
      </View>
      <Text style={[styles.score, { color }]}>{score}%</Text>
      <TouchableOpacity onPress={onImprove}>
        <Text style={styles.improveLink}>Improve this score →</Text>
      </TouchableOpacity>
    </View>
  );
};
```

#### Improve Score Flow

1. User taps "Improve this score"
2. API returns relevant unanswered statements
3. Navigate to Blueprint Builder with filtered statements
4. After answering, recalculate and return to ballot item

#### Implementation Tasks

- [ ] Pre-compute embeddings for all ballot items/candidates
- [ ] Build similarity calculation service
- [ ] Create confidence API endpoints
- [ ] Build ConfidenceGauge component
- [ ] Implement "Improve Score" flow
- [ ] Add loading states and error handling
- [ ] Cache confidence calculations

### Step 1.7: MVP Integration Testing

#### Test Scenarios

1. **User Registration Flow**
   - Register new user
   - Complete demographics
   - Enter district information
   - Complete initial preferences

2. **Blueprint Building Flow**
   - Swipe through statements
   - Verify vector updates
   - Check progress tracking
   - Verify response history

3. **Ballot Viewing Flow**
   - View ballot overview
   - Navigate to items
   - View confidence scores
   - Make selections

4. **End-to-End Flow**
   - New user completes full onboarding
   - Builds blueprint with 20+ responses
   - Views ballot with recommendations
   - Completes all selections

#### Performance Baselines

- API response time < 200ms (95th percentile)
- Swipe animation 60fps
- App launch time < 3 seconds
- Confidence calculation < 100ms

#### Implementation Tasks

- [ ] Write integration tests for each flow
- [ ] Set up test data fixtures
- [ ] Create test user accounts
- [ ] Document manual test cases
- [ ] Fix identified bugs
- [ ] Establish performance baselines
- [ ] Create staging environment

---

## Phase 2: Enhanced Intelligence

### Step 2.1: Build Adaptive Statement Generation

#### LLM Prompt Template

```
System: You are a civic engagement assistant that generates policy statements
to help understand a user's political preferences. Generate clear, neutral
statements that a user can agree or disagree with.

User Profile:
- Interests: {user_interests}
- Previous responses: {response_summary}
- Confidence gaps: {low_confidence_areas}
- District: {district_info}

Current district issues (from RAG):
{district_issues}

Generate {count} policy statements following these rules:
1. {relevance_ratio}% should relate to user's stated interests
2. {exploration_ratio}% should explore new areas to fill confidence gaps
3. Vary specificity (some broad values, some specific policies)
4. Make statements clear and unambiguous
5. Avoid leading or biased language

Output as JSON array:
[
  {
    "statement": "...",
    "issue_area": "...",
    "specificity": "broad|moderate|specific",
    "reasoning": "why this statement was chosen"
  }
]
```

#### RAG System Setup

1. **Document Indexing**
   - Index local news articles
   - Index district-specific policy documents
   - Index current ballot measures
   - Index candidate positions

2. **Query Construction**
   ```python
   def build_rag_query(user_profile, districts):
       return f"""
       Current political issues in:
       - State: {districts.state}
       - Congressional District: {districts.congressional}
       - Local: {districts.local}

       User interests: {user_profile.interests}
       """
   ```

3. **Context Injection**
   - Retrieve top 5 relevant documents
   - Summarize for prompt context
   - Include source references

#### API Endpoints

```
POST /api/blueprint/generate-statements
GET  /api/blueprint/coverage-report
POST /api/admin/index-district-issues
```

#### Implementation Tasks

- [ ] Design and test LLM prompts
- [ ] Set up RAG infrastructure (vector store)
- [ ] Build document ingestion pipeline
- [ ] Create statement generation service
- [ ] Implement coverage tracking
- [ ] Add generation caching
- [ ] Build admin tools for content management

### Step 2.2: Build AI Summary Generator

#### Summary Generation Pipeline

```
[Ballot Item] → [LLM Summarizer] → [Cache] → [User]
                      ↓
               [Quality Check]
```

#### LLM Prompts

**Ballot Measure Summary:**
```
Summarize this ballot measure for an average voter (8th-10th grade reading level):

Official Text:
{official_text}

Provide:
1. A 2-3 sentence plain language summary
2. What happens if voters choose YES
3. What happens if voters choose NO
4. Key stakeholders affected

Format as JSON:
{
  "summary": "...",
  "yes_outcome": "...",
  "no_outcome": "...",
  "stakeholders": ["..."]
}
```

**Candidate Summary:**
```
Create a neutral summary of this candidate:

Name: {name}
Party: {party}
Office: {office}
Known Positions: {positions}
Background: {background}

Provide:
1. 2-3 sentence biography
2. Key policy positions (bullet points)
3. Notable endorsements or oppositions

Format as JSON:
{
  "biography": "...",
  "key_positions": ["..."],
  "endorsements": ["..."]
}
```

#### Caching Strategy

- Cache summaries per ballot item (not per user)
- TTL: Until election date
- Invalidate on data update
- Pre-generate during ballot ingestion

#### Implementation Tasks

- [ ] Design summary generation prompts
- [ ] Build generation service
- [ ] Implement caching layer
- [ ] Create batch generation job
- [ ] Add quality validation
- [ ] Update ballot item display
- [ ] Build admin review interface

### Step 2.3: Build AI Chatbot

#### RAG Architecture

```
[User Question] → [Query Processor] → [Vector Search] → [Context Builder] → [LLM] → [Response]
                                            ↓
                                    [Ballot Data Index]
                                    [Candidate Index]
                                    [User Blueprint]
```

#### Context Sources

1. **Ballot Information**
   - Current ballot item details
   - Related measures/candidates
   - Official sources

2. **User Context**
   - Current screen/item being viewed
   - User's civic blueprint
   - Previous chat history

3. **General Knowledge**
   - Political terminology definitions
   - Voting process information
   - District-specific info

#### Chat Service

```python
class ChatService:
    def __init__(self, llm_client, vector_store):
        self.llm = llm_client
        self.vectors = vector_store

    async def get_response(self, user_id, message, context):
        # Retrieve relevant documents
        docs = await self.vectors.search(message, filters={
            'election_id': context.election_id,
            'ballot_item_id': context.ballot_item_id
        })

        # Build prompt with context
        prompt = self.build_prompt(message, docs, context)

        # Get LLM response
        response = await self.llm.complete(prompt)

        # Add citations
        return self.add_citations(response, docs)
```

#### API Endpoints

```
POST /api/chat/message
GET  /api/chat/history?session_id=X
DELETE /api/chat/history?session_id=X
```

#### Chat UI Components

1. **FloatingChatButton**
   - Persistent across screens
   - Badge for unread messages
   - Tap to open chat panel

2. **ChatPanel**
   - Slide-up modal
   - Message history
   - Input field with send button
   - Context indicator (current item)

3. **ChatMessage**
   - User/assistant differentiation
   - Markdown rendering
   - Source citations as links

#### Implementation Tasks

- [ ] Set up chat RAG infrastructure
- [ ] Index ballot and candidate data
- [ ] Build chat service
- [ ] Create API endpoints
- [ ] Build FloatingChatButton component
- [ ] Build ChatPanel component
- [ ] Implement conversation history
- [ ] Add source citations
- [ ] Test with various questions

### Step 2.4: Implement Address-Based District Lookup

#### API Options Evaluation

| Provider | Pros | Cons |
|----------|------|------|
| Census Bureau | Free, official | Complex, may need multiple calls |
| Google Civic | Comprehensive | Potentially deprecated |
| SmartyStreets | Reliable, fast | Paid service |
| Cicero API | Political data focused | Paid service |

#### Integration Flow

```
[Address Input] → [Geocode] → [District Lookup] → [Validate] → [Store]
```

#### Address Lookup Service

```python
class DistrictLookupService:
    async def lookup_by_address(self, address):
        # Geocode address
        coords = await self.geocoder.geocode(address)

        # Look up all district levels
        districts = {
            'congressional': await self.get_congressional(coords),
            'state_senate': await self.get_state_senate(coords),
            'state_house': await self.get_state_house(coords),
            'county': await self.get_county(coords),
            'local': await self.get_local_districts(coords)
        }

        return districts
```

#### API Endpoints

```
POST /api/districts/lookup
GET  /api/districts/validate
PUT  /api/users/:id/districts
```

#### UI Updates

1. **Address Entry Screen**
   - Address autocomplete
   - Map preview
   - District results display
   - Edit/confirm flow

2. **Manual Override**
   - Edit individual districts
   - Add missing districts
   - Validation feedback

#### Implementation Tasks

- [ ] Evaluate and select district API
- [ ] Build geocoding integration
- [ ] Create district lookup service
- [ ] Build address autocomplete UI
- [ ] Implement validation flow
- [ ] Add manual override capability
- [ ] Update onboarding flow
- [ ] Test with various addresses

### Step 2.5: Build Civic Blueprint Visualization

#### Visualization Options

1. **Political Compass**
   - 2D plot (economic vs social axes)
   - User position marker
   - Movement animation on updates

2. **Issue Priority Chart**
   - Horizontal bar chart
   - Ranked by response strength
   - Confidence indicators

3. **Completion Wheel**
   - Circular progress by category
   - Color-coded segments
   - Tap for category details

4. **Blueprint Strength Score**
   - Overall percentage
   - Breakdown by area
   - Recommendations for improvement

#### Implementation

```jsx
const CivicBlueprintScreen = () => {
  return (
    <ScrollView>
      <BlueprintStrengthScore score={overallScore} />
      <PoliticalCompass position={userPosition} />
      <IssuePriorityChart priorities={priorities} />
      <CompletionWheel categories={categoryCompletion} />
      <ImprovementSuggestions gaps={confidenceGaps} />
    </ScrollView>
  );
};
```

#### API Endpoints

```
GET /api/blueprint/visualization-data
GET /api/blueprint/political-position
GET /api/blueprint/priorities
```

#### Implementation Tasks

- [ ] Design visualization components
- [ ] Calculate political compass position
- [ ] Build priority ranking algorithm
- [ ] Create completion tracking
- [ ] Implement real-time updates
- [ ] Add animations
- [ ] Build share/export feature

---

## Phase 3: User Experience Polish

### Step 3.1: Implement Election Reminders

#### Notification Types

| Type | Trigger | Default Timing |
|------|---------|----------------|
| Election Set | New election added | Immediate |
| Ballot Available | Ballot ingested | Immediate |
| Early Voting | Early voting starts | Day before |
| Election Reminder | Election day | Day before + morning of |
| Registration Deadline | Deadline approaching | 7 days + 1 day before |

#### Push Notification Setup

**iOS (APNs):**
- Configure certificates in Apple Developer Portal
- Set up push notification entitlement
- Implement notification handling

**Android (FCM):**
- Create Firebase project
- Configure FCM credentials
- Implement notification handling

#### Notification Service

```python
class NotificationService:
    async def schedule_election_reminders(self, user_id, election):
        reminders = [
            {
                'type': 'election_reminder',
                'send_at': election.date - timedelta(days=1),
                'title': 'Election Tomorrow!',
                'body': f"Don't forget to vote in the {election.name}"
            },
            {
                'type': 'election_day',
                'send_at': election.date.replace(hour=8),
                'title': 'It\'s Election Day!',
                'body': 'Polls are open. Make your voice heard!'
            }
        ]

        for reminder in reminders:
            await self.schedule_notification(user_id, reminder)
```

#### API Endpoints

```
GET  /api/notifications/preferences
PUT  /api/notifications/preferences
GET  /api/notifications/upcoming
POST /api/notifications/register-device
```

#### Implementation Tasks

- [ ] Set up FCM and APNs
- [ ] Build notification scheduling service
- [ ] Create preferences management
- [ ] Implement email notifications
- [ ] Build notification center UI
- [ ] Add deep linking from notifications
- [ ] Test notification delivery

### Step 3.2: Build Ballot Export

#### PDF Generation

```python
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

class BallotPDFGenerator:
    def generate(self, user_id, options):
        ballot_data = self.get_user_ballot(user_id)

        pdf = canvas.Canvas(f"ballot_{user_id}.pdf", pagesize=letter)

        # Header
        pdf.drawString(100, 750, "My Ballot Selections")
        pdf.drawString(100, 730, f"Election: {ballot_data.election.name}")
        pdf.drawString(100, 710, f"Date: {ballot_data.election.date}")

        # Disclaimer
        pdf.drawString(100, 680, "This is NOT an official ballot.")

        y = 650
        for item in ballot_data.items:
            y = self.draw_ballot_item(pdf, item, y, options)

        pdf.save()
        return pdf_path
```

#### Export Options

- [ ] Include confidence scores
- [ ] Include AI explanations
- [ ] Include personal notes
- [ ] Print-friendly formatting

#### API Endpoints

```
POST /api/ballot/export/pdf
GET  /api/ballot/export/:exportId/download
```

#### Implementation Tasks

- [ ] Build PDF generation service
- [ ] Design print-friendly template
- [ ] Add export options UI
- [ ] Implement download flow
- [ ] Add share sheet integration
- [ ] Test print output

### Step 3.3: Integrate Poll Locator

#### VIP Widget Integration

```jsx
const PollLocatorScreen = () => {
  const [address, setAddress] = useState(user.address);

  return (
    <View style={styles.container}>
      <AddressConfirmation
        address={address}
        onEdit={setAddress}
      />
      <WebView
        source={{ uri: `https://tool.votinginfoproject.org/embed?address=${encodeURIComponent(address)}` }}
        style={styles.webview}
        onNavigationStateChange={handleNavigation}
      />
      <MapButton address={pollingLocation} />
    </View>
  );
};
```

#### Fallback: Direct API Integration

If widget is problematic:
- Query VIP API directly
- Build native UI for results
- Integrate with native maps

#### Implementation Tasks

- [ ] Evaluate VIP widget mobile experience
- [ ] Build WebView integration
- [ ] Style to match app theme
- [ ] Add map/directions integration
- [ ] Implement fallback handling
- [ ] Test across districts

### Step 3.4: Enhance Ballot Browser

#### Visual Improvements

1. **Card-based Layout**
   - Elevated cards per ballot item
   - Clear visual hierarchy
   - Touch feedback

2. **Section Headers**
   - Icons per section type
   - Collapsible sections
   - Progress per section

3. **Status System**
   - Clear iconography
   - Color coding
   - Animated transitions

#### Quick Navigation

```jsx
const BallotNavigation = ({ items, currentIndex, onNavigate }) => {
  return (
    <View style={styles.navContainer}>
      <TouchableOpacity onPress={() => onNavigate('prev')} disabled={currentIndex === 0}>
        <Icon name="chevron-left" />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => onNavigate('first-incomplete')}>
        <Text>Next Incomplete</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => onNavigate('next')} disabled={currentIndex === items.length - 1}>
        <Icon name="chevron-right" />
      </TouchableOpacity>
    </View>
  );
};
```

#### Gamification Elements

- Completion badges
- Progress celebrations (confetti on 100%)
- Streak tracking
- Achievement system

#### Implementation Tasks

- [ ] Redesign ballot card component
- [ ] Add section icons and headers
- [ ] Implement quick navigation
- [ ] Add completion animations
- [ ] Build achievement system
- [ ] User testing and iteration

### Step 3.5: Mobile Optimization

#### Performance Tuning

1. **Image Optimization**
   - Use WebP format
   - Implement lazy loading
   - Add placeholder images

2. **Bundle Optimization**
   - Code splitting
   - Tree shaking
   - Lazy component loading

3. **Data Optimization**
   - Pagination for lists
   - Incremental loading
   - Response compression

#### Offline Capability

```javascript
// Cache ballot data for offline viewing
const cacheStrategy = {
  ballot: {
    storage: 'AsyncStorage',
    ttl: '24h',
    syncOnReconnect: true
  },
  responses: {
    storage: 'SQLite',
    syncQueue: true
  }
};
```

#### Touch Refinement

- Gesture sensitivity tuning
- Animation timing optimization
- Haptic feedback patterns

#### Implementation Tasks

- [ ] Audit and optimize images
- [ ] Implement code splitting
- [ ] Add offline data caching
- [ ] Build sync queue for offline responses
- [ ] Tune gesture handlers
- [ ] Profile and optimize animations
- [ ] Test on low-end devices

---

## Phase 4: Scale & Optimization

### Step 4.1: Cost Optimization

#### Caching Strategy

| Data Type | Cache Location | TTL | Invalidation |
|-----------|----------------|-----|--------------|
| LLM Summaries | Redis | Until election | Manual |
| Embeddings | Vector DB | Permanent | On update |
| Confidence Scores | Redis | 1 hour | On new response |
| Ballot Data | PostgreSQL + Redis | Until election | On ingest |
| User Vectors | Vector DB | Permanent | Real-time |

#### LLM Cost Reduction

1. **Prompt Optimization**
   - Minimize input tokens
   - Use efficient output formats
   - Batch similar requests

2. **Model Selection**
   - Use smaller models where sufficient
   - GPT-4-20B for most tasks
   - GPT-4-120B only for complex analysis

3. **Usage Monitoring**
   ```python
   class LLMUsageTracker:
       def track_request(self, model, input_tokens, output_tokens, user_id):
           cost = self.calculate_cost(model, input_tokens, output_tokens)
           self.log_usage(user_id, cost)
           self.check_budget_alerts(user_id, cost)
   ```

#### Target Metrics

- < $1 per user per election cycle
- < 100ms average API response time
- > 95% cache hit rate for summaries

#### Implementation Tasks

- [ ] Implement multi-layer caching
- [ ] Build usage tracking dashboard
- [ ] Set up budget alerts
- [ ] Optimize LLM prompts
- [ ] Add request batching
- [ ] Monitor and reduce costs

### Step 4.2: Scale Infrastructure

#### Database Optimization

1. **Query Optimization**
   - Add appropriate indexes
   - Optimize slow queries
   - Implement query caching

2. **Read Replicas**
   - Set up PostgreSQL replicas
   - Route read traffic appropriately
   - Monitor replication lag

#### Load Balancing

```yaml
# Kubernetes deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ballot-builder-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ballot-builder-api
  template:
    spec:
      containers:
      - name: api
        resources:
          requests:
            cpu: "500m"
            memory: "512Mi"
          limits:
            cpu: "1000m"
            memory: "1Gi"
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ballot-builder-api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ballot-builder-api
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

#### CDN Setup

- Static assets on CDN
- API response caching where appropriate
- Geographic distribution

#### Implementation Tasks

- [ ] Add database indexes
- [ ] Set up read replicas
- [ ] Configure load balancer
- [ ] Implement auto-scaling
- [ ] Set up CDN
- [ ] Load test for 100K+ users
- [ ] Document scaling procedures

### Step 4.3: Analytics & Monitoring

#### User Behavior Tracking

```javascript
const analytics = {
  trackEvent: (event, properties) => {
    // Track to analytics service
  },

  events: {
    ONBOARDING_STARTED: 'onboarding_started',
    ONBOARDING_COMPLETED: 'onboarding_completed',
    STATEMENT_SWIPED: 'statement_swiped',
    BALLOT_ITEM_VIEWED: 'ballot_item_viewed',
    SELECTION_MADE: 'selection_made',
    CONFIDENCE_IMPROVED: 'confidence_improved',
    CHAT_MESSAGE_SENT: 'chat_message_sent',
    BALLOT_EXPORTED: 'ballot_exported'
  }
};
```

#### Dashboards

1. **User Engagement**
   - DAU/MAU
   - Session duration
   - Feature usage

2. **Funnel Analysis**
   - Onboarding completion
   - Blueprint building progress
   - Ballot completion rate

3. **Recommendation Quality**
   - Confidence score distribution
   - Override rate
   - User feedback scores

4. **Operational**
   - API response times
   - Error rates
   - Cost per user

#### A/B Testing Framework

```python
class ABTestingService:
    def get_variant(self, user_id, experiment_name):
        # Deterministic assignment based on user_id
        variant = hash(f"{user_id}:{experiment_name}") % 100
        return self.experiments[experiment_name].get_variant(variant)

    def track_conversion(self, user_id, experiment_name, metric):
        # Track conversion for statistical analysis
        pass
```

#### Implementation Tasks

- [ ] Set up analytics service
- [ ] Implement event tracking
- [ ] Build dashboards
- [ ] Create A/B testing framework
- [ ] Set up alerting
- [ ] Document metrics definitions

### Step 4.4: Expand Coverage

#### Multi-State Support

- State-specific ballot formats
- Local jurisdiction handling
- State election law compliance

#### Historical Data

- Past election results
- Candidate voting records
- Measure outcome tracking

#### Implementation Tasks

- [ ] Expand district database
- [ ] Add state-specific logic
- [ ] Build historical data pipeline
- [ ] Implement trend analysis
- [ ] Test across multiple states

---

## API Integrations Checklist

| Priority | API | Purpose | Status | Contact |
|----------|-----|---------|--------|---------|
| P1 | Ballotpedia | Ballot data | ⬜ Pending | data@ballotpedia.org |
| P1 | Deep Infra/Novita | LLM provider | ⬜ Pending | Sign up online |
| P1 | Pinecone/Qdrant | Vector database | ⬜ Pending | Sign up online |
| P2 | Census Bureau | District lookup | ⬜ Pending | Public API |
| P2 | Google Civic | District lookup (backup) | ⬜ Evaluate | developers.google.com |
| P3 | VIP | Poll locator | ⬜ Pending | votinginfoproject.org |
| P3 | Firebase (FCM) | Push notifications | ⬜ Pending | firebase.google.com |
| P3 | APNs | iOS notifications | ⬜ Pending | Apple Developer |
| P3 | SendGrid/SES | Email | ⬜ Pending | Sign up online |

---

## Compliance Checklist

### Legal Disclaimers
- [ ] Add "informational tool only" disclaimer
- [ ] Add "verify with official sources" notice
- [ ] Add "AI-generated content may contain errors" warning
- [ ] Add "no candidate endorsement" statement
- [ ] Legal review of all disclaimers

### Data Privacy
- [ ] Create privacy policy
- [ ] Implement consent collection
- [ ] Build account deletion feature
- [ ] Implement data export (GDPR)
- [ ] No sale of user data policy
- [ ] CCPA compliance review

### Accessibility (WCAG 2.1 AA)
- [ ] Screen reader support
- [ ] Color contrast compliance (4.5:1 minimum)
- [ ] Touch target sizes (44x44 minimum)
- [ ] Alternative input methods
- [ ] Adjustable text sizes
- [ ] Accessibility audit

### Election Law
- [ ] Review federal election laws
- [ ] Review state-specific requirements
- [ ] Independence statement
- [ ] No campaign coordination policy
- [ ] Disclaimer on exported materials

### Security
- [ ] OWASP Top 10 review
- [ ] Penetration testing
- [ ] Data encryption (at rest and in transit)
- [ ] API rate limiting
- [ ] Input validation
- [ ] SQL injection prevention
- [ ] XSS prevention

---

## Quick Reference: Key Decisions from PRD

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Mobile framework | React Native | Cross-platform efficiency |
| Primary navigation | Bottom tab bar | Mobile-first, thumb-friendly |
| AI explanations | Always shown | Per meeting decision |
| Chatbot interface | Floating button | Less intrusive on mobile |
| Recommendation engine | Cosine similarity | Cost-effective, no LLM needed |
| LLM provider | Deep Infra/Novita | Open source models, low cost |
| Primary data source | Ballotpedia | Most comprehensive |
| Statement relevance | 80-90% relevant | Balance engagement and exploration |

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-09 | Initial implementation guide |

---

*This document is a living guide and should be updated as implementation progresses and decisions are refined.*
