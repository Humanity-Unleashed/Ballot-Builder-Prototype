# Ballot Builder - Product Requirements Document

**Version:** 1.0  
**Last Updated:** January 9, 2026  
**Document Owner:** Development Team  

---

## Executive Summary

Ballot Builder is a mobile-first application designed to help users make informed voting decisions through personalized policy alignment matching. The app combines AI-powered preference learning, ballot information retrieval, and confidence-based recommendations to guide users through their complete ballot.

---

## Product Vision & Goals

### Primary Goals
1. **Simplify Voting Decisions**: Help users understand complex ballot measures and candidate positions
2. **Personalized Recommendations**: Match users with ballot items based on their policy preferences and values
3. **Increase Voter Confidence**: Provide clear, data-driven recommendations with transparency
4. **Improve Civic Engagement**: Make voting more accessible and less overwhelming

### Success Metrics
- User completion rate of civic blueprint building
- Confidence gauge accuracy and user satisfaction
- Ballot completion rates
- Time spent per ballot item review
- User return rate for subsequent elections

---

## Design Principles

### 1. Mobile-First Design
- **Bottom Navigation**: Use bottom tab bar for primary navigation (not top bar)
- **Swipe Interface**: Dating-app style swipe mechanism for intuitive interaction
- **Thumb-Friendly**: All interactive elements within natural thumb reach
- **Progressive Disclosure**: Show information gradually to avoid overwhelming users

### 2. Transparency & Trust
- **Confidence Scoring**: Always show confidence levels with explanations
- **Source Attribution**: Clearly indicate how recommendations are derived
- **User Control**: Allow users to override recommendations
- **Explanation on Demand**: Provide detailed reasoning through AI chatbot

### 3. Cost-Effective AI Architecture
- **Embedding-Based Matching**: Use cosine similarity for user-candidate alignment (no LLM needed)
- **Cached Policy Analysis**: Analyze ballot items once, serve to all users from cache
- **Rules-Based Overlay**: Layer simple rules over LLM calls to minimize API usage
- **Open Source Models**: Use models like GPT-4-20B or GPT-4-120B via bare metal providers (Deep Infra, Novita)
- **Token Optimization**: Only use LLMs for policy interpretation and initial analysis

### 4. Iterative Learning
- **Adaptive Questions**: Generate policy statements that probe deeper based on user responses
- **80-90 Rule**: 80-90% questions relevant to user interests, 10-20% exploratory
- **Value Inference**: Use core values to predict positions on topics user hasn't expressed interest in

---

## Core Features & Requirements

### 1. Intake Questionnaire

**Purpose**: Initial user profiling to bootstrap the civic blueprint

**Components**:
- Basic demographic information (optional, for enhanced recommendations)
- Initial policy preference questions (5-10 broad topics)
- Electoral district information gathering

**District Information Options**:
1. **Address Entry** (Recommended)
   - User enters physical address
   - System looks up all relevant districts (local → county → state → federal)
   - Requires address-district API integration
   
2. **Manual District Entry**
   - User manually inputs district information
   - Provide links to district lookup resources
   - Guide user through local → congressional level inputs

**Technical Considerations**:
- Store preferences as vectors for similarity matching
- Associate user with all relevant electoral districts
- Validate address against electoral district boundaries

---

### 2. Civic Blueprint Builder

**Purpose**: Continuous preference learning through engaging interaction

#### 2a. LLM-Generated Policy Statements

**Functionality**:
- Generate stream of policy statements across issue areas
- Vary specificity levels (broad values → specific policy positions)
- Tailor to user's stated interests (80-90%) and district priorities
- Include exploratory statements (10-20%) for comprehensive profiling

**Statement Generation Logic**:
1. **Primary Source** (80-90%): User's stated interests from intake
2. **Geographic Relevance**: Issues important to user's district/state/federal level
   - Use RAG to search current issues in user's area
3. **Value Inference** (10-20%): For unstated interests, generate statements to probe political philosophy
   - Example: User shows libertarian values → test libertarian-conservative vs. libertarian-liberal positions

**Technical Requirements**:
- LLM generates statements based on user profile and district data
- Statement complexity adapts to user engagement level
- Track which issue areas have been covered

#### 2b. Swipe-Based User Input

**Interface**:
- Card-based UI showing one policy statement at a time
- Swipe right = approve/agree
- Swipe left = disapprove/disagree
- Alternative: Tap buttons for accessibility

