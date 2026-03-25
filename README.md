# AI HER-AI — The Life Operating System for Women

> *"She doesn't need another app. She needs an AI that sees her whole life — and helps her run it."*

AI HER-AI is the world's first **Life Operating System** designed exclusively for women. It integrates productivity, finance, wellness, leadership, learning, and personal branding into one **cycle-aware, emotionally intelligent AI brain** — because her life isn't compartmentalized, and her tools shouldn't be either.

---

## 8 Life Dimensions

| # | Dimension | Feature |
|---|---|---|
| 01 | **Daily Work Productivity** | Energy-based task planning, focus blocks, burnout detection |
| 02 | **Time Management & Planning** | Smart Scheduler with cycle-aware daily plans and workload prediction |
| 03 | **Learning & Skill Building** | AI Instructor with structured courses (Excel, Python, Communication, UI/UX) |
| 04 | **Home & Family Management** | Grocery lists, AI meal planning, family events, geo-reminders |
| 05 | **Finance & Budgeting** | Expense tracking, income management, spending insights |
| 06 | **Leadership & Communication** | Email rewriting, salary negotiation scripts, confidence tools |
| 07 | **Personal Branding** | LinkedIn headline generator, elevator pitch creator, social media posts |
| 08 | **Health & Wellness** | Mood tracking, sleep logging, menstrual cycle tracking, break reminders |

---

## Key Features

- **Unified AI Brain** — One AI engine powers all 8 dimensions, with shared context across features
- **Cycle-Aware Intelligence** — Adapts productivity, scheduling, and wellness suggestions based on menstrual cycle phase (menstrual, follicular, ovulation, luteal)
- **Energy-Based Task Management** — Tasks are highlighted or dimmed based on your current energy level to help you focus on what matches your state
- **Real Geo-Reminders** — Uses browser geolocation + OpenStreetMap reverse geocoding to notify you when near a store on your grocery list
- **AI Chat** — Conversational assistant powered by Groq LLM (LLaMA 3.3 70B) with full context of your tasks, budget, moods, and schedule
- **AI Instructor** — Structured 4-week courses with lessons, practice tasks, and quizzes
- **Smart Scheduler** — AI auto-plans your day with cycle-phase adjustments and workload balancing
- **Dark/Light Theme** — Full theme support with persistent preference
- **Offline-First** — All data stored in localStorage, works without internet (except AI chat)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, React Router (`client/`) |
| Backend | Node.js, Express (`server/`) — Groq proxy + optional static SPA |
| State | Zustand with `localStorage` persistence (`herai_data`, same key as the original app) |
| AI/LLM | Groq API with LLaMA 3.3 70B Versatile (optional; rule-based fallback offline) |
| Geolocation | Browser Geolocation API + OpenStreetMap Nominatim (geo-reminders) |
| Storage | localStorage (client-side); API keys for Groq stay on the server in the default setup |
| Fonts | Inter, JetBrains Mono (Google Fonts) |

---

## Project Structure

Monorepo (npm workspaces): **client** (Vite + React) and **server** (Express API).

```
ai-heros/
├── package.json               # workspaces, dev: client + server
├── client/
│   ├── index.html
│   ├── vite.config.ts         # proxies /api → Node (dev)
│   ├── package.json
│   ├── public/
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── components/
│       ├── pages/
│       ├── store/useHerAIStore.ts
│       ├── services/aiEngine.ts
│       ├── services/groqClient.ts
│       ├── data/courseData.json
│       └── styles/app.css
├── server/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/index.ts           # /api/v1/chat/completions, /api/health, prod static
├── archive/legacy/            # Old vanilla app (reference only; not used by React)
├── scripts/extract-course-data.mjs
├── .env.example
└── .gitignore
```

---

## Getting Started

### 1. Install dependencies

```bash
cd ai-heros
npm install
```

### 2. Groq API key (server)

Copy `.env.example` to `.env` at the **repo root** and set:

```
GROQ_API_KEY=your-key
```

The Node server uses this to call Groq; the browser only calls `/api/...` (no key in the bundle). You can still paste a key in **Settings** to override from the client.

### 3. Development (client + API)

```bash
npm run dev
```

Starts Express on port **3001** and Vite on **5173** (with `/api` proxied to the server). Open [http://localhost:5173](http://localhost:5173).

### 4. Production

```bash
npm run build
npm start
```

Builds `client/dist` and `server/dist`, then runs the server. If `client/dist` exists, the same port serves the SPA and `/api/*` (default **3001**). Open `http://localhost:3001`.

### 5. Client-only / static hosting

If you deploy only the Vite build to a static host, set `VITE_GROQ_DIRECT=1` and a client key (`VITE_GROQ_API_KEY` or Settings), or point `VITE_API_URL` at a deployed API.

---

## How the AI Engine Works

The AI engine uses a **dual-layer architecture**:

1. **Rule-Based Layer** — Instant responses using keyword matching and user data (tasks, budget, moods, cycle). Works offline, no API key needed.
2. **LLM Layer** — Sends user context + live data to Groq via the **server proxy** (or direct from the browser if configured). Falls back to rule-based if unavailable.

The AI context includes: user name, energy level, pending tasks, budget status, cycle phase, recent moods, and sleep data — making every response personalized.

---

## Screenshots

| Landing Page | Dashboard | Productivity Engine |
|---|---|---|
| `index.html` | AI-powered insights & schedule | Energy-based task management |

---

## What Makes It Unique

- **No other app** combines all 8 life dimensions into one AI system
- **Cycle-aware** scheduling and productivity — adapts to biological rhythms
- **Energy-first** task management — not just priority, but how you *feel*
- **Privacy-first** — app data stays in the browser; Groq calls go through your API by default so keys stay on the server
- **One AI brain** with shared context — your budget affects your schedule, your mood affects your tasks

---

## License

This project was built for the AI Heros competition.

---

*Built with purpose by [Gayatri Kharat](https://github.com/Gayatri-Kharat)*
