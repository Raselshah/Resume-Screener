# ResumeAI — AI-Powered Resume Screener (100% Free)

A full-stack MERN app using **Groq API** (free, no install, no credit card) to analyze resumes against job descriptions with AI.

---

## Tech Stack

| Layer    | Tech                                        |
|----------|---------------------------------------------|
| Frontend | React, React Router, Axios                  |
| Backend  | Node.js, Express                            |
| Database | MongoDB + Mongoose                          |
| AI       | Groq API — Llama 3 (free, 14,400 req/day)  |
| Auth     | JWT + bcryptjs                              |

---

## Why Groq?

- ✅ Free — 14,400 requests/day, no credit card
- ✅ No install needed — cloud API
- ✅ Extremely fast — fastest free LLM API
- ✅ Uses Llama 3 (open-source model)
- ✅ Falls back to rule-based analysis if quota exceeded

---

## Get your FREE Groq API Key

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up (free, no credit card)
3. Go to **API Keys** → **Create API Key**
4. Copy it into your `.env` file

---

## Setup & Run

### 1. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment

```bash
# backend/.env  (copy from .env.example)
PORT=5000
MONGO_URI=mongodb://localhost:27017/resume_screener
JWT_SECRET=your_super_secret_key_change_this
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama3-8b-8192
CLIENT_URL=http://localhost:3000
```

```bash
# frontend/.env
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Start MongoDB

```bash
mongod
```

### 4. Run the servers

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm start
```

App runs at: **http://localhost:3000**

---

## Free Groq Models Available

| Model               | Speed    | Quality  |
|---------------------|----------|----------|
| llama3-8b-8192      | Fastest  | Good ✅  |
| llama3-70b-8192     | Fast     | Best ⭐  |
| mixtral-8x7b-32768  | Fast     | Great 🔥 |

Change model by updating `GROQ_MODEL` in your `.env`.

---

## API Endpoints

| Method | Endpoint            | Auth | Description                     |
|--------|---------------------|------|---------------------------------|
| POST   | /api/auth/register  | No   | Register new user               |
| POST   | /api/auth/login     | No   | Login, returns JWT              |
| GET    | /api/auth/me        | Yes  | Get current user                |
| POST   | /api/analyze        | Yes  | AI analysis (Groq + fallback)   |
| GET    | /api/history        | Yes  | List all analyses for user      |
| GET    | /api/history/:id    | Yes  | Get single analysis detail      |
| DELETE | /api/history/:id    | Yes  | Delete an analysis              |

---

## Resume Talking Points

- Built full-stack AI SaaS with **zero cost** using Groq free tier
- Integrated **Llama 3 via Groq API** with graceful rule-based fallback
- Implemented JWT auth, rate limiting, and protected routes
- Designed React context-based global auth state with React Router v6
- Parsed structured JSON output from LLM for consistent data storage


A full-stack MERN app that uses **Ollama (local AI)** to analyze resumes against job descriptions. No paid API keys required — runs entirely on your machine.

---

## Tech Stack

| Layer    | Tech                                      |
|----------|-------------------------------------------|
| Frontend | React, React Router, Axios                |
| Backend  | Node.js, Express                          |
| Database | MongoDB + Mongoose                        |
| AI       | Ollama (local) — Llama 3 / Mistral (free)|
| Auth     | JWT + bcryptjs                            |

---

## How the AI works

1. **Primary:** Sends prompt to Ollama running locally on `localhost:11434`
2. **Fallback:** If Ollama is offline, uses a built-in rule-based keyword matcher
3. **No API key needed. No cost. No internet required for AI.**

---

## Project Structure

```
resume-screener/
├── backend/
│   ├── config/db.js          # MongoDB connection
│   ├── middleware/auth.js    # JWT protection middleware
│   ├── models/
│   │   ├── User.js           # User schema
│   │   └── Analysis.js       # Analysis schema
│   ├── routes/
│   │   ├── auth.js           # /api/auth
│   │   ├── analyze.js        # /api/analyze (Ollama AI + fallback)
│   │   └── history.js        # /api/history
│   ├── server.js
│   ├── .env.example
│   └── package.json
│
└── frontend/
    └── src/
        ├── api/axios.js
        ├── context/AuthContext.js
        ├── components/ (Navbar, ProtectedRoute)
        └── pages/ (Login, Register, Dashboard, History, AnalysisDetail)
```

---

## Setup & Run

### 1. Install Ollama (free local AI)

```bash
# macOS / Linux
curl -fsSL https://ollama.com/install.sh | sh

# Windows: download from https://ollama.com/download
```

### 2. Pull a free model

```bash
ollama pull llama3       # recommended (~4GB)
# OR
ollama pull mistral      # lighter option (~4GB)
# OR
ollama pull phi3         # very lightweight (~2GB)
```

### 3. Start Ollama

```bash
ollama serve
# Runs on http://localhost:11434
```