**User Experience**:
- Smooth animations
- Quick feedback (haptic/visual)
- Progress indicator showing questions completed
- Optional: Daily notification for "answer 5 more questions"

#### 2c. Preference Learning Engine

**Functionality**:
- Update user preference profile after each swipe
- Identify patterns in responses
- Detect value hierarchies and priorities
- Build multidimensional preference vector

**Technical Implementation**:
- Real-time vector updates
- Pattern detection algorithms
- Weight adjustment based on confidence
- Store historical responses for transparency

#### 2d. Adaptive Statement Generation

**Functionality**:
- Use evolving preference profile to generate increasingly targeted statements
- Probe areas of uncertainty or inconsistency
- Test edge cases of user's value system

**Technical Approach**:
- LLM receives current user vector + response history
- Generates statements designed to maximize information gain
- Prioritizes areas with low confidence or few data points

#### 2e. Civic Blueprint Visualization

**Purpose**: Gamification and user engagement

**Potential Visualizations**:
- Political compass/ideology mapping
- Issue priority ranking
- Value strength indicators
- Completion percentage per policy area
- Comparison with geographic/demographic cohorts (optional, anonymized)

**Requirements**:
- Interactive and understandable
- Updates in real-time
- Exportable/shareable (optional)

---

### 3. Sample Ballot Retriever

**Purpose**: Obtain accurate ballot information for user's districts

**Data Sources** (Priority Order):
1. **Ballotpedia Sample Ballot Lookup Tool**
   - Licensing required: Contact data@ballotpedia.org
   - Most comprehensive and maintained
   
2. **Google Civic Information API**
   - Free but possibly deprecated/unmaintained
   - Use as fallback if still functional

**Technical Requirements**:
- Query by user's district information
- Handle multiple concurrent elections
- Update automatically when new ballots available
- Store ballot data in structured format

---

### 4. Ballot Ingestion Pipeline

**Purpose**: Process and structure ballot data for AI analysis

**Ingestion Methods**:
1. **API Integration** (Preferred)
   - Direct structured data from Ballotpedia/Google
   
2. **PDF Processing** (Fallback)
   - OCR software for text extraction
   - Structure recognition (candidates, measures, etc.)
   - Data validation and cleaning

**Output Requirements**:
- Structured ballot items (candidates, measures, positions)
- Candidate information and policy positions
- Measure full text and summary
- Associated metadata (election date, jurisdiction, etc.)

---

### 5. Election Deadlines & Reminders

**Notification Types**:
1. **Election Date Set**: When upcoming election is confirmed
2. **Ballot Available**: When sample ballot is ingested and ready
3. **Early Voting Open**: When early voting begins (if applicable)
4. **Election Day Reminder**: Day before and day of election
5. **Registration Deadline**: If user not yet registered (optional)

**Technical Requirements**:
- Push notification system
- Email notifications (optional)
- In-app notification center
- User-configurable preferences

---

### 6. AI Summary Generator

**Purpose**: Explain ballot items in accessible language

**For Each Ballot Item**:

1. **Original Text Display**
   - Full ballot language as it appears on official ballot
   - Expandable/collapsible for readability

2. **AI-Generated Explainer**
   - Concise, simplified explanation
   - Decision: **Automatic display** (always visible, not toggleable)
   - Plain language, appropriate reading level (8th-10th grade)

3. **Outcome Explanation**
   - Clear description of "Yes" outcome
   - Clear description of "No" outcome
   - Practical implications of each choice

4. **Candidate Summaries** (for candidate races)
   - Key policy positions
   - Background summary
   - Confidence gauge integration (see Feature 7)
   - AI-generated explanation of alignment reasoning

**Technical Approach**:
- Generate summaries once per ballot item (cached, not per-user)
- Use LLM for initial summary generation
- Human review for accuracy (optional, for quality control)
- Store with ballot items in database

---

### 7. Confidence Gauge

**Purpose**: Communicate recommendation strength and encourage engagement

**Display Format**:
- Percentage score: "This candidate aligns XX% with your civic blueprint"
- Alternative phrasing: "We are YY% confident this matches your values"
- Visual indicator (progress bar, gauge, color coding)

**Confidence Calculation**:
- Based on cosine similarity between user vector and candidate/measure vector
- Normalized to 0-100% scale
- Factors:
  - Number of relevant policy statements answered
  - Strength of user's positions in relevant areas
  - Data quality about candidate/measure

