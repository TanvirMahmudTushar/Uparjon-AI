# Uparjon AI - AI-Powered Fintech Platform

> A comprehensive full-stack fintech platform which will empower freelancers with AI-driven task verification, instant payments, credit scoring, fraud detection, gamification, and Web3 rewards.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [License](#license)

---

## 🌟 Overview

**Uparjon AI** is a revolutionary fintech platform designed to transform the freelance economy. It combines cutting-edge AI technology with blockchain integration to provide:

- ✅ **AI-Powered Task Verification** - Authenticate work using Groq AI
- 💳 **Instant Payment Processing** - Secure payments via bKash/Nagad
- 📊 **Credit Score Building** - Build CredScore BD profiles
- 🛡️ **Fraud Detection** - Real-time AI-based fraud prevention
- 🎮 **Gamification System** - Achievements, badges, and leaderboards
- 🔗 **Web3 Integration** - NFT badges and crypto rewards (WPAY tokens)
- 📈 **Advanced Analytics** - Predictive insights and workplace analysis
- 🤖 **AI Chat Assistant** - Intelligent workplace advisor with file upload support

---

## ✨ Features

### 🤖 AI & Intelligence
- **AI Chat Assistant** - Context-aware workplace advisor powered by Groq AI (Llama 3.3 70B)
  - Multi-session chat history management
  - File upload support (images, PDFs, documents up to 10MB)
  - Analysis types: General, Performance, Team, Strategy, Conflict
  - Chat history with session management
- **Predictive Analytics** - 7-day task completion forecasts with confidence scores
- **Anomaly Detection** - Identify unusual work patterns and behaviors
- **Sentiment Analysis** - Analyze conversation sentiment and team morale
- **Workplace Analysis** - Comprehensive performance metrics and insights

### 💰 Payments & Finance
- **Instant Payments** - Process payments through bKash/Nagad
- **Payment Dashboard** - Transaction history and analytics
- **Credit Scoring** - Dynamic credit profile building with CredScore BD
- **Fraud Detection** - Real-time transaction risk assessment
- **ROI Calculator** - Project revenue and expense forecasting

### 🎮 Gamification & Engagement
- **Achievement System** - Unlock badges (Task Master, Speed Demon, Perfect Score, Leadership)
- **Global Leaderboard** - Compete with users based on points and streaks
- **Streak Tracking** - Maintain daily activity streaks
- **Points & Rewards** - Earn points for completed tasks and milestones
- **User Rankings** - Real-time global rankings

### 🔗 Web3 & Crypto
- **Crypto Wallet Integration** - Connect MetaMask, WalletConnect
- **WPAY Token System** - Earn and spend platform tokens
- **NFT Badges** - Mint achievement-based NFTs
- **Transaction History** - Track all crypto transactions
- **Token Rewards** - Get rewarded in WPAY for achievements

### 🔐 Security & Compliance
- **Two-Factor Authentication (2FA)** - Enhanced account security
- **Audit Logging** - Complete action tracking and compliance
- **Role-Based Access Control (RBAC)** - Admin, Manager, User roles
- **Compliance Badges** - GDPR, SOC 2, ISO 27001, PCI DSS certifications

### 🔌 Integrations & Automation
- **Third-Party Integrations** - Slack, Microsoft Teams, Google Calendar, Zapier
- **Webhook System** - Event-driven notifications
- **Automation Rules** - Trigger-based task automation
- **Custom Workflows** - Build automated task pipelines

### 📊 Analytics & Reporting
- **Custom Reports** - Generate filtered reports by date, status, category
- **Export Functionality** - Download reports as CSV/JSON
- **Visual Analytics** - Charts and graphs with Recharts
- **Performance Metrics** - Track KPIs and productivity metrics

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS + ShadCN UI Components
- **Charts**: Recharts
- **Icons**: Lucide React
- **State Management**: React Hooks
- **Theme**: Dark/Light mode with next-themes

### Backend
- **Framework**: FastAPI (Python)
- **Database**: SQLite with better-sqlite3
- **ORM**: SQLAlchemy
- **AI/ML**: Groq SDK (Llama 3.3 70B Versatile)
- **Authentication**: Custom JWT-based auth

### DevOps & Tools
- **Package Manager**: pnpm
- **Build Tool**: Turbopack (Next.js 16)
- **Linting**: ESLint + TypeScript
- **Version Control**: Git

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18.0.0 or higher ([Download](https://nodejs.org/))
- **pnpm**: Latest version (`npm install -g pnpm`)
- **Python**: 3.9 or higher ([Download](https://python.org/))
- **pip**: Python package manager (included with Python)
- **Git**: For version control ([Download](https://git-scm.com/))
- **Groq API Key**: Sign up at [console.groq.com](https://console.groq.com)

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/uparjon-ai.git
cd uparjon-ai
```

### 2. Frontend Setup

```bash
# Install dependencies
pnpm install

# Create environment file
cp .env.example .env.local
```

**Edit `.env.local`** and add your Groq API key:
```env
GROQ_API_KEY=your_groq_api_key_here
```

### 3. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Return to root directory
cd ..
```

### 4. Database Initialization

The database (`uparjonai.db`) will be created automatically on first run with all necessary tables.

---

## 🎯 Running the Application

### Option 1: Run Both Servers Separately

**Terminal 1 - Frontend:**
```bash
pnpm dev
```
Frontend will run on: **http://localhost:3000**

**Terminal 2 - Backend:**
```bash
cd backend
python -m uvicorn main:app --reload --port 8000
```
Backend API will run on: **http://localhost:8000**

### Option 2: Development Mode (Recommended)

```bash
# Frontend with Turbopack
pnpm dev

# In another terminal - Backend
cd backend && python -m uvicorn main:app --reload --port 8000
```


## 📁 Project Structure

```
uparjon-ai/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes (Frontend)
│   │   ├── chat/                 # AI Chat endpoints
│   │   │   ├── send/            # Send messages with file upload
│   │   │   ├── history/         # Chat history by session
│   │   │   └── sessions/        # Manage chat sessions
│   │   ├── ai-intelligence/     # AI features
│   │   ├── gamification/        # Achievements & leaderboard
│   │   ├── crypto-rewards/      # Web3 & crypto
│   │   ├── security/            # 2FA, RBAC, audit logs
│   │   └── integrations/        # Third-party services
│   ├── login/                   # Login page
│   ├── signup/                  # Signup page
│   ├── dashboard/               # Main dashboard
│   └── layout.tsx               # Root layout
│
├── components/                   # React Components
│   ├── ui/                      # ShadCN UI components
│   ├── ai-chat.tsx              # AI Chat with file upload
│   ├── ai-intelligence.tsx      # Predictions & analytics
│   ├── gamification.tsx         # Leaderboard & achievements
│   ├── web3-rewards.tsx         # Crypto & NFT features
│   ├── security-compliance.tsx  # Security features
│   ├── integrations-automation.tsx
│   ├── advanced-analytics.tsx   # Reports & ROI
│   ├── payment-dashboard.tsx    # Payment management
│   ├── credit-score.tsx         # Credit profile
│   ├── fraud-detection.tsx      # Fraud alerts
│   ├── workplace-analysis.tsx   # Performance metrics
│   ├── task-submission.tsx      # Task management
│   ├── sidebar.tsx              # Navigation sidebar
│   ├── auth-provider.tsx        # Authentication context
│   └── theme-provider.tsx       # Dark/Light theme
│
├── backend/                      # FastAPI Backend
│   ├── routes/                  # API route handlers
│   │   ├── auth.py             # Authentication
│   │   ├── tasks.py            # Task management
│   │   ├── payments.py         # Payment processing
│   │   ├── fraud.py            # Fraud detection
│   │   ├── ai_intelligence.py  # AI features
│   │   ├── gamification.py     # Achievements
│   │   ├── web3.py             # Crypto & NFT
│   │   ├── security.py         # Security features
│   │   ├── integrations.py     # Third-party APIs
│   │   └── analytics.py        # Reports & analytics
│   ├── models.py               # SQLAlchemy models
│   ├── schemas.py              # Pydantic schemas
│   ├── database.py             # Database connection
│   ├── main.py                 # FastAPI app
│   └── requirements.txt        # Python dependencies
│
├── lib/                         # Utilities
│   ├── db.ts                   # Database initialization
│   ├── utils.ts                # Helper functions
│   └── custom-icons.tsx        # Custom SVG icons
│
├── public/                      # Static assets
├── styles/                      # Global styles
├── .env.local                   # Environment variables (create this)
├── package.json                 # Node dependencies
├── tsconfig.json               # TypeScript config
├── tailwind.config.ts          # Tailwind CSS config
└── README.md                   # This file
```


## 📡 API Documentation

### Frontend API Routes (Next.js)

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/users/:id` - Get user profile

#### AI Chat
- `POST /api/chat/send` - Send message (supports FormData for files)
- `GET /api/chat/history?userId=&sessionId=` - Get chat history
- `GET /api/chat/sessions?userId=` - Get all chat sessions
- `DELETE /api/chat/sessions?sessionId=` - Delete chat session

#### AI Intelligence
- `GET /api/ai-intelligence/predictions?userId=` - Get task predictions
- `GET /api/ai-intelligence/anomalies?userId=` - Detect anomalies
- `GET /api/ai-intelligence/sentiment?userId=` - Sentiment analysis

#### Gamification
- `GET /api/gamification/achievements?userId=` - Get user achievements
- `GET /api/gamification/leaderboard` - Global leaderboard

#### Security
- `POST /api/security/2fa-setup` - Setup 2FA
- `GET /api/security/audit-log?userId=` - Get audit logs
- `POST /api/security/rbac` - Manage roles

#### Web3
- `POST /api/crypto-rewards/wallet` - Connect wallet
- `POST /api/nft-badges/mint` - Mint NFT badge
- `GET /api/crypto-rewards/transactions?userId=` - Transaction history

### Backend API Routes (FastAPI)

Backend runs on `http://localhost:8000`

- `GET /docs` - Interactive API documentation (Swagger UI)
- `POST /seed` - Seed database with sample data
- `GET /users` - List all users
- `POST /tasks/submit` - Submit a task
- `POST /verify` - Verify task authenticity
- `POST /payment` - Process payment
- `GET /credit-score/{user_id}` - Get credit score
- `POST /fraud-detect` - Run fraud detection

---

## 🗄️ Database Schema

The SQLite database (`uparjonai.db`) includes 30+ tables:

### Core Tables
- `users` - User profiles and authentication
- `tasks` - Task submissions and status
- `payments` - Payment transactions
- `payment_methods` - Saved payment methods

### AI & Analytics
- `chat_messages` - Chat history with session IDs and file attachments
- `ai_insights` - AI-generated insights
- `predictions` - Task completion forecasts
- `anomalies` - Detected unusual patterns
- `workplace_analysis` - Performance metrics

### Gamification
- `achievements` - Available achievement definitions
- `user_achievements` - User-earned achievements
- `leaderboard` - Global rankings and streaks

### Security
- `two_factor_auth` - 2FA secrets and backup codes
- `audit_logs` - Complete action tracking
- `user_roles` - RBAC implementation
- `compliance_status` - Compliance certifications

### Web3
- `crypto_wallets` - Connected wallet addresses
- `nft_mints` - Minted NFT badges (nft_metadata column)
- `crypto_transactions` - WPAY token transactions
- `crypto_rewards` - Token earnings

### Integrations
- `integrations` - Third-party service connections
- `webhooks` - Webhook configurations
- `automation_rules` - Task automation rules

### Reports
- `reports` - Generated custom reports
- `export_logs` - Export history tracking

---



## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.




