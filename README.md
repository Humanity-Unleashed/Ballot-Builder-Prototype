# Ballot Builder

**Help voters vote with confidence.**

Ballot Builder is a civic-tech tool that demystifies ballots, explains candidates and measures in plain language, and helps users align their votes with their personal values—without ever telling them how to vote.

---

## The Problem

Voting is a fundamental civic act, but ballots can be overwhelming:

- Dozens of candidates and measures with unfamiliar names
- Dense legal language that obscures meaning
- Limited time to research every choice
- No easy way to connect personal values to ballot options

Many voters feel underprepared, leading to skipped races, random selections, or disengagement from the process entirely.

---

## What Ballot Builder Does

Ballot Builder helps users:

1. **Understand their ballot** — Plain-language explanations for every item
2. **Explore candidates** — Neutral summaries of positions and backgrounds
3. **See alignment with their values** — Transparent scores based on user-defined priorities
4. **Make informed choices** — Complete a virtual ballot at their own pace
5. **Take it to the polls** — Export or print their selections for reference

Ballot Builder activates only when an official ballot is available for the user's district.

---

## How It Works

### 1. Intake Questionnaire
Users provide basic information (location, demographics, policy interests) to load their specific ballot.

### 2. Civic Blueprint
An ongoing preference-learning system using sliders and swipe-based interactions to understand user values and priorities.

### 3. Ballot Exploration
Users browse their ballot section-by-section with AI-generated explanations, candidate summaries, and alignment scores.

### 4. Alignment Scoring
Each candidate or measure receives a transparent alignment score with explanations of how it was calculated.

### 5. Virtual Ballot Completion
Users mark their choices and review their completed ballot with a progress visualization.

### 6. Export & Reminders
Print or export the virtual ballot. Receive election reminders and poll location information.

---

## Features

- Intake questionnaire with district lookup
- Ongoing Civic Blueprint (value preference learning)
- Sample ballot ingestion (PDF + OCR support)
- AI-generated ballot explanations
- Candidate alignment scores with transparent methodology
- Confidence gauge showing uncertainty levels
- Ballot browser with progress visualization
- Contextual AI chatbot (scoped to specific ballot items)
- Export/print virtual ballot
- Election reminders and poll locator

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Mobile App | React Native, TypeScript |
| Backend API | Node.js / Express (Dockerized) |
| Data | Static JSON (MVP); Postgres + ClickHouse (planned) |
| AI | OpenAI / Claude / Groq / DeepInfra with RAG |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│              Mobile App (React Native)                  │
│            iOS + Android, TypeScript                    │
│          [Runs locally - not in Docker]                 │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTP/REST
                      ▼
┌─────────────────────────────────────────────────────────┐
│              Backend API [Docker Container]             │
│                  Node.js / Express                      │
│           (API endpoints, LLM wrappers, caching)        │
└─────────────────────┬───────────────────────────────────┘
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
┌──────────────────┐    ┌──────────────────┐
│   Data Layer     │    │    AI Layer      │
│  JSON / Postgres │    │  RAG + LLM APIs  │
│   (ballots,      │    │  (explanations,  │
│   candidates)    │    │   alignment)     │
└──────────────────┘    └──────────────────┘
```

---

## AI Usage and Limitations

Ballot Builder uses large language models to generate explanations and analyze alignment. Important limitations:

**What AI does:**
- Generates plain-language summaries of ballot items
- Synthesizes candidate position information
- Calculates alignment based on user preferences and available data

**What AI does NOT do:**
- Recommend how to vote
- Express political opinions
- Guarantee accuracy of all information

**Safeguards:**
- All AI outputs include confidence indicators
- RAG (retrieval-augmented generation) grounds responses in source data
- One LLM call per ballot item maintains consistency
- Chatbot is scoped to specific ballot items to prevent drift

**Known risks we actively mitigate:**
- Hallucination (addressed via RAG and source citation)
- Implicit bias (addressed via neutral prompting and tone review)
- Overconfidence (addressed via explicit uncertainty language)

---

## Data Sources

- Official ballot data (ingested per district)
- Candidate information from public sources
- User-provided preferences (Civic Blueprint)
- Mock data for development (JSON fixtures)

All data handling prioritizes accuracy, recency, and transparency about limitations.

---

## Ethical and Trust Commitments

1. **Non-partisan**: We do not advocate for any candidate, party, or position
2. **Transparent**: Alignment scores include explanations of methodology
3. **Honest**: We surface uncertainty and limitations clearly
4. **User-controlled**: Users define their own values; we reflect, not direct
5. **Privacy-respecting**: Voting preferences are sensitive; we handle them accordingly
6. **Accessible**: Plain language for users of all backgrounds

---

## Project Status

**Current: Prototype / MVP**

This project is in early development. Current state:
- Single-page prototype
- Static JSON data (mock ballots, candidates, personas)
- Core UI components in development
- AI integration in progress

Not yet implemented:
- Production database
- Live ballot data ingestion
- Full OCR pipeline
- Analytics infrastructure

---

## Getting Started

Ballot Builder has two main components:

| Component | Runs In | Description |
|-----------|---------|-------------|
| **Backend API** | Docker container | Express server that handles data and AI integrations |
| **Mobile App** | Local device | React Native app (requires iOS Simulator or Android Emulator) |

---

## Part 1: Setting Up the Backend (Docker)

The backend runs in Docker, which packages everything into a container that works the same on any computer.

### Step 1: Install Docker Desktop

**For Windows:**
1. Go to [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/)
2. Click "Download for Windows"
3. Run the installer (Docker Desktop Installer.exe)
4. Follow the installation wizard
5. Restart your computer when prompted
6. Open Docker Desktop from your Start menu

**For Mac:**
1. Go to [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/)
2. Click "Download for Mac" (choose Intel or Apple Chip based on your Mac)
3. Open the downloaded .dmg file
4. Drag Docker to your Applications folder
5. Open Docker from Applications

**For Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install docker.io docker-compose-plugin
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
# Log out and back in for group change to take effect
```