**User Actions**:
- Always provide "Improve this score" link/button
- Takes user back to civic blueprint builder
- Shows relevant policy areas to answer
- Explains which additional questions would help

**Technical Requirements**:
- Real-time calculation
- Transparent methodology (explainable to users)
- Confidence threshold recommendations:
  - <50%: Low confidence warning
  - 50-75%: Moderate confidence
  - >75%: High confidence

---

### 8. Ballot Browser

**Purpose**: Navigate and review complete ballot with recommendations

#### 8a. Visual Ballot Overview

**Current Design Considerations**:
- **Challenge**: Original design (image with colored blocks) may not be mobile-friendly
- **Alternative Approaches**:
  - List view with status indicators
  - Accordion-style sections
  - Card-based navigation
  - Hybrid: Simplified ballot outline + detail cards

**Status Indicators**:
- ✅ Completed (user made selection): Green
- ⚠️ Partially reviewed (viewed but no selection): Yellow  
- ⭕ Not started: Gray/White
- 📍 Currently viewing: Highlighted/Blue

**Navigation**:
- Clickable sections to jump to specific items
- Next/Previous buttons
- Progress percentage
- Quick jump to first incomplete item

#### 8b. Export & Printing Options

**Export Features**:
1. **PDF Export** (Recommended Implementation)
   - Standard functionality, well-supported
   - User can print from PDF viewer
   - Includes all selections and notes

2. **Direct Printing** (Future Enhancement)
   - Wireless printer API integration (Apple AirPrint, Google Cloud Print)
   - More convenient but adds complexity

**Content to Export**:
- User's selections
- Confidence scores
- AI explanations (optional, user choice)
- Custom notes (if feature added)

**Technical Requirements**:
- Generate printer-friendly format
- Include official ballot format reference
- Clear visual distinction between official ballot and guidance document

---

### 9. AI Chatbot

**Purpose**: Answer user questions about specific ballot items

**Functionality**:
- Context-aware: Knows which ballot item user is viewing
- Can answer:
  - "What does this measure actually do?"
  - "How would this affect me personally?"
  - "What are the arguments for/against?"
  - "Why is this being recommended to me?"
  - "Who supports/opposes this measure?"

**Interface Options**:
1. **Per-Page Question Bar** (Original concept)
   - May clutter mobile interface
   
2. **Floating Chat Button** (Recommended)
   - Persistent across ballot items
   - Maintains conversation context
   - Less intrusive on small screens

**Technical Requirements**:
- RAG system with ballot information
- Access to user's civic blueprint for personalized responses
- Maintain conversation context within ballot session
- Cite sources when providing factual information

---

### 10. Poll Locator

**Purpose**: Help users find their polling place

**Implementation Options**:

1. **Voting Information Project Widget** (Recommended)
   - URL: https://www.votinginfoproject.org/projects
   - Provides polling place lookup tools
   - **Challenge**: Embedding web widget in mobile app can be "janky"
   - **Solution Options**:
     - Native webview wrapper with mobile-optimized CSS
     - Deep link to mobile-optimized web version
     - Pull data via API if available

2. **Custom Integration** (Future)
   - Build native polling place lookup
   - Requires access to official electoral data sources
   - More seamless UX but higher development cost

**Information Provided**:
- Polling location address
- Hours of operation
- Accessibility information
- Early voting locations (if applicable)
- Map/directions integration

---

## Technical Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Mobile App                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Civic    │  │ Ballot   │  │ Ballot   │  │ Poll     │   │
│  │ Blueprint│  │ Browser  │  │ Info     │  │ Locator  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Preference Learning Engine (Vector Storage)         │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Confidence Calculation (Cosine Similarity)          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    AI/ML Services Layer                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │ Statement  │  │ Policy     │  │ Chatbot    │           │
│  │ Generator  │  │ Analyzer   │  │ (RAG)      │           │
│  │ (LLM)      │  │ (LLM+Cache)│  │            │           │
│  └────────────┘  └────────────┘  └────────────┘           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ User     │  │ Ballot   │  │ Vector   │  │ Response │   │
│  │ Profiles │  │ Data     │  │ Store    │  │ Cache    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   External Services                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │ Ballotpedia│  │ Address-   │  │ VIP Poll   │           │
│  │ API        │  │ District   │  │ Locator    │           │
│  │            │  │ API        │  │            │           │
│  └────────────┘  └────────────┘  └────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

### Key Technical Decisions

