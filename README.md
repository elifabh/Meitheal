# 🌍 Meitheal: Autonomous Agentic AI System for Food Waste Logistics

![Project Status](https://img.shields.io/badge/Status-Active_Development-success)
![AI Framework](https://img.shields.io/badge/Agentic_AI-Llama_3-orange)
![Backend](https://img.shields.io/badge/Backend-FastAPI_%7C_WebSockets-blue)
![Database](https://img.shields.io/badge/Database-PostgreSQL_%7C_asyncpg-blueviolet)

> **Bridging the gap in urban food waste with real-time, autonomous Agentic AI logistics.**

## 📖 Project Overview

Imagine local cafes, bakeries, and restaurants with perfectly good surplus food at the end of the day, but no efficient way to distribute it to local charities or volunteers before it spoils. The traditional approach requires filling out tedious forms or making multiple phone calls, which often results in the food simply being thrown away.

**Meitheal** (an Irish word describing a cooperative community effort) bridges this gap. It is a comprehensive, AI-driven logistics platform powered by a highly resilient **Agentic AI Architecture**. Rather than acting as a simple directory, the system deploys specialized, autonomous AI agents—an *Extraction Agent* and a *Routing Agent*. Together, they process unstructured data from food businesses via a Telegram bot, automatically categorize food types, allergens, and urgency, and dynamically route the 'rescue mission' to the nearest available community volunteer using real-time geospatial matchmaking and WebSockets.

---

## 🎯 How Can This Project Help

**The Challenge:** Communities face a unique dilemma: tackling the environmental impact of urban food waste while supporting local citizens, all within the extremely tight time constraints of food perishability.

**The Solution:**
* 🧭 **Smarter Logistics:** Real-time geospatial routing connects the closest active volunteer (within a 5km radius) to the food source automatically, ensuring rapid distribution.
* 🗣️ **Frictionless Business Onboarding:** Businesses don't need to learn a new app. They simply send a natural language message (e.g., "We have 5 almond croissants left, need them gone in 2 hours") to the Meitheal Telegram Bot. The AI extracts all logistics parameters instantly.
* 🛡️ **Dynamic Live Map:** Through high-performance WebSockets, community volunteers see emergency "food rescues" pop up on a live dashboard map. High-urgency, perishable items are color-coded (Red/Yellow/Green) to be claimed first.
* 🤝 **Community Building:** Captures the spirit of "Meitheal" by empowering citizens with a highly accessible, gamified volunteer dashboard to claim and complete local rescue missions.

---

## 💡 Technical Novelty and Innovation

The core AI innovation is **Native Agentic Orchestration for Logistics**.

Instead of relying on rigid, hard-coded forms, Meitheal uses a flexible LLM extraction pipeline (powered by Llama 3) to strictly parse messy real-world text into typed JSON schemas (identifying allergens, diet types, and urgency). Then, it pairs this probabilistic AI reasoning with deterministic physical safeguards (calculating precise Haversine distances for volunteer routing). If the AI fails or times out, the system uses resilient fallback mechanisms to ensure the rescue is still broadcasted to the community without crashing the platform.

### Agentic System Architecture

```text
                                  +-------------------+
                                  | Business Request  |
                                  |   (Telegram Bot)  |
                                  +---------+---------+
                                            |
                                  +---------v---------+
                                  | FastAPI Webhook   |
                                  +---------+---------+
                                            |
      +-------------------------------------+-------------------------------------+
      |                                                                           |
+-----v---------------+                                                 +---------v---------+
| Extraction Agent    | ===(Extracts Allergens, Urgency, JSON)===>      | Routing Agent     |
| (LLM Reasoning)     |                                                 | (Geospatial Logic)|
+---------------------+                                                 +---------+---------+
            |                                                                     |
            +=============================+=======================================+
                                          |
                                +---------v---------+
                                | WebSocket Manager |
                                +---------+---------+
                                          |
                                +---------v---------+
                                | Next.js Dashboard |
                                | (Volunteer Map)   |
                                +-------------------+
```

---

## 🛠️ Implementation Plan

### 1. Data Specification
* **Data Sources:** Telegram Webhook/Long Polling for business inputs; Live GPS telemetry from volunteer browsers for geospatial routing.
* **Data Types:** Complex JSON structures for inter-agent communication, async WebSockets for map rendering, and structured SQLAlchemy models for history.
* **Storage & Security:** PostgreSQL with `asyncpg` for high-performance encrypted relational data.

### 2. AI System Framework Specification
* **Core Python Asyncio & FastAPI:** For strict, type-safe schema validation and lightning-fast WebSocket streaming.
* **Specialized Native Agents:**
  * `ExtractionAgent`: Uses Llama-3 to analyze unstructured Telegram messages. Extracts core food items, flags allergens (e.g., gluten, nuts), determines dietary suitability (e.g., vegan), and assigns urgency/pin colors.
  * `RoutingAgent`: A spatial reasoning agent that evaluates all active volunteers on duty and algorithmically assigns the rescue to the strictly optimal candidate within a defined radius.

---

## ✨ Core Application Features

### 1. 🤖 AI-Powered Food Extraction
Businesses simply text the bot. The AI reads between the lines, automatically flagging if a meal contains dairy or nuts, and setting it as a "HIGH" urgency red pin on the map if it's a hot, perishable meal.

### 2. 📍 Live WebSocket Rescue Map
Volunteers monitor a centralized Next.js dashboard equipped with React-Leaflet. As soon as a business texts the bot, a map pin instantly materializes on the volunteer's screen without refreshing the page, displaying the exact dietary tags and pickup location.

### 3. 🛵 Autonomous Volunteer Routing
The system doesn't just broadcast; it calculates. The `RoutingAgent` constantly monitors volunteer locations and intelligently filters candidates, pinging the absolute closest (within 5km) active volunteer to accept the mission.

---

## 🚀 Execution Workflow (How to Test)

1. ▶️ **Initialization:** Run `docker-compose up --build` to simultaneously start the PostgreSQL DB, the FastAPI / Agent backend, and the Next.js frontend.
2. 💬 **Reporting Food:** A restaurant owner sends a message to the configured Meitheal Telegram Bot (e.g., "Closing up! Have 4 vegan wraps, quite perishable").
3. 🧠 **AI Extraction:** The `ExtractionAgent` parses this message in the background, categorizing it as Vegan and High Urgency (Red Pin).
4. ⚡ **Live Broadcast:** The `RoutingAgent` attempts to find a nearby volunteer.
5. 🗺️ **Actioning:** The active rescue is instantly broadcasted via WebSockets to `localhost:3000`. A volunteer clicks the red map marker, reviews the extracted AI data, and clicks "Accept Rescue" to finalize the logistics loop.

---

## 🌍 Expected Impacts

* **Environmental:** Drastic reduction in restaurant-level food waste and associated carbon emissions.
* **Societal:** Strengthening community bonds by reviving the ancient Irish tradition of cooperative labor (Meitheal), directly distributing quality food to those who can use it.
* **Technical:** Proving that asynchronous Agentic AI can reliably orchestrate time-sensitive, real-world physical logistics with zero friction for the end user.

---

## 👤 Author & Producer

**Elif Gul Abdul Halim**
* *AI Engineer & Project Lead*

---

> *"Reviving the ancient Irish tradition of cooperative labor through the power of autonomous AI."* — **Meitheal**
