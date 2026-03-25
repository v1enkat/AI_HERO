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
| Frontend | Vanilla HTML, CSS, JavaScript (no frameworks) |
| AI/LLM | Groq API with LLaMA 3.3 70B Versatile |
| Geolocation | Browser Geolocation API + OpenStreetMap Nominatim |
| Storage | localStorage (client-side, no backend) |
| Fonts | Playfair Display, DM Sans, Syne, JetBrains Mono (Google Fonts) |

---

## Project Structure

```
ai-heros/
├── index.html           # Landing page with 8-theme showcase
├── app.html             # Main application (dashboard + all modules)
├── app.css              # Application styles (light/dark themes)
├── app.js               # Combined application logic (standalone)
├── app.state.js         # State management (localStorage persistence)
├── app.init.js          # App initialization and event binding
├── app.router.js        # Client-side page routing
├── app.ui.js            # UI utilities (modal, toast, theme)
├── app.dashboard.js     # Dashboard with insights, schedule, suggestions
├── app.productivity.js  # Task management + energy tracker
├── app.scheduler.js     # Smart Scheduler with AI day planning
├── app.learning.js      # AI Instructor + course system
├── app.home.js          # Grocery, meal plan, family, geo-reminders
├── app.finance.js       # Expense tracking + budget management
├── app.leadership.js    # Email rewriter + negotiation scripts
├── app.branding.js      # LinkedIn, elevator pitch, social posts
├── app.wellness.js      # Mood, sleep, cycle tracking, breaks
├── app.ai-engine.js     # AI brain (LLM integration + rule-based fallback)
├── app.ai-chat.js       # Chat interface
├── app.settings.js      # User settings + API key management
├── architecture.html    # Technical architecture documentation
├── presentation.html    # Project presentation/pitch deck
├── config.example.js    # Example config (copy to config.js)
└── .gitignore
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Gayatri-Kharat/HER-AI.git
cd HER-AI
```

### 2. Set up the AI API key (optional)

Copy the example config and add your [Groq API key](https://console.groq.com/keys):

```bash
cp config.example.js config.js
```

Edit `config.js`:

```javascript
const CONFIG = {
  GROQ_API_KEY: 'your-groq-api-key-here',
  GROQ_MODEL: 'llama-3.3-70b-versatile'
};
```

> Without an API key, the app still works with built-in rule-based responses. The LLM adds personalized, conversational AI responses.

### 3. Start a local server

```bash
python -m http.server 8080
```

### 4. Open in browser

Visit [http://localhost:8080](http://localhost:8080) for the landing page, or [http://localhost:8080/app.html](http://localhost:8080/app.html) to go directly to the dashboard.

---

## How the AI Engine Works

The AI engine uses a **dual-layer architecture**:

1. **Rule-Based Layer** — Instant responses using keyword matching and user data (tasks, budget, moods, cycle). Works offline, no API key needed.
2. **LLM Layer** — Sends user context + live data to Groq's LLaMA 3.3 70B for personalized, conversational responses. Falls back to rule-based if unavailable.

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
- **Zero backend** — fully client-side, private, no data leaves your browser
- **One AI brain** with shared context — your budget affects your schedule, your mood affects your tasks

---

## License

This project was built for the AI Heros competition.

---

*Built with purpose by [Gayatri Kharat](https://github.com/Gayatri-Kharat)*