#### 1. AI Model Strategy
- **Primary Models**: Open source models via bare metal providers
  - Deep Infra or Novita for cost optimization
  - GPT-4-20B for most tasks (4¢ per million input tokens, 19¢ per million output tokens)
  - GPT-4-120B for complex policy analysis if needed

#### 2. Embedding & Matching
- **User Preferences**: Store as embeddings/vectors
- **Candidates/Measures**: Pre-compute embeddings
- **Matching**: Cosine similarity (no LLM needed for recommendations)
- **Updates**: Re-embed user vector after each batch of responses

#### 3. Caching Strategy
- **Policy Analysis**: Generate once per ballot item, serve to all users
- **Candidate Summaries**: Pre-generate and cache
- **Statement Templates**: Cache common statement patterns
- **User Responses**: Cache to reduce redundant processing

#### 4. Cost Optimization
- Minimize LLM API calls through:
  - Aggressive caching
  - Rules-based pre-filtering
  - Batch processing where possible
  - Efficient prompt engineering
- Target: <$1 per user per election cycle

### Data Models

#### User Profile
```json
{
  "user_id": "uuid",
  "created_at": "timestamp",
  "demographics": {
    "age_range": "optional",
    "location": "optional"
  },
  "districts": {
    "local": ["district_ids"],
    "county": "district_id",
    "state": "state_code",
    "congressional": "district_number",
    "senate": "senate_district"
  },
  "preference_vector": [0.1, -0.3, 0.8, ...],
  "response_history": [
    {
      "statement_id": "uuid",
      "response": "approve|disapprove",
      "timestamp": "timestamp"
    }
  ],
  "confidence_by_area": {
    "healthcare": 0.85,
    "education": 0.72,
    "economy": 0.65
  }
}
```

#### Ballot Item
```json
{
  "ballot_item_id": "uuid",
  "election_id": "uuid",
  "type": "candidate|measure|position",
  "jurisdiction": "district_info",
  "official_text": "string",
  "ai_summary": "string",
  "outcomes": {
    "yes": "explanation",
    "no": "explanation"
  },
  "embedding": [0.2, 0.5, -0.1, ...],
  "metadata": {
    "supporters": [],
    "opponents": [],
    "fiscal_impact": "optional"
  }
}
```

#### Candidate Profile
```json
{
  "candidate_id": "uuid",
  "name": "string",
  "position": "office",
  "policy_positions": [
    {
      "issue": "healthcare",
      "stance": "description",
      "source": "url"
    }
  ],
  "embedding": [0.3, -0.2, 0.7, ...],
  "ai_summary": "string"
}
```

---

## Development Roadmap & Staging Plan

### Phase 1: MVP Foundation (3-4 months)

**Scope**: Core infrastructure and basic functionality

**Deliverables**:
1. **Intake Questionnaire**
   - Basic demographic form
   - Initial policy questions (10 core topics)
   - Manual district entry
   - Vector initialization

2. **Civic Blueprint Builder - Basic**
   - Swipe interface with 50 pre-generated policy statements
   - Simple preference tracking
   - Basic vector updates

3. **Ballot Data Integration**
   - Ballotpedia API integration (licensing required)
   - Basic ballot ingestion pipeline
   - Structured data storage

4. **Simple Ballot Browser**
   - List view of ballot items
   - Basic navigation
   - Status tracking (completed/incomplete)

5. **Confidence Gauge - V1**
   - Cosine similarity calculation
   - Simple percentage display
   - Basic "improve score" flow

**Infrastructure**:
- Backend API (Node.js or Python)
- Database (PostgreSQL)
- Vector storage (Pinecone or Qdrant)
- Basic LLM integration (Deep Infra)

**Success Criteria**:
- User can complete intake questionnaire
- User can swipe through policy statements
- User can view ballot with basic recommendations
- Confidence scores calculate accurately
- End-to-end flow works for one test election

---

### Phase 2: Enhanced Intelligence (2-3 months)

**Scope**: Advanced AI features and personalization

**Deliverables**:
1. **Adaptive Statement Generation**
   - LLM generates personalized policy statements
   - RAG integration for district-specific issues
   - 80-90% relevance targeting

2. **AI Summary Generator**
   - LLM-powered ballot explainers
   - Outcome descriptions
   - Candidate summaries

3. **AI Chatbot**
   - Context-aware Q&A
   - RAG over ballot information
   - Integration with ballot browser

4. **Address-Based District Lookup**
   - API integration for address → districts
   - Automatic district population
   - Validation and error handling

