# Zomato AI: End-to-End Medallion Lakehouse & AI Intelligence Platform

[![Snowflake](https://img.shields.io/badge/Snowflake-Data%20Cloud-29B5E8?style=for-the-badge&logo=snowflake&logoColor=white)](https://www.snowflake.com/)
[![dbt Core](https://img.shields.io/badge/dbt-Core%20v1.8+-FF694B?style=for-the-badge&logo=dbt&logoColor=white)](https://www.getdbt.com/)
[![Apache Airflow](https://img.shields.io/badge/Apache%20Airflow-2.8+-017CEE?style=for-the-badge&logo=apacheairflow&logoColor=white)](https://airflow.apache.org/)
[![Azure Blob](https://img.shields.io/badge/Azure-Blob%20Storage-0078D4?style=for-the-badge&logo=microsoftazure&logoColor=white)](https://azure.microsoft.com/)
[![Groq Cloud](https://img.shields.io/badge/Groq-Qwen%203.8%2027B-F55036?style=for-the-badge&logo=fastapi&logoColor=white)](https://groq.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14%20App%20Router-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%203.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

A production-grade, enterprise data engineering and generative AI platform built on **Zomato food delivery data**. The platform ingests multi-gigabyte transactional workloads into an **Azure Data Lake**, orchestrates medallion transformations with **Apache Airflow** and **dbt Core** in **Snowflake**, enriches unstructured reviews with **Groq LLMs (`qwen/qwen3.8-27b`)**, and serves conversational intelligence through a **ChatGPT flagship-grade web platform** built with **Next.js 14 (App Router), TypeScript, Tailwind CSS, Recharts, and a resilient FastAPI bridge**.

---

## 🏛️ System Architecture

![Zomato AI System Architecture](reference/system%20architecture.png)

The end-to-end architecture is organized into five cohesive layers:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                  SYSTEM ARCHITECTURE                                   │
└────────────────────────────────────────────────────────────────────────────────────────┘

 1. INGESTION & DATA LAKE        2. ORCHESTRATION (AIRFLOW)       3. MEDALLION LAKEHOUSE (SNOWFLAKE)
 ┌──────────────────────┐        ┌───────────────────────┐        ┌──────────────────────────────────┐
 │ • 7 Zomato CSV Files │───────>│ Airflow DAG:          │───────>│ [Bronze] RAW (External Stage)    │
 │   (Orders, Items,    │        │  1. reload_raw        │        │   │                              │
 │    Restaurants, etc.)│        │  2. dbt_build_core    │        │   ▼                              │
 │ • Azure Blob Storage │        │  3. enrich_reviews    │        │ [Silver] STAGING (dbt Views)     │
 │   'raw container'    │        │  4. dbt_build_ai      │        │   │                              │
 └──────────────────────┘        └───────────────────────┘        │   ▼                              │
                                                                  │ [Gold] MARTS (Star Schema Models)│
                                                                  └────────────────┬─────────────────┘
                                                                                   │
 4. AI INTELLIGENCE ENGINE (GROQ + SENTENCE TRANSFORMERS)                          │
 ┌─────────────────────────────────────────────────────────────────────────────────┼─┐
 │ (A) LLM Enrichment    : stg_reviews -> Qwen 3.8 27B -> ZOMATO.AI.REVIEW_ENRICHED│ │
 │ (B) Vector RAG Engine : all-MiniLM-L6-v2 -> review_embeddings.parquet (384-dim) │ │
 │ (C) Text-to-SQL Guard : Snowflake MARTS -> Safe SELECT Regex -> Role: DBT_ROLE <┘ │
 └────────────────────────────────────────┬──────────────────────────────────────────┘
                                          │
 5. SERVING LAYER & FLAGSHIP PLATFORM     │
 ┌────────────────────────────────────────▼──────────────────────────────────────────┐
 │ FastAPI Bridge (:8000) : Query Routing (Auto / RAG / SQL / Dual) + Safe Serializer│
 │ Next.js 14 UI  (:3000) : Neo-Brutalist ChatGPT Flagship + Recharts + Live Reviews │
 └───────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🌟 Key Platform Features

- 🏗️ **Data Engineering & Medallion Lakehouse Architecture**
  - 🥉 **Bronze Tier (Raw Data Lake Ingestion)**: External Snowflake stages connected to Azure Blob Storage with automated, idempotent `COPY INTO` pipelines.
  - 🥈 **Silver Tier (Staging Views)**: dbt staging models (`stg_orders`, `stg_reviews`, `stg_restaurants`, `stg_users`, `stg_food`, `stg_menu`) enforcing schema casting, deduplication, and data quality.
  - 🥇 **Gold Tier (Production Star Schema & Marts)**: Production facts (`fct_orders`, `fact_order_items`), Kimball dimensions (`dim_restaurants`, `dim_customer`, `dim_food`, `dim_date`), and high-performance aggregate marts (`mart_daily_city_revenune`, `mart_restaurant_performance`, `mart_delivery_sla`).
  - 🔄 **Automated Airflow Orchestration DAG**: `zomato_batch` containerized workflow orchestrating `reload_raw >> dbt_build_core >> enrich_reviews >> dbt_build_ai`.

- 🧠 **AI Intelligence & Batch LLM Review Enrichment**
  - 🏷️ **Automated Sentiment Classification**: Groq-hosted `qwen/qwen3.8-27b` classifies customer reviews into structured `positive`, `negative`, and `neutral` sentiment labels.
  - 📈 **Continuous Sentiment Scoring**: Computes granular polarity scores from `-1.0` to `1.0` written directly to Snowflake's `AI.REVIEW_ENRICHED`.
  - 🎯 **Topic & Issue Extraction**: Automatically tags key customer domains (`food quality`, `delivery`, `pricing`, `service`, `packaging`) and extracts concise 6-word issue summaries.
  - ⚡ **Tag-Based dbt AI Modeling**: Downstream `mart_review_insights` builds automatically only after enrichment finishes via dbt's `--select tag:ai`.

- 🔍 **High-Velocity Semantic Vector Search (RAG Engine)**
  - ⚡ **Local Dense Embedding Index**: Encodes customer feedback using `SentenceTransformer("all-MiniLM-L6-v2")` into 384-dimensional normalized dense vectors.
  - 📂 **Zero-Latency Parquet Cache**: Precomputed vectors persist in `review_embeddings.parquet` for instant vector loading and cosine similarity search without remote API latency.
  - 📍 **Dynamic City-Level Scoping**: Automatically filters vector search by sidebar city selection or automatically detects geographic mentions in natural queries.
  - 🛡️ **Grounded Synthesis Guard**: Synthesizes concise answers strictly against top-$k$ retrieved reviews with zero hallucinations.

- 🛡️ **Enterprise Governed Text-to-SQL Guardrails**
  - 🔒 **Read-Only AST & Regex Guard**: Enforces strict `SELECT`/`WITH` query boundaries with whole-word regex (`\bword\b`), blocking all DDL/DML mutations (`DROP`, `DELETE`, `UPDATE`, `INSERT`).
  - 🚫 **Multi-Statement Injection Defense**: Rejects stacked semicolon-delimited SQL to eliminate injection vectors.
  - 🔑 **Least-Privilege Role Access**: Restricts database execution strictly to Snowflake's `DBT_ROLE` scoped only to the `MARTS` schema.
  - 🔄 **Schema Aliasing Resilience**: Automatically handles schema discrepancies and aggregates daily records with `SUM(gmv)`.

- 💻 **Flagship Web Platform (Next.js 14 App Router + FastAPI)**
  - 🎨 **Neo-Brutalist Visual Design System**: High-contrast editorial aesthetic featuring Warm Cream (`#F7F3EA`), Warm Sand (`#EFE9DC`), Charcoal buttons (`#141413`), and Mustard accents (`#F2C94C`).
  - 📊 **Responsive Recharts Visualizations**: Auto-detects 2-column numeric metrics and generates interactive bar charts with hover tooltips, value formatting, and a toggle to inspect the full Data Table.
  - 🔀 **Intelligent Intent Routing (Auto / RAG / SQL / Dual)**: Evaluates prompts to route qualitative inquiries to RAG, business metrics to SQL, and hybrid queries to dual side-by-side payloads.
  - 💬 **Expandable Customer Reviews Drawer**: Live collapsible drawer displaying real Snowflake customer feedback, star rating pills (`X/5 ★`), city tags, and match score percentages.
  - 📋 **Copy SQL Confirmation**: One-click SQL snippet copying with animated `"Copied!"` confirmation badge and collapsible code viewer.
  - 💾 **SSR-Safe Thread Persistence**: Complete `localStorage` session persistence with zero React hydration warnings, dynamic city filtering, and thread management.

---

## 🗂️ Repository Directory Structure

```text
chrollo_zomato_pipline/
├── reference/
│   └── system architecture.png      # End-to-end production architecture diagram
├── airflow/
│   ├── dags/
│   │   └── zomato_batch.py          # Airflow DAG (reload_raw >> dbt_build >> enrich >> dbt_ai)
│   ├── docker-compose.yaml          # Airflow 2.8+ container orchestration
│   └── Dockerfile                   # Airflow custom image with dbt & python dependencies
├── zomato/                          # dbt Core Project
│   ├── dbt_project.yml              # dbt project definition & model paths
│   ├── profiles.yml.example         # Example Snowflake profile template
│   └── models/
│       ├── staging/                 # Silver Layer: Cleaned staging views
│       │   ├── stg_orders.sql
│       │   ├── stg_order_items.sql
│       │   ├── stg_restaurants.sql
│       │   ├── stg_reviews.sql
│       │   └── stg_users.sql
│       └── marts/                   # Gold Layer: Dimensions, facts & business marts
│           ├── dim_customer.sql
│           ├── dim_restaurants.sql
│           ├── dim_food.sql
│           ├── dim_date.sql
│           ├── fct_orders.sql
│           ├── fact_order_items.sql
│           ├── mart_daily_city_revenune.sql
│           ├── mart_restaurant_performance.sql
│           ├── mart_delivery_sla.sql
│           └── mart_review_insights.sql
├── ai/                              # Core AI & LLM Logic
│   ├── .env.example                 # Example AI configuration template
│   ├── enrich_reviews.py            # Batch review classification with Groq
│   ├── rag_chat.py                  # Streamlit prototype for review embeddings search
│   ├── text_to_sql.py               # Streamlit prototype for Text-to-SQL
│   └── review_embeddings.parquet    # Cached 384-dimensional review embeddings
└── platform/                        # Flagship Serving Layer
    ├── api.py                       # High-performance FastAPI bridge (:8000)
    ├── start.ps1                    # One-click Windows PowerShell launcher script
    └── frontend/                    # Next.js 14 App Router Flagship Platform (:3000)
        ├── app/
        │   ├── layout.tsx           # Global font, providers & HTML shell
        │   ├── globals.css          # Neo-brutalist theme tokens & custom shadows
        │   └── page.tsx             # Clean workspace composition layer
        ├── types/
        │   └── chat.ts              # Strict TypeScript interfaces matching FastAPI contract
        ├── lib/
        │   ├── api.ts               # Typed API client with actionable error states
        │   └── utils.ts             # cn() helper & formatting utilities
        ├── hooks/
        │   ├── useChatThreads.ts    # SSR-safe localStorage thread persistence
        │   └── usePlatformMetadata.ts # Live status & metadata polling hook
        └── components/
            ├── layout/              # Sidebar (collapsible) & TopHeader
            ├── chat/                # EmptyState, MessageList, UserMessage, AssistantCard, ChatComposer
            └── artifacts/           # SqlArtifact, MetricsBarChart (Recharts), ReviewsArtifact
```

---

## 📊 Medallion Data Models Specification

| Layer | Model Name | Materialization | Description & Grain |
| :--- | :--- | :--- | :--- |
| **Bronze** | `ZOMATO.RAW.*` | Tables | Ingested via Snowflake external stage from Azure Blob Storage (`orders`, `reviews`, etc.) |
| **Silver** | `stg_orders` | View | Cleaned order timestamps, status filtering, sales calculations |
| **Silver** | `stg_reviews` | View | Filtered non-null customer review comments with star ratings |
| **Silver** | `stg_restaurants` | View | Normalized restaurant profiles, cuisines, cost-for-two |
| **Gold** | `fct_orders` | Incremental/Table | Grain: One row per order with delivery fee, discounts, GMV, and delivery time |
| **Gold** | `dim_restaurants` | Table | Grain: One row per restaurant with ratings and cuisine categorization |
| **Gold** | `dim_customer` | Table | Grain: Customer demographic segments, age bands, and primary cities |
| **Gold** | `mart_daily_city_revenune` | Table | Grain: City × Order Date daily aggregation: `orders`, `cancel_rate`, `gmv`, `aov` |
| **Gold** | `mart_restaurant_performance` | Table | Grain: Restaurant × City performance: total volume, delivered revenue, avg rating |
| **Gold** | `mart_delivery_sla` | Table | Grain: City × Order Hour: p50 delivery minutes, delivered orders, late delivery rate |
| **Gold** | `mart_review_insights` | Table | Grain: Enriched review insights tagged with `tag:ai` joining sentiment to restaurant dimensions |

---

## 🚀 Quickstart & Setup Guide

### 1. Prerequisites
- **Python**: 3.10+ (with `pip` and virtual environment support)
- **Node.js**: v18.0.0+ (Node v20 or v22 recommended) with `npm`
- **Docker & Docker Compose**: For running Airflow locally
- **Snowflake Account**: With permissions to create databases, warehouses (`ZOMATO_WH`), and roles (`DBT_ROLE`)
- **Groq API Key**: Free API key from [Groq Console](https://console.groq.com/) for `qwen/qwen3.8-27b`

---

### 2. Environment Configuration

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/chrollo_zomato_pipline.git
   cd chrollo_zomato_pipline
   ```

2. Configure AI & Snowflake credentials:
   ```bash
   cp ai/.env.example ai/.env
   ```
   Edit `ai/.env` with your actual credentials:
   ```env
   SNOWFLAKE_ACCOUNT=your_snowflake_account
   SNOWFLAKE_USER=your_snowflake_user
   SNOWFLAKE_PASSWORD=your_snowflake_password
   SNOWFLAKE_WAREHOUSE=ZOMATO_WH
   SNOWFLAKE_DATABASE=ZOMATO
   SNOWFLAKE_SCHEMA=STAGING
   GROQ_API_KEY=gsk_your_groq_api_key_here
   ```

3. Configure dbt connection:
   ```bash
   cp zomato/profiles.yml.example zomato/profiles.yml
   ```
   Ensure `zomato/profiles.yml` reflects your Snowflake credentials.

---

### 3. Orchestrating with Apache Airflow (Docker)

To run the automated batch ingestion and transformation pipeline:

```bash
cd airflow
docker-compose up -d
```

1. Open Airflow Web UI at `http://localhost:8080` (default credentials: `airflow` / `airflow`).
2. Add your Snowflake connection under **Admin &rarr; Connections** with `conn_id: snowflake_default`.
3. Unpause and trigger the DAG **`zomato_batch`**.
   - `reload_raw`: Executes `COPY INTO` from Azure Blob storage stage into Snowflake `RAW`.
   - `dbt_build_core`: Compiles and executes staging views, dimensions, facts, and business marts.
   - `enrich_reviews`: Invokes Groq to classify sentiment, topics, and key issues.
   - `dbt_build_ai`: Builds downstream AI review marts (`mart_review_insights`).

---

### 4. Running the Flagship Platform (UI + API)

You can launch both the **FastAPI Bridge** (port 8000) and the **Next.js Frontend** (port 3000) simultaneously with a single command using the provided launcher:

#### Option A: One-Click PowerShell Launcher (Windows)
```powershell
powershell -ExecutionPolicy Bypass -File platform/start.ps1
```

#### Option B: Manual Terminal Execution

**Terminal 1 — Start FastAPI Bridge (:8000):**
```bash
# Activate your python virtual environment first
python -m uvicorn api:app --app-dir platform --host 0.0.0.0 --port 8000
```

**Terminal 2 — Start Next.js Frontend (:3000):**
```bash
cd platform/frontend
npm install
npm run dev
```

Visit **`http://localhost:3000`** in your browser.

---

## 📡 FastAPI Bridge API Reference

The backend bridge runs on `http://localhost:8000` with CORS enabled for frontend clients.

### 1. `GET /api/health`
Checks system health, Snowflake connectivity, and review embedding cache status.

**Response (HTTP 200):**
```json
{
  "status": "ok",
  "model": "qwen/qwen3.8-27b",
  "total_reviews": 500,
  "snowflake_configured": true
}
```

### 2. `GET /api/metadata`
Returns all unique cities available in the vector index and model information.

**Response (HTTP 200):**
```json
{
  "cities": ["All Cities", "Bangalore", "Delhi", "Mumbai", "Hyderabad", "Pune", ...],
  "model": "qwen/qwen3.8-27b",
  "total_reviews": 500
}
```

### 3. `POST /api/chat`
Unified endpoint for qualitative customer review queries, quantitative Snowflake SQL metrics, and hybrid questions.

**Request Payload:**
```json
{
  "question": "Top 10 cities by GMV",
  "mode": "auto",
  "city": "All Cities"
}
```

**Response Payload (SQL Mode Example):**
```json
{
  "mode_used": "sql",
  "answer": "Bangalore leads with a total delivered GMV of 536,698,846, followed by Delhi at 407,092,721.",
  "sql_result": {
    "sql": "SELECT city, SUM(gmv) AS total_gmv FROM MART_DAILY_CITY_REVENUNE GROUP BY city ORDER BY total_gmv DESC LIMIT 10",
    "columns": ["city", "total_gmv"],
    "rows": [
      { "city": "Bangalore", "total_gmv": 536698846.0 },
      { "city": "Delhi", "total_gmv": 407092721.0 }
    ],
    "row_count": 10,
    "can_chart": true,
    "chart_title": "Total Gmv by City",
    "value_suffix": ""
  },
  "sources": [],
  "latency_ms": 312
}
```

---

## 🔒 Security & Governance

1. **Zero Hardcoded Secrets**: All Snowflake credentials and Groq API keys are loaded strictly from environment variables. Git ignores `.env`, `profiles.yml`, and raw data directories.
2. **SQL Injection Defense**: Every SQL statement generated by the LLM is validated via `is_safe_sql()` before reaching the database driver:
   - Must start with `SELECT` or `WITH`.
   - Prohibits DDL and DML operations using regex word boundaries (`\b(drop|delete|truncate|alter|update|insert|create|grant|revoke)\b`).
   - Rejects multiple semicolon-delimited queries to prevent statement stacking.
3. **Snowflake Role-Based Access Control (RBAC)**: All queries are executed using `DBT_ROLE`, which has strictly read-only access to `ZOMATO.MARTS`.
4. **Resilient Type Serialization**: Safely transforms Snowflake and Pandas primitives (`Decimal`, `NaN`, `NaT`, `Timestamp`, `date`) into standard JSON types to guarantee zero FastAPI HTTP 500 serialization crashes.

---


## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
