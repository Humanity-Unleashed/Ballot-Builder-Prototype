# Prototype Feedback

> Compiled from direct testing and email feedback.

---

## Homepage

- [ ] **"Civic Blueprint" may confuse users** — Consider something more straightforward like "Discover your values."
- [ ] **Add trust/credibility info** — Users need to know who created this and why they should trust it. Could be a "Who we are" blurb, trust signals (nonpartisan, open methodology, data stays on device), or a dedicated slide. Needs content decision.

## Main Ballot Builder Page (State/Election Selector)

- [ ] **Three-step selector feels dark and small** — Hard to know where to start vs. very prominent selection options. Consider bigger fonts, clearer first step ("Choose your state" gets highlighted).
- [ ] **Confusing blank space** — Review layout for unnecessary whitespace.
- [ ] **FAQ and sign-in too small/confusing** — Rethink layout and UX. Bigger letters, clearer hierarchy.
- [ ] **State card needs more info** — e.g., "Texas — November 2026 midterm elections. Who's on the ballot? U.S. Senate, Governor, Attorney General, etc."
- [ ] **Add address/zip code lookup** — "Type in your zip code or address" feature that auto-matches to relevant likely ballots.

## Demographics Page

- [ ] **Rework header language** — Compact is nice but could be clearer. Suggestion: "Answer a few questions so Ballot Builder can better say how policies affect your life — everything is 100% private and always stays on your device." Add a mouseover on "private" with a pop-up (everything is optional, confidential, etc.).
- [ ] **Consider under-18 option** — Teenagers could explore and learn before voting age. Weigh pros/cons.

## Assessment (My Views Pages)

### Navigation & Framing
- [ ] **"Share your perspective on key issues" too small** — Transition to priorities section is unclear. Consider: "Next, share your perspectives on some key issues. It's okay if you aren't sure or want to learn more. This helps us match your views to candidates and ballot measures."
- [ ] **Add info icon or attention-getter on options** — Draw more attention to the dropdown/expandable content.
- [ ] **Add a sidebar/guide for first-time users** — "Review the following options and click the icon to learn more about the different options and possible pros and cons." Could appear just on the first question.
- [ ] **Make current policy item more vivid** — More visual emphasis on the active question.
- [ ] **Personalize question stems** — e.g., "In your view, who should provide health insurance?" instead of generic framing.
- [ ] **Bigger font on progress indicators** — "Two answered, three remaining" feels too small.
- [ ] **Add topic clusters at the top** — Economic, Environment, Crime, Healthcare, etc. Helps reduce burden and chunk similar ideas. Even if not used formally.
- [ ] **Add "Why did we pick these issues?"** — Somewhere on main page or sidebar. Presumably because they're debated today and on the ballots.

### Options & Selection
- [ ] **Consider multi-select** — People may want to select more than one option. Could still feed into scoring logic.
- [ ] **Review subtext vs. bold text alignment** — Sometimes subtext mirrors the header; other times it adds non-obvious extensions. Options: (1) Create a rubric for consistency, (2) Condense into a single sentence with partial bolding, e.g., "Ban assault-style weapons *(e.g., semi-automatic rifles)* and high-capacity magazines *(e.g., over 10 rounds)*."
- [ ] **Consider a thermometer/spectrum visual** — If options are ordered liberal-to-conservative or restrictive-to-permissive, a visual scale could help orient users. May introduce bias but could reduce info burden with 6-7 options.

### Trade-offs & Evidence
- [ ] **Trade-offs: icons/links for more info?** — Worth exploring from an evidence perspective, though adds burden.
- [ ] **"Trade-offs" vs. "Pros and cons"** — Consider which label is clearer for users.
- [ ] **In-text citations** — Consider (CDC 2023) style or mouseovers with more info and sources. Many people won't know IRA, Paris Agreement, IPCC. Chatbot integration could offer pre-set questions like "What is the Paris Agreement?" or "What does net zero mean?"

### NLP "Other" Option
- [ ] **Improve "Other" option UX** — First attempt repeated words back with low confidence. Second attempt worked better. Add info about what's happening on this page — icon by the confidence score or explanation of the tool.

