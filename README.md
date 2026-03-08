# 🌍 Meitheal: Autonomous Agentic AI System for Food Waste Logistics

![Project Status](https://img.shields.io/badge/Status-Active_Development-success)
![Python](https://img.shields.io/badge/Python-3.10%2B-blue)
![AI Framework](https://img.shields.io/badge/Agentic_AI-Llama_3-orange)
![Infrastructure](https://img.shields.io/badge/Backend-FastAPI_%7C_WebSockets-green)

> **Bridging the gap in urban food waste with real-time, autonomous Agentic AI logistics.**

## 📖 Project Overview

**Meitheal** (an Irish word describing a cooperative community effort) is a comprehensive, AI-driven logistics platform. It addresses the critical issue of urban food waste—where perfectly good surplus food from local cafes and restaurants is thrown away due to a lack of efficient distribution to charities or volunteers.

By deploying specialized, autonomous **AI agents (Extraction and Routing)**, Meitheal processes unstructured data from food businesses, categorizes it, and dynamically routes a "rescue mission" to the nearest available community volunteer using real-time geospatial matchmaking.

### 🏆 Key Innovation
Unlike traditional directory apps, Meitheal features **Native Agentic Orchestration**. It doesn't rely on rigid forms; instead, it uses a flexible LLM pipeline to parse messy real-world text into typed JSON schemas, instantly turning a natural language message into a live, strictly calculated geospatial rescue mission.

---

## 🚀 Core Application Features

The project features a highly responsive **Live WebSocket Dashboard** built with Next.js and React-Leaflet.

| Feature | Description |
| :--- | :--- |
| **🤖 AI-Powered Extraction** | Businesses send natural text (e.g., "5 vegan wraps left"). The AI extracts allergens, diet types, and assigns urgency automatically. |
| **📍 Live WebSocket Map** | Volunteers monitor a centralized dashboard. Map pins materialize instantly without page refreshes. |
| **🛵 Autonomous Routing** | The `RoutingAgent` monitors active volunteers and intelligently pings the closest candidate (within 5km). |
| **🗣️ Frictionless Onboarding** | Businesses use a Telegram Bot. No new apps to learn, just natural language messaging. |
| **🤝 Community Building** | Empowers citizens with a gamified volunteer dashboard, reviving the cooperative spirit of "Meitheal". |

---

## 🛠️ Technical Architecture

The system operates on a robust, multi-agent architecture:

1.  **Ingestion Layer (Telegram/Webhooks):** Securely receives unstructured natural language inputs from businesses.
2.  **Agentic AI Core (The Brain):**
    * **Extraction Agent (Llama-3):** Analyzes text, flags allergens, determines dietary suitability, and sets urgency.
    * **Routing Agent:** Evaluates active volunteers and algorithmically assigns the rescue to the optimal candidate.
3.  **Execution Layer (FastAPI/WebSockets):** Streams high-performance data to the Next.js frontend, rendering live maps instantly via PostgreSQL & `asyncpg`.

---

## 💻 Installation & Usage

### Prerequisites
* Docker & Docker Compose
* Python 3.10+ (for local testing)

### 1. Clone the Repository
```bash
git clone https://github.com/elifabh/Meitheal.git
cd Meitheal
```

### 2. Launch the Platform
Run the following command to simultaneously start the PostgreSQL DB, FastAPI backend, and Next.js frontend:
```bash
docker-compose up --build
```

### 3. Access the Dashboard
Open your browser to view the live volunteer map:
`http://localhost:3000`

### 4. Trigger a Rescue (Simulation)
Send a message to the configured Telegram Bot (e.g., *"Closing up! Have 4 vegan wraps, quite perishable"*). Watch the AI parse it and the red pin appear instantly on your map!

---

## 📂 Project Structure

```text
Meitheal/
├── app/                     # Backend: FastAPI & AI Agents
│   ├── agents/              # Extraction and Routing Agent logic
│   ├── main.py              # FastAPI Webhooks & WebSocket Manager
│   └── models.py            # SQLAlchemy DB Models
├── frontend/                # Frontend: Next.js & React-Leaflet
│   └── components/          # Map rendering and volunteer dashboard
├── alembic/                 # Database Migrations
├── scripts/                 # Utility scripts
├── docker-compose.yml       # Container Orchestration
├── requirements.txt         # Python Dependencies
└── README.md                # Project Documentation
```

---

## 🌍 Impact Analysis

* **Environmental:** Drastic reduction in restaurant-level food waste and associated carbon emissions.
* **Societal:** Strengthening community bonds by directly distributing quality food to those who can use it.
* **Technical:** Proving that asynchronous Agentic AI can reliably orchestrate time-sensitive, real-world physical logistics with zero friction.

---

## 👤 Author & Producer

**Elif Gul Abdul Halim**

* *AI Engineer & Project Lead*

---

> *"Reviving the ancient Irish tradition of cooperative labor through the power of autonomous AI."* — **Meitheal**