### Step 2: Verify Docker is Working

Open a terminal and run:
```bash
docker --version
```
You should see: `Docker version 24.x.x` or similar.

### Step 3: Clone the Project

```bash
git clone https://github.com/actualizeit/Ballot-Builder.git
cd Ballot-Builder
```

### Step 4: Set Up Environment Variables

```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

Open `.env` in a text editor and add your API key:
```
OPENAI_API_KEY=sk-your-api-key-here
```

### Step 5: Start the Backend

```bash
docker compose up
```

The API will be available at: `http://localhost:3001`

Test it by visiting `http://localhost:3001/health` in your browser.

### Backend Commands Reference

| Action | Command |
|--------|---------|
| Start backend | `docker compose up` |
| Start in background | `docker compose up -d` |
| Stop backend | `docker compose down` |
| View logs | `docker compose logs -f api` |
| Rebuild after changes | `docker compose up --build` |

---

## Part 2: Development with Dev Containers (For Developers)

Dev Containers let you code **inside** the Docker container with a fully configured development environment. This means every developer gets the exact same setup automatically.

### What You Need

- [VS Code](https://code.visualstudio.com/) or [Cursor](https://cursor.sh/)
- [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
- Docker Desktop (installed in Part 1)

### How to Use Dev Containers

1. **Open the project folder** in VS Code or Cursor

2. **Open in Container**: You'll see a popup asking "Reopen in Container" - click it
   - Or press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
   - Type "Dev Containers: Reopen in Container"
   - Press Enter

3. **Wait for setup**: First time takes a few minutes as it builds the container and installs dependencies

4. **Start coding**: You're now working inside the container with:
   - Node.js 20
   - All dependencies installed
   - ESLint, Prettier, and other tools configured
   - Port 3001 automatically forwarded

### Benefits for Your Team

- **Consistent environment**: Everyone has identical Node.js version, dependencies, and tools
- **No "works on my machine" issues**: The container is the same everywhere
- **Quick onboarding**: New developers just open the project and everything works
- **Isolated**: Won't conflict with other projects or system configurations

---

## Part 3: Setting Up the Mobile App (React Native)

React Native apps cannot run in Docker because they need device emulators. You'll set this up locally.

### Prerequisites

**For iOS Development (Mac only):**
1. Install [Xcode](https://apps.apple.com/us/app/xcode/id497799835) from the App Store
2. Open Xcode and install additional components when prompted
3. Install Xcode Command Line Tools:
   ```bash
   xcode-select --install
   ```

**For Android Development (Windows, Mac, or Linux):**
1. Download [Android Studio](https://developer.android.com/studio)
2. Run the installer and follow the setup wizard
3. In Android Studio, go to: Tools → SDK Manager
4. Install Android SDK (API 33 or higher)
5. Set up an Android Virtual Device (AVD):
   - Tools → Device Manager → Create Device
   - Choose a phone (e.g., Pixel 6)
   - Download a system image
   - Finish setup

**All platforms:**
1. Install [Node.js](https://nodejs.org/) (v18 or higher)

### Setting Up the Mobile App

```bash
# Navigate to the mobile folder
cd mobile

# Install dependencies
npm install

# Install iOS dependencies (Mac only)
cd ios && pod install && cd ..
```

### Running the Mobile App

**Start the Metro bundler:**
```bash
npm start
```

**Run on iOS (Mac only):**
```bash
npm run ios
```

**Run on Android:**
```bash
npm run android
```

### Connecting to the Backend

The mobile app connects to the backend API. Make sure:
1. The backend is running (`docker compose up`)
2. Update the API URL in the mobile app config to point to your computer's IP address (not `localhost`) when testing on a physical device

---

## Troubleshooting

### Docker Issues

**"docker: command not found"**
- Make sure Docker Desktop is installed and running
- Restart your computer after installation

**"Cannot connect to the Docker daemon"**
- Open Docker Desktop and wait for it to fully start
- Look for the whale icon in your system tray

**"Port 3001 is already in use"**
- Stop whatever is using that port, or change the port in `docker-compose.yml`

### Dev Container Issues

**"Reopen in Container" doesn't appear**
- Make sure the Dev Containers extension is installed
- Press `Ctrl+Shift+P` and search for "Dev Containers: Reopen in Container"

**Container build fails**
- Check that Docker Desktop is running
- Try: `docker compose down` then reopen in container

### React Native Issues

**iOS build fails**
- Run `cd ios && pod install && cd ..`
- Make sure Xcode is up to date

**Android emulator won't start**
- Enable virtualization in your BIOS settings
- Make sure an AVD is created in Android Studio

**Can't connect to backend**
- Verify backend is running: `curl http://localhost:3001/health`
- On physical devices, use your computer's IP address instead of `localhost`

---

## Contributing

Contributions are welcome. Please read `AGENTS.md` for context on our non-partisan principles and tone requirements.

Key guidelines:
- Maintain political neutrality in all content
- Prioritize transparency over engagement
- When uncertain, err toward humility and caution

---

## License

[License information to be added]

---

## Acknowledgments

Ballot Builder is part of a larger Civic Empowerment Platform aimed at increasing informed participation in democracy.

---

*Building civic trust, one ballot at a time.*