### Boosters / Go Deeper
- [ ] **Rework "Go Deeper" prompt** — "Where your views might differ from the card you picked" is confusing. Try "Refine your views" or "Go deeper." First time it appears, show an educational sidebar explaining the benefits. Consider showing the refinement inline (same page under selected card) to reduce feeling of survey length.

### Effort Scaffolding & Save Progress
- [ ] **Add save progress / skip all option** — People may tire after 5 questions. Like iSideWith, let users answer just a few, then encourage going back. "Next time" or "Recommendation: answer a few more questions about climate and healthcare." Let people build out views over time.
- [x] **Adaptive question selection** — Does picking a certain area subset to the most relevant questions? Strategically optimize burden, then encourage additional answers later. *(Already implemented in `src/lib/adaptiveSequencer.ts`.)*

### Reference
- [ ] **Check out debunkbot.com for conversational approach** — Example of a chatbot that talks people through beliefs, hears evidence, refines views. Could inspire a more conversational mode.

## Civic Blueprint Results

- ✅ **Animal icons are fun** — Keep. Consider adding an info icon to learn/see more, like Pew typologies.
- [ ] **Consider cluster comparisons** — Like Pew's "what percentage of people share your views." Fun second-order feature, not critical.
- [ ] **Fonts feel small / accessibility** — Generally the UI feels harder for accessibility. Increase font sizes.
- [ ] **Clarify "Fine-tune"** — Unclear what it means. Does it mean changing answers or adding open-ended text? Consider "This doesn't feel exactly right" or "Let me refine this." Maybe "Yes, this feels right" / "Something's off" under each option.
- [ ] **Improve fine-tune flow** — Currently just re-answers the same questions. Add a primer: "The way we summarized your views doesn't feel exactly right. Now you can change your answers." Could integrate chatbot for users to say in their own words what feels wrong.
- [ ] **Multi-area fine-tune unclear** — Clicking areas off/on wasn't intuitive. Should it be multi-select? Highlight previously picked answer. When skipping, preserving old answers may or may not be right — consider "No preference" or "Not sure about my views."

## Personalized Ballot

- [x] **Clarify "each item" wording** — Changed to "each race and measure on your ballot."
- [x] **Match scores text too suggestive** — Changed to "See suggested candidates ranked by how closely they align with your values — but the final vote is always yours."
- [ ] **Clarify it's candidates AND measures** — Some language only mentions ballot measures; make sure both are covered.
- [ ] **Make Ask AI more discoverable** — Was hard to notice. Add contextual prompts per page: "Ask AI to help clarify your views" or "Ask AI about candidates and how you match with them."
- [ ] **Distinguish shared values vs. different priorities visually** — Consider placing them on left/right of cards.
- [ ] **Add candidate info links** — Mouseovers or icons linking to Ballotpedia, Wikipedia, or candidate websites/platforms.
- ✅ **Evidence display is cool** — Keep. Campaign, public statements, source attribution.
- [ ] **Consider column-style matching by policy sector** — Visual comparison across issues. Evaluate if helpful.
- [ ] **Add "No one" / skip option for candidates** — More prominently offer "Ask AI for more insights about these candidates."
- [x] **Value comparison sheet cramped on mobile** — The candidate summary/profile section (name, bio, policy positions) is fixed in the header, leaving very little scrollable space for the actual value alignment breakdown on phones. Moved summary and positions into the scrollable area so users can see comparisons without excessive scrolling past static content.
- [ ] **Ballot measure "Why this matters" too dense** — Font still small. Break up into paragraphs/bullets. Pros/cons arguments? Good place for an AI pop-up to explain more.

## Post-Ballot / Summary Section

- ✅ **Ballot prep time-saver is cool** — Keep. Including the four items below it (reading level, chatbots, voter guides).
- ✅ **Voting squad feature is great** — Keep "help other people prep."
- [ ] **Add email and text ballot options** — Text may be easiest to pull up at polling booth, not just print.
- [ ] **Rethink bottom-of-page items layout** — Feedback, start new session, etc. may get lost. Consider sidebar, different button styles, dropdowns, reminder emails, or a separate dashboard with "prep, get ready to vote" options.