5. **Civic Blueprint Visualization**
   - Political compass display
   - Issue priority ranking
   - Completion progress

**Infrastructure Additions**:
- RAG system implementation
- Enhanced caching layer
- Real-time vector updates

**Success Criteria**:
- Statements adapt to user responses
- Ballot explanations are clear and accurate
- Chatbot provides helpful answers
- Address lookup works reliably
- User engagement increases with visualization

---

### Phase 3: User Experience Polish (2 months)

**Scope**: UX improvements and secondary features

**Deliverables**:
1. **Election Reminders**
   - Push notification system
   - Email notifications
   - Customizable preferences

2. **Ballot Export**
   - PDF generation
   - Print-friendly format
   - Selections + notes export

3. **Poll Locator**
   - VIP widget integration
   - Mobile-optimized display
   - Map/directions

4. **Enhanced Ballot Browser**
   - Improved visual design
   - Quick navigation features
   - Progress indicators
   - Completion gamification

5. **Mobile Optimization**
   - Performance tuning
   - Offline capability (view cached ballot)
   - Touch gesture refinement

**Success Criteria**:
- Notification delivery rate >95%
- PDF export works reliably
- Poll locator provides accurate information
- App feels responsive and polished
- User retention improves

---

### Phase 4: Scale & Optimization (Ongoing)

**Scope**: Performance, cost optimization, and expansion

**Deliverables**:
1. **Cost Optimization**
   - Implement aggressive caching strategies
   - Optimize LLM prompts
   - Monitor and reduce API costs
   - Target: <$1 per user per election

2. **Scale Infrastructure**
   - Load balancing
   - Database optimization
   - CDN for static assets
   - Prepare for 100K+ users

3. **Analytics & Insights**
   - User behavior tracking
   - Confidence score accuracy monitoring
   - A/B testing framework
   - Recommendation quality metrics

4. **Expanded Coverage**
   - Support for more electoral districts
   - Historical election data
   - Multi-state support
   - Local measure coverage

5. **Advanced Features** (Based on user feedback)
   - Social features (compare with friends, anonymized)
   - Endorsement integration
   - Candidate comparison tools
   - Educational content library

**Success Criteria**:
- Cost per user meets target
- System handles target user load
- Analytics inform product decisions
- Coverage expansion successful
- User satisfaction scores high

---

## API Integrations Required

### Priority 1 (MVP)
1. **Ballotpedia API**
   - Purpose: Sample ballot data
   - Status: Requires licensing
   - Contact: data@ballotpedia.org

2. **LLM Provider** (Deep Infra or Novita)
   - Purpose: Policy analysis, statement generation
   - Models: GPT-4-20B, GPT-4-120B
   - Cost: ~4¢/19¢ per million tokens

### Priority 2 (Phase 2)
3. **Address-to-District API**
   - Purpose: Convert address to electoral districts
   - Options to evaluate:
     - Google Civic Information API (possibly deprecated)
     - Census Bureau Geocoding API
     - Commercial provider (SmartyStreets, etc.)

### Priority 3 (Phase 3)
4. **Voting Information Project**
   - Purpose: Poll locator
   - URL: https://www.votinginfoproject.org/projects
   - Implementation: Widget embed or API

5. **Notification Services**
   - Push notifications: Firebase Cloud Messaging (FCM) or Apple Push Notification service (APNs)
   - Email: SendGrid or AWS SES

### Optional/Future
6. **Google Civic Information API**
   - Purpose: Fallback ballot data source
   - Status: Potentially deprecated, evaluate viability

---

## Open Questions & Decisions Needed

### Technical
1. **OCR Software Selection**
   - If PDFs are common: Tesseract vs. cloud OCR (Google Vision, AWS Textract)
   - Cost vs. accuracy tradeoffs

2. **Mobile Framework**
   - Native (Swift/Kotlin) vs. React Native vs. Flutter
   - Recommendation: React Native for cross-platform efficiency

3. **Ballot Browser UX**
   - Final design for mobile-friendly ballot overview
   - User testing needed for different approaches

### Product
4. **AI Explanation Display**
   - ✅ **Decision from meeting**: Always show (not toggleable)
   - Confirmed in transcript

5. **Chatbot Interface**
   - Per-page question bar vs. floating button
   - Recommendation: Floating button for mobile

6. **Civic Blueprint Visualization**
   - Specific visualization approach
   - Gamification elements to include

