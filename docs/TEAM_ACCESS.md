# Team Access & Credentials Guide

> **Purpose:** Reference for which external services and environment variables are needed to work on Ballot Builder.
>
> **Specific resource IDs, console deep-links, and credentials live in the internal team wiki / 1Password — not in this repo.** This file documents the *shape* of access only.

---

## 1. Source Code & CI/CD

### GitHub


| Field         | Value                                                                                      |
| ------------- | ------------------------------------------------------------------------------------------ |
| Organization  | [Humanity-Unleashed](https://github.com/Humanity-Unleashed)                                |
| Repository    | [Ballot-Builder-Prototype](https://github.com/Humanity-Unleashed/Ballot-Builder-Prototype) |
| Clone (SSH)   | `git@github.com:Humanity-Unleashed/Ballot-Builder-Prototype.git`                           |
| Clone (HTTPS) | `https://github.com/Humanity-Unleashed/Ballot-Builder-Prototype.git`                       |
| CI/CD         | GitHub Actions — runs on push/PR to `main` and `develop`                                   |
| Access needed | Organization membership + repository write access                                          |


**To grant access:** Org admin invites the new member at `https://github.com/orgs/Humanity-Unleashed/people` → Invite member.

### GitHub Actions

- **Config file:** `.github/workflows/ci.yml`
- **Jobs:** Build & Lint, Security Scan
- **Dashboard:** `https://github.com/Humanity-Unleashed/Ballot-Builder-Prototype/actions`
- **No additional credentials needed** — uses the repository's default `GITHUB_TOKEN`.

---

## 2. Hosting & Deployment

### Vercel


| Field          | Value                                                          |
| -------------- | -------------------------------------------------------------- |
| Console        | [vercel.com](https://vercel.com) (project link in team wiki)   |
| Team           | **Humanity-Unleashed**                                         |
| Project        | `ballot-builder-prototype`                                     |
| Project ID     | *(see internal wiki / 1Password)*                              |
| Org/Team ID    | *(see internal wiki / 1Password)*                              |
| Production URL | *(Vercel-assigned — check dashboard)*                          |


**What lives here:**

- Production and preview deployments
- All environment variables (secrets, API keys, DB connection strings)
- Vercel Web Analytics dashboard
- Domain configuration

**To grant access:** Team admin invites at Vercel dashboard → Settings → Members.

**Local CLI setup:**

```bash
npm i -g vercel
vercel login
vercel link   # Select Humanity-Unleashed → ballot-builder-prototype
vercel env pull .env.local   # Pull all env vars locally
```

---

## 3. Database

### Neon Postgres


| Field      | Value                                                            |
| ---------- | ---------------------------------------------------------------- |
| Console    | [Neon Console](https://console.neon.tech) (project: Ballot Builder — direct link in team wiki) |
| Project ID | *(see internal wiki / 1Password)*                                |
| Branch     | *(see internal wiki / 1Password)*                                |
| ORM        | Prisma 7 (`prisma/schema.prisma`)                                |


**What lives here:**

- `analytics_events` — Custom event tracking
- `feedback_entries` — User feedback submissions
- `ballot_cache` — Cached ballot data from external APIs
- `voter_info_cache` — Cached voter registration deadlines by state
- `zipcode_lookups` — Cached zipcode-to-district mappings
- `user`, `account`, `session`, `verification` — Auth tables (managed by better-auth)

**Credentials:**


| Env Var        | Description                                | Value              |
| -------------- | ------------------------------------------ | ------------------ |
| `DATABASE_URL` | Pooled connection (runtime, via PgBouncer) | `postgresql://___` |
| `DIRECT_URL`   | Direct connection (migrations only)        | `postgresql://___` |


**To grant access:** Neon project admin invites at Neon Console → Settings → Members.

**Local database commands:**

```bash
npm run db:studio         # Visual browser (Prisma Studio)
npm run db:generate       # Regenerate Prisma client
npm run db:migrate:dev    # Create + apply migration
npm run db:migrate:deploy # Apply pending migrations (production)
npm run db:push           # Push schema changes (no migration file)
npm run db:seed           # Seed database
```

---

## 4. Authentication

### better-auth


| Field         | Value                                               |
| ------------- | --------------------------------------------------- |
| Library       | [better-auth](https://www.better-auth.com/) v1.4.18 |
| Server config | `src/lib/auth.ts`                                   |
| Client hook   | `src/lib/auth-client.ts`                            |
| API route     | `src/app/api/auth/[...all]/route.ts`                |
| Features      | Google OAuth, anonymous guest sessions              |


**Credentials:**


| Env Var                       | Description         | Value                         |
| ----------------------------- | ------------------- | ----------------------------- |
| `BETTER_AUTH_SECRET`          | Session signing key | `___`                         |
| `BETTER_AUTH_URL`             | Server auth URL     | `http://localhost:3000` (dev) |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | Public auth URL     | `http://localhost:3000` (dev) |


### Google OAuth


| Field   | Value                                                                                   |
| ------- | --------------------------------------------------------------------------------------- |
| Console | [Google Cloud Console — Credentials](https://console.cloud.google.com/apis/credentials) |
| Project | *(check Google Cloud Console for project name)*                                         |


**Credentials:**


| Env Var                | Description             | Value |
| ---------------------- | ----------------------- | ----- |
| `GOOGLE_CLIENT_ID`     | OAuth 2.0 Client ID     | `___` |
| `GOOGLE_CLIENT_SECRET` | OAuth 2.0 Client Secret | `___` |


**To grant access:** Google Cloud project owner adds IAM member at Console → IAM & Admin.

---

## 5. Analytics & Feedback

### Vercel Web Analytics


| Field     | Value                                           |
| --------- | ----------------------------------------------- |
| Dashboard | Vercel project dashboard → Analytics tab        |
| Package   | `@vercel/analytics` (auto-configured on deploy) |


No additional credentials — automatically active on Vercel deployments.

### Custom Analytics (Postgres)


| Field    | Value                                                  |
| -------- | ------------------------------------------------------ |
| Endpoint | `POST /api/analytics`                                  |
| Storage  | `analytics_events` table in Neon Postgres              |
| Access   | [Neon Console](https://console.neon.tech) (direct project link in team wiki) |


### Google Sheets — Feedback Mirror


| Field                 | Value                                                                                                 |
| --------------------- | ----------------------------------------------------------------------------------------------------- |
| Spreadsheet           | *(direct link in team wiki — restricted to humun.org accounts)*                                       |
| Spreadsheet ID        | *(see internal wiki / 1Password)*                                                                     |
| Service account setup | [Google Cloud Console — Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts) |
| Code                  | `src/lib/googleSheets.ts`                                                                             |


Feedback submitted via the app is stored in Postgres **and** automatically mirrored to this Google Sheet.

**Credentials:**


| Env Var                        | Description                                  | Value                             |
| ------------------------------ | -------------------------------------------- | --------------------------------- |
| `GOOGLE_SHEETS_CLIENT_EMAIL`   | Service account email                        | `___@___.iam.gserviceaccount.com` |
| `GOOGLE_SHEETS_PRIVATE_KEY`    | Service account private key (PEM, with `\n`) | `___`                             |
| `GOOGLE_SHEETS_SPREADSHEET_ID` | Target spreadsheet ID                        | `___`                             |


**To grant access:** Share the Google Sheet with the new member's Google account. For API access, the service account must have Editor access on the sheet.

---

## 6. External Data APIs

These power the live ballot pipeline and voter information features.

### Google Civic Information API


| Field    | Value                                                                                                 |
| -------- | ----------------------------------------------------------------------------------------------------- |
| Console  | [Google Cloud Console — APIs](https://console.cloud.google.com/apis/library/civicinfo.googleapis.com) |
| Base URL | `https://www.googleapis.com/civicinfo/v2`                                                             |
| Quota    | 25,000 requests/day (free)                                                                            |
| Used for | Address → districts, polling places, elected officials                                                |
| Code     | `src/server/services/externalApis.ts`                                                                 |


Also used for **Google Maps Geocoding** (`https://maps.googleapis.com/maps/api/geocode/json`) with the same API key.

**Credentials:**


| Env Var                | Description                                  | Value |
| ---------------------- | -------------------------------------------- | ----- |
| `GOOGLE_CIVIC_API_KEY` | API key (enable Civic Info + Geocoding APIs) | `___` |


### Ballotpedia API


| Field    | Value                                 |
| -------- | ------------------------------------- |
| Base URL | `https://api4.ballotpedia.org/data`   |
| Auth     | `x-api-key` header                    |
| Plan     | Paid (single-state: Michigan)         |
| Used for | Full ballot data by geographic point  |
| Code     | `src/server/services/externalApis.ts` |


**Credentials:**


| Env Var               | Description | Value |
| --------------------- | ----------- | ----- |
| `BALLOTPEDIA_API_KEY` | API key     | `___` |


### 5 Calls API


| Field    | Value                                                |
| -------- | ---------------------------------------------------- |
| Base URL | `https://api.5calls.org/v1`                          |
| Auth     | `X-5Calls-Token` header                              |
| Used for | Representatives by location (optional/supplementary) |
| Code     | `src/server/services/externalApis.ts`                |


**Credentials:**


| Env Var           | Description | Value |
| ----------------- | ----------- | ----- |
| `5_CALLS_API_KEY` | API token   | `___` |


### FVAP (Federal Voting Assistance Program)


| Field    | Value                                                  |
| -------- | ------------------------------------------------------ |
| Base URL | `https://www.fvap.gov/xml-api`                         |
| Auth     | None (public)                                          |
| Used for | Voter registration deadlines (XML, all 50 states + DC) |
| Code     | `src/server/services/fvapClient.ts`                    |


No credentials needed — public API.

---

## 7. Future / Optional APIs

These are referenced in the production roadmap (`docs/CLAUDE.md`) but not yet fully integrated:


| Service             | Purpose                                      | Env Var              |
| ------------------- | -------------------------------------------- | -------------------- |
| Vote Smart          | Interest group ratings for candidate scoring | `VOTE_SMART_API_KEY` |
| ProPublica Congress | Federal voting records                       | `PROPUBLICA_API_KEY` |
| Open States         | State-level voting records                   | `OPENSTATES_API_KEY` |
| OpenAI              | AI features (future)                         | `OPENAI_API_KEY`     |
| Anthropic           | AI features (future)                         | `ANTHROPIC_API_KEY`  |


---

## 8. New Team Member Onboarding Checklist

### Accounts to provision

- **GitHub** — Invite to [Humanity-Unleashed](https://github.com/orgs/Humanity-Unleashed/people) org with write access
- **Vercel** — Invite to Humanity-Unleashed team
- **Neon** — Invite to database project (if they need direct DB access)
- **Google Cloud** — Add to project IAM (if they need to manage API keys or OAuth)
- **Google Sheets** — Share the Feedback spreadsheet (link in internal team wiki)

### Local setup

```bash
# 1. Clone the repo
git clone git@github.com:Humanity-Unleashed/Ballot-Builder-Prototype.git
cd Ballot-Builder-Prototype

# 2. Install dependencies
npm install

# 3. Install and configure Vercel CLI
npm i -g vercel
vercel login
vercel link   # Select Humanity-Unleashed → ballot-builder-prototype

# 4. Pull environment variables
vercel env pull .env.local

# 5. Verify setup
npm run build         # Should succeed
npm run test:run      # Run unit tests
npm run dev           # Start dev server at http://localhost:3000
```

### Key docs to read

1. [README.md](../README.md) — Project overview and features
2. [docs/ARCHITECTURE.md](./ARCHITECTURE.md) — System design
3. [docs/GETTING_STARTED.md](./GETTING_STARTED.md) — Development workflow
4. [docs/ASSESSMENT_PIPELINE.md](./ASSESSMENT_PIPELINE.md) — Scoring algorithms
5. [docs/API_ROUTES.md](./API_ROUTES.md) — All 53 API endpoints
6. [docs/CLAUDE.md](./CLAUDE.md) — Production roadmap

---

## 9. Quick Reference — All Environment Variables


| Env Var                        | Required | Category  | Where to get it                                                                    |
| ------------------------------ | -------- | --------- | ---------------------------------------------------------------------------------- |
| `NODE_ENV`                     | Yes      | App       | Set to `development` locally                                                       |
| `BETTER_AUTH_SECRET`           | Yes      | Auth      | Generate a random string                                                           |
| `BETTER_AUTH_URL`              | Yes      | Auth      | `http://localhost:3000` (dev)                                                      |
| `NEXT_PUBLIC_BETTER_AUTH_URL`  | Yes      | Auth      | `http://localhost:3000` (dev)                                                      |
| `GOOGLE_CLIENT_ID`             | Yes      | Auth      | [Google Cloud Console](https://console.cloud.google.com/apis/credentials)          |
| `GOOGLE_CLIENT_SECRET`         | Yes      | Auth      | [Google Cloud Console](https://console.cloud.google.com/apis/credentials)          |
| `DATABASE_URL`                 | Yes      | Database  | [Neon Console](https://console.neon.tech) → Connection Details                     |
| `DIRECT_URL`                   | Yes      | Database  | [Neon Console](https://console.neon.tech) → Connection Details                     |
| `GOOGLE_SHEETS_CLIENT_EMAIL`   | Optional | Feedback  | [Google Cloud Console](https://console.cloud.google.com/iam-admin/serviceaccounts) |
| `GOOGLE_SHEETS_PRIVATE_KEY`    | Optional | Feedback  | Service account key JSON                                                           |
| `GOOGLE_SHEETS_SPREADSHEET_ID` | Optional | Feedback  | Google Sheets URL                                                                  |
| `GOOGLE_CIVIC_API_KEY`         | Optional | Data APIs | [Google Cloud Console](https://console.cloud.google.com/apis/credentials)          |
| `BALLOTPEDIA_API_KEY`          | Optional | Data APIs | Ballotpedia account                                                                |
| `5_CALLS_API_KEY`              | Optional | Data APIs | 5Calls account                                                                     |
| `OPENAI_API_KEY`               | Optional | Future    | [OpenAI Platform](https://platform.openai.com/api-keys)                            |
| `ANTHROPIC_API_KEY`            | Optional | Future    | [Anthropic Console](https://console.anthropic.com/)                                |


> **Shortcut:** Most developers can skip manual setup — just run `vercel env pull .env.local` to get all variables at once from the Vercel project.