### 4. Install project dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 5. Configure environment

```bash
# backend/.env
PORT=5000
MONGO_URI=mongodb://localhost:27017/resume_screener
JWT_SECRET=your_super_secret_key_change_this
OLLAMA_MODEL=llama3
CLIENT_URL=http://localhost:3000
```

```bash
# frontend/.env
REACT_APP_API_URL=http://localhost:5000/api
```

### 6. Start MongoDB

```bash
mongod
```

### 7. Run the app

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm start
```

App runs at: **http://localhost:3000**

---

## API Endpoints

| Method | Endpoint            | Auth | Description                    |
|--------|---------------------|------|--------------------------------|
| POST   | /api/auth/register  | No   | Register new user              |
| POST   | /api/auth/login     | No   | Login, returns JWT             |
| GET    | /api/auth/me        | Yes  | Get current user               |
| POST   | /api/analyze        | Yes  | AI analysis (Ollama + fallback)|
| GET    | /api/history        | Yes  | List all analyses for user     |
| GET    | /api/history/:id    | Yes  | Get single analysis detail     |
| DELETE | /api/history/:id    | Yes  | Delete an analysis             |

---

## Resume Talking Points

- Built full-stack AI SaaS app with **zero external API costs**
- Integrated **Ollama local LLM** (Llama 3) with graceful rule-based fallback
- Implemented JWT authentication, rate limiting, and protected routes
- Designed React context-based global auth state with React Router v6
- Handled structured JSON output parsing from LLM responses


A full-stack MERN app that uses the Claude AI API to analyze resumes against job descriptions, returning a match score, keyword analysis, and actionable suggestions.

---

## Tech Stack

| Layer    | Tech                              |
|----------|-----------------------------------|
| Frontend | React, React Router, Axios        |
| Backend  | Node.js, Express                  |
| Database | MongoDB + Mongoose                |
| AI       | Anthropic Claude API              |
| Auth     | JWT + bcryptjs                    |

---

## Project Structure

```
resume-screener/
├── backend/
│   ├── config/db.js          # MongoDB connection
│   ├── middleware/auth.js    # JWT protection middleware
│   ├── models/
│   │   ├── User.js           # User schema
│   │   └── Analysis.js       # Analysis schema
│   ├── routes/
│   │   ├── auth.js           # /api/auth (register, login, me)
│   │   ├── analyze.js        # /api/analyze (AI analysis)
│   │   └── history.js        # /api/history (CRUD)
│   ├── server.js             # Express entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── public/index.html
    ├── src/
    │   ├── api/axios.js           # Axios instance + interceptors
    │   ├── context/AuthContext.js # Global auth state
    │   ├── components/
    │   │   ├── Navbar.js
    │   │   └── ProtectedRoute.js
    │   ├── pages/
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   ├── Dashboard.js       # Main screener UI
    │   │   ├── History.js         # Past analyses list
    │   │   └── AnalysisDetail.js  # Single analysis view
    │   ├── App.js                 # Routes
    │   ├── App.css                # Global styles
    │   └── index.js
    └── package.json
```

---

## Setup & Run

### 1. Clone and install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure environment variables

```bash
# backend/.env  (copy from .env.example)
PORT=5000
MONGO_URI=mongodb://localhost:27017/resume_screener
JWT_SECRET=your_super_secret_jwt_key_change_this
ANTHROPIC_API_KEY=your_anthropic_api_key_here
CLIENT_URL=http://localhost:3000
```

```bash
# frontend/.env  (copy from .env.example)
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Start MongoDB

```bash
mongod
```

### 4. Run the servers

```bash
# Terminal 1 — backend
cd backend && npm run dev

# Terminal 2 — frontend
cd frontend && npm start
```

App runs at: http://localhost:3000

---

## API Endpoints

| Method | Endpoint            | Auth | Description                    |
|--------|---------------------|------|--------------------------------|
| POST   | /api/auth/register  | No   | Register new user              |
| POST   | /api/auth/login     | No   | Login, returns JWT             |
| GET    | /api/auth/me        | Yes  | Get current user               |
| POST   | /api/analyze        | Yes  | Run AI analysis, save result   |
| GET    | /api/history        | Yes  | List all analyses for user     |
| GET    | /api/history/:id    | Yes  | Get single analysis detail     |
| DELETE | /api/history/:id    | Yes  | Delete an analysis             |

---

## Key Features

- JWT authentication (register, login, protected routes)
- Claude AI integration for resume-JD matching
- Match score (0-100) with label and summary
- Matched and missing keyword extraction
- 5 actionable improvement suggestions
- Persistent analysis history per user
- Rate limiting on auth and analyze routes

---

## Resume Talking Points

- Built a full-stack AI SaaS app with JWT auth, REST API, and MongoDB
- Integrated Anthropic Claude API with structured JSON output parsing
- Implemented rate limiting, error handling, and token-based auth middleware
- Designed React context-based global state with protected routing