7. **User Override Handling**
   - When user overrides high-confidence recommendation
   - How to probe reasons (for learning)
   - Maintain override vs. learn from it?

### Business
8. **Content Moderation**
   - Review process for AI-generated content
   - Accuracy verification for ballot summaries
   - Legal disclaimers needed

9. **Privacy & Data**
   - User data retention policy
   - Anonymization for analytics
   - GDPR/CCPA compliance

10. **Monetization** (Future)
    - Free vs. premium tiers
    - Partnership opportunities
    - Grant funding potential

---

## Risk Mitigation

### Technical Risks

| Risk | Impact | Mitigation Strategy |
|------|--------|-------------------|
| Ballot data unavailable | High | Multiple data sources; fallback to manual entry |
| LLM costs exceed budget | High | Aggressive caching; cost monitoring; usage caps |
| Address API accuracy issues | Medium | Manual override option; validation UI |
| OCR quality problems | Medium | Human review queue; confidence thresholds |
| Scale performance issues | Medium | Progressive enhancement; load testing; CDN |

### Product Risks

| Risk | Impact | Mitigation Strategy |
|------|--------|-------------------|
| User distrust of AI recommendations | High | Transparency; explanations; user control |
| Low initial engagement | Medium | Onboarding optimization; gamification |
| Ballot complexity overwhelms users | Medium | Progressive disclosure; AI chat support |
| Recommendation inaccuracy | High | Confidence thresholds; user feedback loop |

### Business Risks

| Risk | Impact | Mitigation Strategy |
|------|--------|-------------------|
| Content moderation challenges | High | Review process; legal review; disclaimers |
| Licensing costs (Ballotpedia) | Medium | Negotiate terms; alternative sources |
| Election timing pressure | High | Agile development; MVP focus; staged rollout |
| Regulatory/legal concerns | Medium | Legal consultation; compliance review |

---

## Success Metrics & KPIs

### User Engagement
- Daily active users (DAU)
- Questions answered per user
- Civic blueprint completion rate
- Time spent in app per session
- Return user rate

### Recommendation Quality
- Confidence score distribution
- User override rate
- Override reasoning (when available)
- Post-election satisfaction survey results

### Operational
- API cost per user
- Average response time
- System uptime
- Error rates

### Business
- User acquisition rate
- User retention rate
- App store ratings
- Net Promoter Score (NPS)

---

## Compliance & Legal Considerations

### Required Disclaimers
- "This is an informational tool only, not official voting guidance"
- "Verify information with official sources"
- "AI-generated content may contain errors"
- "We do not endorse any candidate or measure"

### Data Privacy
- User consent for data collection
- Clear privacy policy
- Option to delete account and data
- Secure storage of personal information
- No sale of user data

### Accessibility
- WCAG 2.1 AA compliance
- Screen reader support
- Alternative input methods
- Adequate color contrast
- Adjustable text sizes

### Election Law Compliance
- Verify compliance with election communication laws
- No coordination with campaigns or parties
- Clear independence statement
- Proper disclaimers on any distributed materials

---

## Appendix

### Glossary

- **Civic Blueprint**: User's personalized policy preference profile built through swipe responses
- **Confidence Gauge**: Percentage score indicating alignment between user and ballot item
- **Cosine Similarity**: Mathematical measure of similarity between two vectors
- **Embedding/Vector**: Numerical representation of text/preferences for AI comparison
- **RAG (Retrieval-Augmented Generation)**: AI technique combining database search with language generation
- **DXA**: Drawing Units (1440 DXA = 1 inch) used in document formatting

### References

#### Meeting Transcript Notes
- Date: [MMVP Check-in]
- Key Decisions:
  - Mobile-first approach confirmed
  - Bottom navigation preferred
  - Cost optimization critical (embeddings > LLM calls)
  - Ballotpedia preferred data source
  - AI explanations always shown (not toggleable)

#### Data Sources Mentioned
- Ballotpedia: https://www.ballotpedia.org
- Voting Information Project: https://www.votinginfoproject.org/projects
- Google Civic Information API: https://developers.google.com/civic-information

---

## Document Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-09 | Development Team | Initial PRD creation based on feature document and meeting transcript |

---

## Approval & Sign-off

_This section to be completed by project stakeholders_

- [ ] Product Owner: _________________ Date: _______
- [ ] Technical Lead: ________________ Date: _______
- [ ] Design Lead: __________________ Date: _______
- [ ] Project Manager: _______________ Date: _______
